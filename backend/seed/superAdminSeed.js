import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const seedSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });

    if (existingSuperAdmin) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: "superadmin",
      isApproved: true,
    });

    console.log("Super admin created successfully:", {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding super admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
