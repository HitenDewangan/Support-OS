import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    subject: { type: String, required: [true, "Subject is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    category: {
      type: String,
      enum: ["technical", "billing", "account", "feature"],
      default: "technical",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "escalated", "closed"],
      default: "open",
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedBy: { type: String, enum: ["ai", "agent", null], default: null },
    resolvedAt: { type: Date, default: null },
    aiHandled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
