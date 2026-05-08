import express from "express";
import passport from "passport";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import {
  registerBusiness,
  registerCustomer,
  registerAgent,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
  getBusinesses,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Google OAuth routes
router.get(
  "/google",
  (req, res, next) => {
    // Store role and businessId in session for callback
    req.session.oauthRole = req.query.role || "customer";
    req.session.oauthBusinessId = req.query.businessId || null;
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }

      // Generate tokens
      const accessToken = generateAccessToken(req.user._id, req.user.role);
      const newRefreshToken = generateRefreshToken(req.user._id);

      // Hash and save refresh token
      req.user.refreshToken = newRefreshToken;
      req.user
        .save()
        .catch((err) => console.error("Error saving refresh token:", err));

      // Set refresh token as HttpOnly cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend callback with access token
      res.redirect(
        `${process.env.CLIENT_URL}/oauth/callback?token=${accessToken}`,
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  },
);

// Regular auth routes
router.post("/register/business", registerBusiness);
router.post("/register/customer", registerCustomer);
router.post("/register/agent", registerAgent);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", verifyToken, logoutUser);
router.get("/me", verifyToken, getMe);
router.get("/businesses", getBusinesses);

export default router;
