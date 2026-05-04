import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Invite from "../models/Invite.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// @desc    Register business admin
// @route   POST /auth/register/business
// @access  Public
export const registerBusiness = asyncHandler(async (req, res) => {
  const { name, email, password, companyName } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: "businessAdmin",
    companyName,
    isApproved: false,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message:
        "Business admin registration submitted. Awaiting approval from super admin.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        isApproved: user.isApproved,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Register customer
// @route   POST /auth/register/customer
// @access  Public
export const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user without businessId — they select business at login
  const user = await User.create({
    name,
    email,
    password,
    role: "customer",
    isApproved: true,
  });

  if (user) {
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save hashed refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Register agent
// @route   POST /auth/register/agent
// @access  Public
export const registerAgent = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Find invite
  const invite = await Invite.findOne({ token });
  if (!invite) {
    res.status(400);
    throw new Error("Invalid or expired invite token");
  }

  // Check if token is expired
  if (invite.expiresAt < new Date()) {
    await Invite.findByIdAndDelete(invite._id);
    res.status(400);
    throw new Error("Invite token has expired");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: invite.email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name: invite.email.split("@")[0], // Use email prefix as name initially
    email: invite.email,
    password,
    role: "agent",
    businessId: invite.businessId,
    isApproved: true,
  });

  if (user) {
    // Delete invite
    await Invite.findByIdAndDelete(invite._id);

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save hashed refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Agent registered successfully",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        avatar: user.avatar,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Check if user is approved
  if (!user.isApproved) {
    res.status(403);
    throw new Error("Account pending approval");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save hashed refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // For customers: return list of live businesses so they can pick one
  let businesses = [];
  if (user.role === "customer") {
    businesses = await User.find({ role: "businessAdmin", isApproved: true })
      .select("_id companyName name")
      .lean();
  }

  res.json({
    success: true,
    message: "Login successful",
    accessToken,
    businesses,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      tenantId: user.tenantId,
      businessId: user.businessId,
      avatar: user.avatar,
    },
  });
});

// @desc    Refresh access token
// @route   POST /auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Verify refresh token matches stored hash
    const isValid = await user.compareRefreshToken(token);
    if (!isValid) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }
});

// @desc    Logout user
// @route   POST /auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;

  if (token) {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  // Clear cookie
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get current user
// @route   GET /auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @desc    Get all live businesses (for customer business selector)
// @route   GET /auth/businesses
// @access  Public
export const getBusinesses = asyncHandler(async (req, res) => {
  const businesses = await User.find({ role: "businessAdmin", isApproved: true })
    .select("_id companyName name")
    .lean();
  res.json({ success: true, businesses });
});
