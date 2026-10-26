// Shared enums for every track. Import from here; never hard-code these strings.
// Each list has a matching union type, e.g. IssueStatus = "todo" | "in_progress" | ...
// Order matters where noted.

export const ROLES = Object.freeze(["admin", "user"] as const);
export type Role = (typeof ROLES)[number];

// Ordered from least to most privileged: compare with PROJECT_ROLES.indexOf(role).
export const PROJECT_ROLES = Object.freeze(["viewer", "member", "owner"] as const);
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const ISSUE_TYPES = Object.freeze(["task", "bug", "story", "epic"] as const);
export type IssueType = (typeof ISSUE_TYPES)[number];

// Ordered as the board columns.
export const ISSUE_STATUSES = Object.freeze(["todo", "in_progress", "in_review", "done"] as const);
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

// Ordered from lowest to highest.
export const PRIORITIES = Object.freeze(["lowest", "low", "medium", "high", "highest"] as const);
export type Priority = (typeof PRIORITIES)[number];

export const SPRINT_STATUSES = Object.freeze(["planned", "active", "completed"] as const);
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const NOTIFICATION_TYPES = Object.freeze([
  "assigned",
  "mentioned",
  "commented",
  "status_changed",
] as const);
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const ACTIVITY_TYPES = Object.freeze(["created", "updated", "commented", "moved"] as const);
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
