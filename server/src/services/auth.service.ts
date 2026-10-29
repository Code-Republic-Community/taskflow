import User from "../models/UserModel.ts";
import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError.ts";

export async function registerService(name: string, email: string, password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
  });

  return user;
}
