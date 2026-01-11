import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  wallet: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String },
  user_type: { type: String, required: true }, // e.g., "doctor", "patient", "laboratory"
  address: { type: String },
});

const User = mongoose.model("User", UserSchema);

export default User;
