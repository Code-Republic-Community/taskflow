import User from "../models/UserModel.ts";
import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError.ts";
import { AUTH_ERRORS, AUTH_SALT } from "../constants/auth.constants.ts";
import jwt from "jsonwebtoken";
import { config } from "../config/env.ts";

export async function registerService(name: string, email: string, password: string) {
  if (password.length < 8) {
    throw new AppError(
      AUTH_ERRORS.INVALID_PASSWORD.message,
      AUTH_ERRORS.INVALID_PASSWORD.statusCode,
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(AUTH_ERRORS.EMAIL_EXIST.message, AUTH_ERRORS.EMAIL_EXIST.statusCode);
  }

  const passwordHash = await bcrypt.hash(password, AUTH_SALT);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
  });

  return user;
}

export async function loginService(email: string, password: string) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new AppError(
      AUTH_ERRORS.INVALID_CREDENTIALS.message,
      AUTH_ERRORS.INVALID_CREDENTIALS.statusCode,
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(
      AUTH_ERRORS.INVALID_CREDENTIALS.message,
      AUTH_ERRORS.INVALID_CREDENTIALS.statusCode,
    );
  }

  const token = jwt.sign({ sub: user._id.toString() }, config.jwtSecret, { expiresIn: "7d" });

  return {
    user,
    token,
  };
}
