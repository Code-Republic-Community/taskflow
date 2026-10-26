// Commit format: <type>(<scope>): TF-<n> <summary>   (scope is optional)
// Example:       feat(issues): TF-6 add issue key generation

const TYPES = ["feat", "fix", "refactor", "test", "docs", "style", "chore", "ci", "perf"];

const SCOPES = [
  "auth",
  "projects",
  "issues",
  "board",
  "sprints",
  "comments",
  "search",
  "notifications",
  "dashboard",
  "ui",
  "api",
  "db",
  "ci",
  "deps",
];

const JIRA_SUBJECT = /^TF-\d+ \S/;

module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "subject-jira-key": ({ subject }) => [
          Boolean(subject) && JIRA_SUBJECT.test(subject),
          'subject must start with the Jira key and a space, e.g. "TF-12 add login form"',
        ],
      },
    },
  ],
  rules: {
    "type-enum": [2, "always", TYPES],
    "scope-enum": [2, "always", SCOPES],
    "header-max-length": [2, "always", 72],
    // The subject starts with "TF-", so the default lower-case subject rule must be off.
    "subject-case": [0],
    "subject-full-stop": [2, "never", "."],
    "subject-jira-key": [2, "always"],
  },
};
