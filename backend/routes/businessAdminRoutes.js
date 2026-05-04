import express from "express";
import { getMyAgents, inviteAgent } from "../controllers/adminController.js";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole("businessAdmin"));

router.get("/agents", getMyAgents);
router.post("/agents/invite", inviteAgent);

export default router;
