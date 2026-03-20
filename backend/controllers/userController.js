import User from "../models/User.js";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";

// Login user with wallet signature
const loginUser = async (req, res) => {
  try {
    const { wallet, signature } = req.body;

    if (!wallet || !signature) {
      return res.status(400).json({ error: "Wallet and signature required" });
    }

    // Verify signature
    const message = "Login to Blockchain EHR";
    const recoveredAddress = ethers.verifyMessage(message, signature);

    console.log("Login attempt for wallet:", wallet);
    console.log("Recovered address:", recoveredAddress);

    if (recoveredAddress.toLowerCase() !== wallet.toLowerCase()) {
      console.log("Signature mismatch!");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Check if user exists
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${wallet}$`, "i") } });
    if (!user) {
      console.log("User not found in DB");
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    console.log("Login successful for:", user.name);

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        wallet: user.wallet,
        user_type: user.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      message: "Login successful",
      user,
      token
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    return res.status(201).json(savedUser);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get user by wallet
const getUserByWallet = async (req, res) => {
  try {
    const user = await User.findOne({ wallet: req.params.wallet });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Search patients by email or name
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const patients = await User.find({
      user_type: "patient",
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    return res.json(patients);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ user_type: "doctor" }).select("name email wallet");
    return res.json(doctors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Lookup user names by multiple wallets (Public)
const lookupWallets = async (req, res) => {
  try {
    const { wallets } = req.body;
    if (!wallets || !Array.isArray(wallets)) {
      return res.status(400).json({ error: "Wallets array is required" });
    }

    // Convert wallets to regex for case-insensitive search
    const walletRegexes = wallets.map(w => new RegExp(`^${w}$`, "i"));

    const users = await User.find({ wallet: { $in: walletRegexes } })
      .select("name wallet user_type");

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update user profile (name, email)
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      wallet: updatedUser.wallet,
      user_type: updatedUser.user_type,
      ayushmanCardNumber: updatedUser.ayushmanCardNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  registerUser,
  getAllUsers,
  getUserByWallet,
  getUserById,
  loginUser,
  searchPatients,
  getDoctors,
  lookupWallets,
  updateProfile,
};
