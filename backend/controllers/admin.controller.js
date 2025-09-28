import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Admin } from "../models/admin.model.js";

// ===================== SIGNUP =====================
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const adminSchema = z.object({
    firstName: z.string().min(3, { message: "firstName must be at least 3 characters long" }),
    lastName: z.string().min(3, { message: "lastName must be at least 3 characters long" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "password must be at least 6 characters long" }),
  });

  const validatedData = adminSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ errors: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Signup succeeded", newAdmin });
  } catch (error) {
    console.log("Error in signup:", error);
    res.status(500).json({ errors: "Error in signup" });
  }
};

// ===================== LOGIN =====================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id },
      config.JWT_ADMIN_PASSWORD,
      { expiresIn: "1d" }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, // Not accessible via JS
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "Strict", // CSRF protection
    };

    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({ message: "Login successful", admin, token });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(500).json({ errors: "Error in login" });
  }
};

// ===================== LOGOUT =====================
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout:", error);
    res.status(500).json({ errors: "Error in logout" });
  }
};
