import express from "express";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware.js";
import { getAISuggestions } from "../controllers/ticketController.js";

const router = express.Router();

router.use(verifyToken);
router.get("/suggested-reply/:ticketId", authorizeRole("agent", "businessAdmin"), getAISuggestions);

export default router;
