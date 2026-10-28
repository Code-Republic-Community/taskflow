import type { Types } from "mongoose";
import type { Role } from "../models/constants.ts";

export type User = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  active: boolean;
};
