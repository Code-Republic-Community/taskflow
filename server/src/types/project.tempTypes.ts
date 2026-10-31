// Temporary Project type definition to support assignee validation using the members field.
//These types should be replaced with the official Project type from TF-4.
import type { Types } from "mongoose";

export type ProjectMember = {
  user: Types.ObjectId;
};

export type Project = {
  _id: Types.ObjectId;
  key: string;
  issueCounter: number;
  members: ProjectMember[];
};
