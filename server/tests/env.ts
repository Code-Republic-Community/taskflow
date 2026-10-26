import { inject } from "vitest";

// Runs before each test file, before src/config/env.ts is loaded.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = inject("mongoUri");
process.env.JWT_SECRET ??= "test-secret-that-is-at-least-32-characters-long";
process.env.CLIENT_URL ??= "http://localhost:5173";
