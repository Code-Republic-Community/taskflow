import type { RequestHandler } from "express";
import { PROJECT_ROLES, type ProjectRole } from "../models/constants.ts";
import { findProjectByKey, type ProjectRef } from "../services/project.service.ts";
import { AppError } from "../utils/AppError.ts";
import { AUTH_ERRORS } from "../constants/auth.constants.ts";

// Lets handlers after this middleware use req.project
declare module "express-serve-static-core" {
  interface Request {
    project?: ProjectRef;
  }
}

// Use after requireAuth, e.g. requireProjectRole("member")
export const requireProjectRole = (minRole: ProjectRole): RequestHandler => {
  return async (req, _res, next) => {
    const user = req.user;

    if (!user) {
      throw new AppError(
        AUTH_ERRORS.NOT_AUTHENTICATED.message,
        AUTH_ERRORS.NOT_AUTHENTICATED.statusCode,
      );
    }

    const { key, issueKey } = req.params;
    let projectKey: string | undefined;

    // Route: /projects/:key/...
    if (typeof key === "string") {
      projectKey = key;
    }
    // Route: /issues/:issueKey/...  ("TF-42" -> "TF")
    else if (typeof issueKey === "string") {
      projectKey = issueKey.split("-")[0];
    }

    if (!projectKey) {
      throw new AppError("Project not found", 404);
    }

    const project = await findProjectByKey(projectKey);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    // Global admin has access to every project
    if (user.role === "admin") {
      req.project = project;
      return next();
    }

    // Find user's membership in the project
    const membership = project.members.find((member) => member.user.equals(user._id));

    // Do not reveal that the project exists
    if (!membership) {
      throw new AppError("Project not found", 404);
    }

    const userRole = PROJECT_ROLES.indexOf(membership.role);
    const requiredRole = PROJECT_ROLES.indexOf(minRole);

    if (userRole < requiredRole) {
      throw new AppError("Forbidden", 403);
    }

    req.project = project;
    next();
  };
};
