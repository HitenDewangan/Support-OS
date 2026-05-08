import express from "express";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware.js";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addMessage,
  getAISuggestions,
} from "../controllers/ticketController.js";

const router = express.Router();

router.use(verifyToken);

// Ticket CRUD
router.post("/", authorizeRole("customer"), createTicket);
router.get("/", authorizeRole("customer", "agent", "businessAdmin", "superadmin"), getTickets);
router.get("/:id", authorizeRole("customer", "agent", "businessAdmin", "superadmin"), getTicketById);
router.patch("/:id", authorizeRole("agent", "businessAdmin", "superadmin"), updateTicket);

// Messages
router.post("/:id/messages", authorizeRole("customer", "agent"), addMessage);

export default router;
