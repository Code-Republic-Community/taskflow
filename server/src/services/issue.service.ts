import Issue from "../models/issue.ts";
import { AppError } from "../utils/AppError.ts";

import type { IssueData } from "../types/issue.types.ts";
import type { Project } from "../types/project.tempTypes.ts";
import type { User } from "../types/auth.types.ts";

export async function createIssue(project: Project, data: IssueData, _user: User) {
  //checking the assignee
  if (data.assignee) {
    const isMember = project.members.some(
      (member) => member.user.toString() === data.assignee?.toString(),
    );

    if (!isMember) {
      throw new AppError("Assignee must be a member of the project", 400);
    }
  }

  //epicId
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

  //creating the issue(partly)
  const issue = await Issue.create({
    project: project._id,
    key: "TEMP", // Temporary until TF-4 is available
    number: 0, // Temporary until atomic numbering is implemented
    title: data.title,
    description: data.description ?? "",
    label: data.label ?? [],
    type: data.type,
    status: data.status,
    priority: data.priority,
    assignee: data.assignee ?? null,
    epicId: data.epicId ?? null,
  });

  return issue;
}

// The Issue model and the majority of the createIssue validation logic have been implemented.

//ToDo:
// Atomic issue numbering using $inc.
// Automatic key generation in the PROJECTKEY-number format.
// Testing consecutive key generation under parallel creation.

// These features depend on the Project model (TF-4), specifically its key and issueCounter fields.
// Implementation and testing will be completed once the Project model is available.
