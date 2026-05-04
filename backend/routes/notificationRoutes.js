import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.patch("/read-all", verifyToken, markAllAsRead);
router.patch("/:id/read", verifyToken, markAsRead);

export default router;
