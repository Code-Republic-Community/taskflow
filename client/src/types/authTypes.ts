export type Role = "admin" | "user";

export type User = {
  _id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  active: boolean;
};

export type AuthResult = {
  token: string;
  user: User;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };
