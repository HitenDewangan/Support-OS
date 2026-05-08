import asyncHandler from "express-async-handler";
import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { handleTicketWithAI, chatWithAI, getSuggestedReplies } from "../utils/aiHandler.js";
import { getIO } from "../utils/socketManager.js";

const findAvailableAgent = async (businessId) => {
  return await User.findOne({ businessId, role: "agent", isApproved: true });
};

const emitToTicket = (ticketId, event, data) => {
  const io = getIO();
  if (io) io.to(ticketId.toString()).emit(event, data);
};

// Create a notification in DB and emit it via socket to that user
const pushNotification = async (userId, { title, message, type = "ticket", ticketId }) => {
  try {
    const notification = await Notification.create({ userId, title, message, type, ticketId });
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit("notification", {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        ticketId: notification.ticketId,
        read: false,
        createdAt: notification.createdAt,
      });
    }
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// @route   POST /tickets
// @access  Customer
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority } = req.body;

  if (!subject || !description) {
    res.status(400);
    throw new Error("Subject and description are required");
  }

  const businessId = req.body.businessId || req.user.businessId;
  if (!businessId) {
    res.status(400);
    throw new Error("Please select a business before submitting a ticket");
  }

  const ticket = await Ticket.create({
    subject,
    description,
    category: category || "technical",
    priority: priority || "medium",
    customerId: req.user._id,
    businessId,
  });

  // Save customer's initial message
  await Message.create({
    ticketId: ticket._id,
    sender: "customer",
    senderId: req.user._id,
    content: description,
  });

  // Notify customer: ticket submitted
  await pushNotification(req.user._id, {
    title: "Ticket Submitted",
    message: `Your ticket "${subject}" has been received. We'll respond shortly.`,
    type: "ticket",
    ticketId: ticket._id,
  });

  // Notify businessAdmin: new ticket came in
  const admin = await User.findById(businessId);
  if (admin) {
    await pushNotification(admin._id, {
      title: "New Ticket",
      message: `${req.user.name} submitted a new ticket: "${subject}"`,
      type: "ticket",
      ticketId: ticket._id,
    });
  }

  // Run AI in background — don't block the response
  setImmediate(() => processWithAI(ticket));

  res.status(201).json({ success: true, ticket });
});

const processWithAI = async (ticket) => {
  try {
    // Show AI typing indicator
    emitToTicket(ticket._id, "user-typing", { isTyping: true, senderName: "AI Assistant" });

    const messages = await Message.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
    const reply = await chatWithAI(ticket, messages);

    const aiMessage = await Message.create({
      ticketId: ticket._id,
      sender: "ai",
      content: reply,
    });

    // Clear typing indicator
    emitToTicket(ticket._id, "user-typing", { isTyping: false, senderName: "AI Assistant" });

    emitToTicket(ticket._id, "new-message", {
      _id: aiMessage._id,
      sender: "ai",
      content: aiMessage.content,
      createdAt: aiMessage.createdAt,
    });

    // Assign agent for human backup
    const agent = await findAvailableAgent(ticket.businessId);
    const update = { status: "in-progress" };
    if (agent) update.assignedTo = agent._id;

    await Ticket.findByIdAndUpdate(ticket._id, update);
    emitToTicket(ticket._id, "ticket-updated", update);

    // Notify customer: AI has replied
    await pushNotification(ticket.customerId, {
      title: "AI Replied to Your Ticket",
      message: `AI has responded to your ticket "${ticket.subject}". Check the reply!`,
      type: "ticket",
      ticketId: ticket._id,
    });

    // Notify assigned agent
    if (agent) {
      await pushNotification(agent._id, {
        title: "New Ticket Assigned",
        message: `A new ticket has been assigned to you: "${ticket.subject}"`,
        type: "ticket",
        ticketId: ticket._id,
      });
    }
  } catch (err) {
    console.error("AI processing error:", err.message);
    emitToTicket(ticket._id, "user-typing", { isTyping: false, senderName: "AI Assistant" });
  }
};

// @route   GET /tickets
// @access  Customer (own) | Agent (assigned) | BusinessAdmin (all business)
export const getTickets = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const filter = {};

  if (req.user.role === "customer") {
    filter.customerId = req.user._id;
    if (req.query.businessId) filter.businessId = req.query.businessId;
  } else if (req.user.role === "agent") {
    filter.assignedTo = req.user._id;
    filter.businessId = req.user.businessId;
  } else if (req.user.role === "businessAdmin") {
    filter.businessId = req.user._id;
  }

  if (status && status !== "all") filter.status = status;
  if (priority && priority !== "all") filter.priority = priority;

  const tickets = await Ticket.find(filter)
    .populate("customerId", "name email")
    .populate("assignedTo", "name email")
    .sort({ updatedAt: -1 });

  res.json({ success: true, tickets });
});

