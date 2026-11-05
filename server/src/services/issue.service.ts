import Issue from "../models/Issue.ts";
import { AppError } from "../utils/AppError.ts";

import type { IssueData } from "../types/issue.types.ts";
import type { User } from "../types/auth.types.ts";
import type { ProjectRef } from "./project.service.ts";

export async function createIssue(project: ProjectRef, data: IssueData, user: User) {
  const assignee = data.assignee;

  if (assignee) {
    const isMember = project.members.some(
      (member) => member.user.toString() === assignee.toString(),
    );

    if (!isMember) {
      throw new AppError("Assignee must be a member of the project", 400);
    }
  }

  if (data.epicId) {
    const epic = await Issue.findOne({
      _id: data.epicId,
      project: project._id,
      type: "epic",
    });

    if (!epic) {
      throw new AppError("Epic must exist, belong to the same project, and have type epic", 400);
    }
  }

  // TODO: Once the TF-4 Project model is available:
  // - Atomically increment issueCounter using $inc.
  // - Use the updated counter as the issue number.
  // - Generate the key as PROJECTKEY-number.
  return Issue.create({
    project: project._id,
    key: "TEMP",
    number: 0,
    title: data.title,
    description: data.description ?? "",
    labels: data.label ?? [],
    type: data.type,
    status: data.status,
    priority: data.priority,
    reporter: user._id,
    assignee: assignee ?? null,
    epicId: data.epicId ?? null,
  });
}
