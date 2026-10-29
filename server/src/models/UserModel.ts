import mongoose from "mongoose";
import { ROLES } from "./constants.ts";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ROLES,
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
