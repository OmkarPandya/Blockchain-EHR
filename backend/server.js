import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ Enjoy: "🚀 Backend is running!" });
});

export default app;
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));
