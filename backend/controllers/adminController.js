import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Invite from "../models/Invite.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getIO } from "../utils/socketManager.js";
import crypto from "crypto";

// @desc    Get all businesses
// @route   GET /admin/businesses
// @access  Private (Super Admin)
export const getBusinesses = asyncHandler(async (req, res) => {
  const businesses = await User.find({ role: "businessAdmin" })
    .select("name email companyName tenantId isApproved createdAt")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: businesses.length,
    businesses,
  });
});

// @desc    Get pending business approvals
// @route   GET /admin/pending
// @access  Private (Super Admin)
export const getPendingBusinesses = asyncHandler(async (req, res) => {
  const pendingBusinesses = await User.find({
    role: "businessAdmin",
    isApproved: false,
  })
    .select("name email companyName createdAt")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: pendingBusinesses.length,
    businesses: pendingBusinesses,
  });
});

// @desc    Approve business admin
// @route   PATCH /admin/users/:id/approve
// @access  Private (Super Admin)
export const approveBusiness = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.role !== "businessAdmin") {
    res.status(404);
    throw new Error("Business admin not found");
  }

  if (user.isApproved) {
    res.status(400);
    throw new Error("User is already approved");
  }

  user.isApproved = true;
  await user.save();

  // Send approval email
  const approvalEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Congratulations! Your Account Has Been Approved</h2>
      <p>Dear ${user.name},</p>
      <p>Your business admin account for <strong>${user.companyName}</strong> has been approved by our super admin.</p>
      <p>You can now log in to your account and start managing your support platform.</p>
      <p>Best regards,<br>AI Support Platform Team</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Account Approved - AI Support Platform",
      html: approvalEmailHtml,
    });
  } catch (emailError) {
    console.error("Failed to send approval email:", emailError);
  }

  res.json({
    success: true,
    message: "Business admin approved successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      isApproved: user.isApproved,
    },
  });
});

// @desc    Reject business admin
// @route   PATCH /admin/users/:id/reject
// @access  Private (Super Admin)
export const rejectBusiness = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.role !== "businessAdmin") {
    res.status(404);
    throw new Error("Business admin not found");
  }

  if (user.isApproved) {
    res.status(400);
    throw new Error("Cannot reject an already approved user");
  }

  // Delete the user
  await User.findByIdAndDelete(req.params.id);

  // Send rejection email
  const rejectionEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Account Registration Rejected</h2>
      <p>Dear ${user.name},</p>
      <p>We regret to inform you that your business admin account registration for <strong>${user.companyName}</strong> has been rejected.</p>
      <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
      <p>Best regards,<br>AI Support Platform Team</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Account Registration Rejected - AI Support Platform",
      html: rejectionEmailHtml,
    });
  } catch (emailError) {
    console.error("Failed to send rejection email:", emailError);
  }

  res.json({
    success: true,
    message: "Business admin registration rejected and user deleted",
  });
});

// @desc    Get admin platform stats
// @route   GET /admin/stats
// @access  Private (Super Admin)
export const getAdminStats = asyncHandler(async (req, res) => {
  const totalBusinesses = await User.countDocuments({ role: "businessAdmin" });
  const approvedBusinesses = await User.countDocuments({ role: "businessAdmin", isApproved: true });
  const pendingBusinesses = await User.countDocuments({ role: "businessAdmin", isApproved: false });
  const totalAgents = await User.countDocuments({ role: "agent" });
  const totalCustomers = await User.countDocuments({ role: "customer" });
  const totalUsers = await User.countDocuments();

  res.json({
    success: true,
    stats: {
      totalBusinesses,
      approvedBusinesses,
      pendingBusinesses,
      totalAgents,
      totalCustomers,
      totalUsers,
    },
  });
});

// @desc    Get agents for a business
// @route   GET /business/agents
// @access  Private (Business Admin)
export const getMyAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({
    role: "agent",
    businessId: req.user._id,
  }).select("name email avatar createdAt isApproved");

  res.json({
    success: true,
    count: agents.length,
    agents,
  });
});

// @desc    Create a new tenant (business admin) directly by super admin
// @route   POST /admin/create-tenant
// @access  Private (Super Admin)
export const createTenant = asyncHandler(async (req, res) => {
  const { name, email, companyName, tenantId, password } = req.body;

  if (!name || !email || !companyName || !tenantId || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  const tenantIdExists = await User.findOne({ tenantId });
  if (tenantIdExists) {
    res.status(400);
    throw new Error("Business ID is already taken");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "businessAdmin",
    companyName,
    tenantId,
    isApproved: true,
  });

  // Notification for superadmin: tenant was created
  const adminNotif = await Notification.create({
    userId: req.user._id,
    title: "New Tenant Created",
    message: `Business "${companyName}" (${tenantId}) has been set up successfully.`,
    type: "system",
  });

  // Welcome notification for the new business admin (visible on first login)
  const bizNotif = await Notification.create({
    userId: user._id,
    title: "Welcome to SupportOS!",
    message: `Your business account for "${companyName}" is ready. Start by inviting agents.`,
    type: "system",
  });

  // Push live socket events
  const io = getIO();
  if (io) {
    io.to(`user:${req.user._id}`).emit("notification", adminNotif);
    io.to(`user:${user._id}`).emit("notification", bizNotif);
  }

  res.status(201).json({
    success: true,
    message: "Tenant created successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      tenantId: user.tenantId,
      isApproved: user.isApproved,
    },
  });
});

// @desc    Invite agent
// @route   POST /business/agents/invite
// @access  Private (Business Admin)
export const inviteAgent = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Check if invite already exists
  const existingInvite = await Invite.findOne({ email });
  if (existingInvite) {
    res.status(400);
    throw new Error("Invite already sent to this email");
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");

  // Create invite
  const invite = await Invite.create({
    email,
    token,
    businessId: req.user._id,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
  });

  // Send invite email
  const inviteLink = `${process.env.CLIENT_URL}/register/agent?token=${token}&email=${email}`;
  const inviteEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">You're Invited to Join Our Support Team!</h2>
      <p>You have been invited to join the support team for <strong>${req.user.companyName}</strong>.</p>
      <p>Please click the link below to complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
      </div>
      <p>This invitation will expire in 48 hours.</p>
      <p>If you didn't expect this invitation, please ignore this email.</p>
      <p>Best regards,<br>${req.user.companyName} Team</p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: `Invitation to join ${req.user.companyName} Support Team`,
      html: inviteEmailHtml,
    });
  } catch (emailError) {
    console.error("Failed to send invite email:", emailError);
    // Delete the invite if email fails
    await Invite.findByIdAndDelete(invite._id);
    res.status(500);
    throw new Error("Failed to send invitation email");
  }

  res.json({
    success: true,
    message: "Agent invitation sent successfully",
    invite: {
      email: invite.email,
      expiresAt: invite.expiresAt,
    },
  });
});
