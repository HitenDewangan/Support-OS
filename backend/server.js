import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import businessAdminRoutes from "./routes/businessAdminRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { setIO } from "./utils/socketManager.js";
import jwt from "jsonwebtoken";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
setIO(io);

io.on("connection", (socket) => {
  // Join user-specific room so we can send personal notifications
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.join(`user:${decoded.userId}`);
    } catch (_) {}
  }

  socket.on("join-room", ({ ticketId }) => {
    if (ticketId) socket.join(ticketId);
  });

  socket.on("leave-room", ({ ticketId }) => {
    if (ticketId) socket.leave(ticketId);
  });

  socket.on("typing", ({ ticketId, isTyping, senderName }) => {
    socket.to(ticketId).emit("user-typing", { isTyping, senderName });
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, displayName, photos } = profile;

        const role = req.session.oauthRole || "customer";
        const businessId = req.session.oauthBusinessId || null;

        delete req.session.oauthRole;
        delete req.session.oauthBusinessId;

        if (role === "agent" && !businessId) {
          return done(
            new Error("businessId is required for agent Google sign-in"),
            null,
          );
        }

        let user = await User.findOne({
          $or: [{ googleId: id }, { email: emails[0].value }],
        });

        if (user) {
          if (!user.googleId) {
            user.googleId = id;
            user.avatar = photos[0].value;
            await user.save();
          }
        } else {
          const isApproved = role !== "businessAdmin";
          const companyName =
            role === "businessAdmin" ? `${displayName}'s Company` : undefined;

          user = await User.create({
            name: displayName,
            email: emails[0].value,
            googleId: id,
            avatar: photos[0]?.value,
            role,
            isApproved,
            companyName,
            ...(businessId && { businessId }),
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/business", businessAdminRoutes);
app.use("/tickets", ticketRoutes);
app.use("/ai", aiRoutes);
app.use("/notifications", notificationRoutes);

app.get("/health", (req, res) => res.json({ status: "OK" }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
