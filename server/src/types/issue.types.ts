import type { Types } from "mongoose";

import type { IssueType, IssueStatus, Priority } from "../models/constants.ts";

export type IssueData = {
  title: string;
  description?: string;
  label?: string[];
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assignee?: Types.ObjectId | string | null;
  epicId?: Types.ObjectId;
};
