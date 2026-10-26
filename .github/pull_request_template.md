<!--
PR title format (checked automatically, becomes the squash commit):
  <type>(<scope>): TF-<n> <summary>      e.g. feat(issues): TF-6 add issue key generation
-->

## Jira ticket

https://<JIRA_SITE>.atlassian.net/browse/TF-<n>

## What changed

<!-- What and why, in a few bullet points. Mention anything reviewers should look at closely. -->

-

## How to test

<!-- Exact steps a reviewer can follow: commands, URLs, test data, expected result. -->

1.

## Screenshots

<!-- Required for UI changes: before/after, plus the loading, error and empty states. Delete for API-only changes. -->

## Checklist (definition of done)

- [ ] All acceptance criteria of the Jira ticket are met
- [ ] Tests added or updated, and `npm test` passes locally
- [ ] `npm run lint` passes
- [ ] UI handles loading, error and empty states
- [ ] API responses follow `{ data }` / `{ error: { code, message } }`
- [ ] No secrets, `.env` files or `console.log` left in the code
- [ ] Branch is rebased on the latest `main`
- [ ] Jira ticket updated (status "In Review", PR linked)
