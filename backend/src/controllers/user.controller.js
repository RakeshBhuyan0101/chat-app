import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { Readable } from "stream";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be greater than 6 letters",
      });
    }
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "user already exist please login", success: false });

    const hasedPasswrod = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName: fullName,
      email: email,
      password: hasedPasswrod,
    });

    if (newUser) {
      const token = generateToken(newUser.id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are empty" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const cheackPassword = await bcrypt.compare(password, user.password);
      if (!cheackPassword) {
        return res.status(400).json({
          message: "Invalid credentials",
          success: false,
        });
      }

      generateToken(user._id, res);
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {}
};
export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const cheackAuth = (req,res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authentication middleware

    if (!req.file) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // Convert buffer to readable stream
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profile_pics" }, // Store images in "profile_pics" folder in Cloudinary
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ message: "Error uploading image" });
        }

        // Update user's profile picture URL in the database
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePic: result.secure_url }, // Save Cloudinary URL
          { new: true }
        ).select("-password");

        res.status(200).json({ message: "Profile updated", user: updatedUser });
      }
    );

    // Pipe image buffer to Cloudinary
    Readable.from(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}