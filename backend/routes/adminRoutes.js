import express from "express";
import {
  getBusinesses,
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  getAdminStats,
  createTenant,
} from "../controllers/adminController.js";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication and super admin role
router.use(verifyToken);
router.use(authorizeRole("superadmin"));

router.get("/stats", getAdminStats);
router.get("/businesses", getBusinesses);
router.get("/pending", getPendingBusinesses);
router.post("/create-tenant", createTenant);
router.patch("/users/:id/approve", approveBusiness);
router.patch("/users/:id/reject", rejectBusiness);

export default router;
