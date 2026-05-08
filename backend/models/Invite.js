import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Business ID is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
    },
  },
  {
    timestamps: true,
  },
);

const Invite = mongoose.model("Invite", inviteSchema);

export default Invite;
