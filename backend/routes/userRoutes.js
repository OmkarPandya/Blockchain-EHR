import express from "express";
import userController from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/users/register
router.post("/register", userController.registerUser);

// @route   POST /api/users/login
router.post("/login", userController.loginUser);

// @route   POST /api/users/lookup
router.post("/lookup", userController.lookupWallets);

// @route   GET /api/users
router.get("/", protect, userController.getAllUsers);

// @route   GET /api/users/search
router.get("/search", protect, userController.searchPatients);

// @route   GET /api/users/getUser/:wallet
router.get("/getUser/:wallet", protect, userController.getUserByWallet);

// @route   GET /api/users/doctors
router.get("/doctors", protect, userController.getDoctors);

// @route   GET /api/users/:id
router.get("/:id", protect, userController.getUserById);

export default router;
