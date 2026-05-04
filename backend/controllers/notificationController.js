import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

// @route   GET /notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.json({ success: true, notifications, unreadCount });
});

// @route   PATCH /notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

// @route   PATCH /notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true }
  );
  res.json({ success: true });
});
