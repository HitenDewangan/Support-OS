import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["superadmin", "businessAdmin", "agent", "customer"],
      required: [true, "Role is required"],
    },
    companyName: {
      type: String,
      required: function () {
        return this.role === "businessAdmin";
      },
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "agent";
      },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    tenantId: {
      type: String,
      sparse: true,
      unique: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash refresh token before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("refreshToken") || !this.refreshToken) return next();

  const salt = await bcrypt.genSalt(12);
  this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
  next();
});

// Compare refresh token method
userSchema.methods.compareRefreshToken = async function (candidateToken) {
  if (!this.refreshToken) return false;
  return await bcrypt.compare(candidateToken, this.refreshToken);
};

const User = mongoose.model("User", userSchema);

export default User;
