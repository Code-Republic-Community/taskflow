// Shared enums for every track. Import from here; never hard-code these strings.
// Order matters where noted.

const ROLES = Object.freeze(["admin", "user"]);

// Ordered from least to most privileged: compare with PROJECT_ROLES.indexOf(role).
const PROJECT_ROLES = Object.freeze(["viewer", "member", "owner"]);

const ISSUE_TYPES = Object.freeze(["task", "bug", "story", "epic"]);

// Ordered as the board columns.
const ISSUE_STATUSES = Object.freeze(["todo", "in_progress", "in_review", "done"]);

// Ordered from lowest to highest.
const PRIORITIES = Object.freeze(["lowest", "low", "medium", "high", "highest"]);

const SPRINT_STATUSES = Object.freeze(["planned", "active", "completed"]);

const NOTIFICATION_TYPES = Object.freeze(["assigned", "mentioned", "commented", "status_changed"]);

const ACTIVITY_TYPES = Object.freeze(["created", "updated", "commented", "moved"]);

module.exports = {
  ROLES,
  PROJECT_ROLES,
  ISSUE_TYPES,
  ISSUE_STATUSES,
  PRIORITIES,
  SPRINT_STATUSES,
  NOTIFICATION_TYPES,
  ACTIVITY_TYPES,
};
