const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/god";

const connectToMongo = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

module.exports = { connectToMongo };