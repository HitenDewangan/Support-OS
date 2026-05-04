import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["ticket", "message", "system"], default: "ticket" },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
