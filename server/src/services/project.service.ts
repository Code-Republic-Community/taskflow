import type { Types } from "mongoose";
import type { ProjectRole } from "../models/constants.ts";

// Minimal project shape that requireProjectRole needs.
// TODO: TF-4 replaces this with the type derived from the Project model.
export interface ProjectMember {
  user: Types.ObjectId;
  role: ProjectRole;
}

export interface ProjectRef {
  key: string;
  members: ProjectMember[];
}

// TODO: TF-4 implements the real lookup (Project.findOne({ key })).
export async function findProjectByKey(_key: string): Promise<ProjectRef | null> {
  return null;
}
