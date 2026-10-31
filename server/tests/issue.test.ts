import mongoose from "mongoose";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

import Issue from "../src/models/issue.ts";
import { createIssue } from "../src/services/issue.service.ts";

import type { User } from "../src/types/auth.types.ts";
import type { Project } from "../src/types/project.tempTypes.ts";
import type { IssueData } from "../src/types/issue.types.ts";

import { connect, clearDatabase, disconnect } from "./helpers/db.ts";

// Mock users
const user1: User = {
  _id: new mongoose.Types.ObjectId(),
  name: "Alice",
  email: "alice@example.com",
  avatarColor: "#FF0000",
  role: "user",
  active: true,
};

const user2: User = {
  _id: new mongoose.Types.ObjectId(),
  name: "Bob",
  email: "bob@example.com",
  avatarColor: "#0000FF",
  role: "user",
  active: true,
};

// Mock project
const project = {
  _id: new mongoose.Types.ObjectId(),
  members: [{ user: user1._id }, { user: user2._id }],
} as Project;

describe("Issue service", () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should reject an assignee who is not a project member", async () => {
    const outsider = new mongoose.Types.ObjectId();

    const data: IssueData = {
      title: "Create login page",
      type: "task",
      status: "todo",
      priority: "medium",
      assignee: outsider,
    };

    await expect(createIssue(project, data, user1)).rejects.toThrow(
      "Assignee must be a member of the project",
    );
  });

  it("should reject a non-existent epic", async () => {
    const data: IssueData = {
      title: "Create login page",
      type: "task",
      status: "todo",
      priority: "medium",
      epicId: new mongoose.Types.ObjectId(),
    };

    await expect(createIssue(project, data, user1)).rejects.toThrow(
      "Epic must exist, belong to the same project, and have type epic",
    );
  });

  it("should create an issue with a project member as assignee", async () => {
    const data: IssueData = {
      title: "Create login page",
      description: "Implement the login page",
      label: ["frontend", "backend"],
      type: "task",
      status: "todo",
      priority: "medium",
      assignee: user2._id,
    };

    const issue = await createIssue(project, data, user1);

    expect(issue).toBeDefined();
    expect(issue.title).toBe("Create login page");
    expect(issue.description).toBe("Implement the login page");
    expect(issue.label).toEqual(["frontend", "backend"]);
    expect(issue.assignee?.toString()).toBe(user2._id.toString());
    expect(issue.project.toString()).toBe(project._id.toString());
    expect(issue.key).toBe("TEMP");
    expect(issue.number).toBe(0);
  });

  it("should successfully create an issue linked to a valid epic", async () => {
    const epic = await Issue.create({
      key: "TEMP-EPIC",
      number: 0,
      project: project._id,
      title: "Authentication",
      type: "epic",
      status: "todo",
      priority: "high",
    });

    const data: IssueData = {
      title: "Create login page",
      type: "task",
      status: "todo",
      priority: "medium",
      epicId: epic._id,
    };

    const issue = await createIssue(project, data, user1);

    expect(issue.epicId?.toString()).toBe(epic._id.toString());
  });
});