// @route   GET /tickets/:id
// @access  Customer (own) | Agent (assigned) | BusinessAdmin
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("customerId", "name email")
    .populate("assignedTo", "name email");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const isOwner = ticket.customerId._id.toString() === req.user._id.toString();
  const isAssignedAgent =
    ticket.assignedTo &&
    ticket.assignedTo._id.toString() === req.user._id.toString();
  const isBusinessAdmin =
    req.user.role === "businessAdmin" &&
    ticket.businessId.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === "superadmin";

  if (!isOwner && !isAssignedAgent && !isBusinessAdmin && !isSuperAdmin) {
    const isBizAgent =
      req.user.role === "agent" &&
      req.user.businessId &&
      req.user.businessId.toString() === ticket.businessId.toString();
    if (!isBizAgent) {
      res.status(403);
      throw new Error("Not authorized to view this ticket");
    }
  }

  const messages = await Message.find({ ticketId: ticket._id })
    .populate("senderId", "name")
    .sort({ createdAt: 1 });

  res.json({ success: true, ticket, messages });
});

// @route   PATCH /tickets/:id
// @access  Agent | BusinessAdmin
export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const allowed = ["status", "priority", "assignedTo"];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.status === "resolved" && !ticket.resolvedAt) {
    updates.resolvedBy = "agent";
    updates.resolvedAt = new Date();
  }

  const updated = await Ticket.findByIdAndUpdate(ticket._id, updates, { new: true })
    .populate("customerId", "name email")
    .populate("assignedTo", "name email");

  emitToTicket(ticket._id, "ticket-updated", updates);

  // Notify customer when ticket is resolved by agent
  if (updates.status === "resolved") {
    await pushNotification(ticket.customerId, {
      title: "Ticket Resolved",
      message: `Your ticket "${ticket.subject}" has been resolved by an agent.`,
      type: "ticket",
      ticketId: ticket._id,
    });
  }

  // Notify new assigned agent
  if (updates.assignedTo) {
    await pushNotification(updates.assignedTo, {
      title: "Ticket Assigned to You",
      message: `Ticket "${ticket.subject}" has been assigned to you.`,
      type: "ticket",
      ticketId: ticket._id,
    });
  }

  res.json({ success: true, ticket: updated });
});

// @route   POST /tickets/:id/messages
// @access  Customer (own ticket) | Agent
export const addMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    res.status(400);
    throw new Error("Message content is required");
  }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const senderRole = req.user.role === "customer" ? "customer" : "agent";

  const message = await Message.create({
    ticketId: ticket._id,
    sender: senderRole,
    senderId: req.user._id,
    content: content.trim(),
  });

  await message.populate("senderId", "name");
  await Ticket.findByIdAndUpdate(ticket._id, { updatedAt: new Date() });

  emitToTicket(ticket._id, "new-message", {
    _id: message._id,
    sender: message.sender,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt,
  });

  if (senderRole === "agent") {
    // Notify customer: agent replied
    await pushNotification(ticket.customerId, {
      title: "New Reply on Your Ticket",
      message: `An agent replied to your ticket "${ticket.subject}"`,
      type: "message",
      ticketId: ticket._id,
    });
  } else {
    // Notify assigned agent: customer replied
    if (ticket.assignedTo) {
      await pushNotification(ticket.assignedTo, {
        title: "Customer Replied",
        message: `${req.user.name} replied on ticket "${ticket.subject}"`,
        type: "message",
        ticketId: ticket._id,
      });
    }
    // Always trigger AI reply for customer messages
    setImmediate(() => triggerAIReply(ticket));
  }

  res.status(201).json({ success: true, message });
});

const triggerAIReply = async (ticket) => {
  console.log("[triggerAIReply] called for ticket:", ticket._id?.toString());
  try {
    // Show AI typing indicator to all chat participants
    emitToTicket(ticket._id, "user-typing", { isTyping: true, senderName: "AI Assistant" });

    const messages = await Message.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
    const reply = await chatWithAI(ticket, messages);

    // Clear typing indicator regardless of result
    emitToTicket(ticket._id, "user-typing", { isTyping: false, senderName: "AI Assistant" });

    if (!reply) return; // Gemini failed — no fallback message saved

    const aiMessage = await Message.create({
      ticketId: ticket._id,
      sender: "ai",
      content: reply,
    });

    emitToTicket(ticket._id, "new-message", {
      _id: aiMessage._id,
      sender: "ai",
      content: aiMessage.content,
      createdAt: aiMessage.createdAt,
    });

    await pushNotification(ticket.customerId, {
      title: "AI Replied",
      message: `AI responded on ticket "${ticket.subject}"`,
      type: "message",
      ticketId: ticket._id,
    });
  } catch (err) {
    console.error("AI reply error:", err.message);
    emitToTicket(ticket._id, "user-typing", { isTyping: false, senderName: "AI Assistant" });
  }
};

// @route   GET /ai/suggested-reply/:ticketId
// @access  Agent
export const getAISuggestions = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const messages = await Message.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
  const suggestions = await getSuggestedReplies(ticket, messages);

  res.json({ success: true, ...suggestions });
});
