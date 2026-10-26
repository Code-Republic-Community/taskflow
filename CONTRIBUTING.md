# Contributing to TaskFlow

Ten people work in this repository at the same time. The rules below keep `main` green and keep
everyone out of each other's way. Most of them are enforced by git hooks and GitHub checks, so
if something is rejected, read the error message: it tells you what to fix.

First time? Follow the setup in the [README](README.md#setup-from-a-fresh-clone), then read
[CLAUDE.md](CLAUDE.md) for the architecture and coding rules.

## 1. The workflow for one ticket

1. **Pick the ticket in Jira.** Take one from your track (or one assigned to you), assign it to
   yourself and move it to **In Progress**. One ticket = one branch = one pull request.
2. **Branch from an up-to-date `main`.**
3. **Commit** small, focused steps with the [commit format](#commit-messages).
4. **Stay up to date** with `main` by rebasing, not merging.
5. **Push** your branch and **open a pull request** with a [valid title](#pull-requests).
   Move the ticket to **In Review** and link the PR.
6. **Review**: get 1 approval from your [reviewer](#reviews). Fix comments with new commits.
7. **Squash merge** once checks are green and the PR is approved. The branch is deleted
   automatically. Move the ticket to **Done**.

## 2. Day-to-day commands for one ticket

Example: ticket **TF-6**, "Issue key generation".

```bash
# start
git switch main
git pull --ff-only
git switch -c feature/TF-6-issue-key-generation

# work… then commit (hooks lint, format and check your message)
git add server/src/services/issue.service.ts server/tests/issues.test.ts
git commit -m "feat(issues): TF-6 generate sequential issue keys per project"

# before pushing, and whenever main moves: replay your commits on top of the latest main
git fetch
git rebase origin/main
#   conflict? fix the files, then:  git add <files> && git rebase --continue
#   lost?                            git rebase --abort   (back to where you were)
npm test                          # still green after the rebase?

# first push
git push -u origin feature/TF-6-issue-key-generation

# later pushes after a rebase (rewrites history, so it needs force, safely)
git push --force-with-lease

# open the PR (or use the GitHub web UI)
gh pr create --fill --title "feat(issues): TF-6 add issue key generation"

# after the PR is merged
git switch main
git pull --ff-only
git branch -d feature/TF-6-issue-key-generation   # -D if git complains (squash merge)
git fetch --prune
```

> **`--force-with-lease`, only on your own branch.** Never force push `main` (it is blocked
> anyway) or a branch someone else is working on. Plain `--force` is not allowed: it can
> silently delete a teammate's commits; `--force-with-lease` refuses if the remote changed.

## 3. Branch names

```
<type>/TF-<n>-<short-description>
```

- **type**: `feature`, `fix`, `hotfix`, `chore`, `docs`, `test`, `refactor`
- **TF-&lt;n&gt;**: the Jira ticket
- **short-description**: lowercase words separated by hyphens

Checked on every PR with `^(feature|fix|hotfix|chore|docs|test|refactor)/TF-[0-9]+-[a-z0-9-]+$`.

| ✅ Good                             | ❌ Bad                    | Why                                    |
| ----------------------------------- | ------------------------- | -------------------------------------- |
| `feature/TF-6-issue-key-generation` | `anna-branch`             | no type, no ticket                     |
| `fix/TF-31-board-drag-flicker`      | `feature/issue-keys`      | no ticket                              |
| `docs/TF-13-contributing-guide`     | `Feature/TF-6-Issue-Keys` | uppercase                              |
| `refactor/TF-40-extract-pagination` | `feat/TF-6-issue-keys`    | `feat` is a commit type, use `feature` |

Wrong name? Rename before opening the PR: `git branch -m feature/TF-6-issue-key-generation`.

## 4. Commit messages

```
<type>(<scope>): TF-<n> <summary>
```

- **type**: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `ci`, `perf`
- **scope** (optional): `auth`, `projects`, `issues`, `board`, `sprints`, `comments`,
  `search`, `notifications`, `dashboard`, `ui`, `api`, `db`, `ci`, `deps`
- **summary**: imperative mood ("add", not "added" or "adds"), lowercase after the key, no full
  stop at the end
- the whole first line is at most **72 characters**

The `commit-msg` hook rejects anything else.

**Good**

```
feat(auth): TF-3 add login endpoint with jwt
fix(board): TF-31 keep card order after a failed drag
test(issues): TF-6 cover key generation for concurrent creates
refactor(api): TF-40 extract pagination helper
chore(deps): TF-2 add date-fns to the client
docs: TF-13 explain the rebase workflow
```

**Bad**

```
added stuff                                   no type, no ticket, says nothing
feat: add login                               missing TF-<n>
feat(login): TF-3 add login                   "login" is not a scope, use auth
feat(auth): tf-3 add login                    key must be uppercase TF-
feat(auth): TF-3 Added the login endpoint.    past tense, capitalised, full stop
Feat(auth): TF-3 add login                    type must be lowercase
feat(auth): TF-3 add login endpoint with jwt and refresh tokens and logout   > 72 chars
```

Commit often on your branch; your commits are squashed into one when the PR is merged, so the
PR title is what lands on `main`.

## 5. Pull requests

- **Title** uses the commit format, because it becomes the squash commit on `main`:
  `feat(issues): TF-6 add issue key generation`. It is checked automatically (`pr-title`);
  edit the title and the check reruns.
- Fill in the **template**: Jira link, what changed, how to test, screenshots for UI work, and
  the checklist.
- Keep PRs **small** (aim for under ~400 changed lines). Split big tickets with your
  instructor.
- Open a **draft PR** early if you want feedback before you are done.
- Required to merge: **1 approval**, and green `server`, `client`, `branch-name` and `pr-title`
  checks. A new push dismisses existing approvals, so ask for a re-review.
- Merge with **Squash and merge** (the only option). The branch is deleted automatically.

## 6. Reviews

- **Rotation**: each week you review the PRs of the next person on the list (wrapping
  around). The instructor posts the list and rotates it every Monday. Add your reviewer
  in the PR's _Reviewers_ box.
- **Turnaround**: review within one working day. If you are blocked waiting, say so in the
  team channel.
- **As a reviewer**: run the branch locally for anything non-trivial
  (`gh pr checkout <number>`), check the acceptance criteria and the checklist, and be specific
  and kind. Prefix optional remarks with `nit:`. Approve when it is good enough, not perfect.
- **As an author**: answer every comment (fix it, or explain why not), push fixes as new
  commits, then re-request a review. Don't resolve a reviewer's thread yourself unless they
  told you to.

## 7. Rules that keep main green

- Never commit directly to `main` (it is protected).
- Never commit `.env` files, secrets, API keys or `console.log` debugging.
- Only touch files of your track, plus the shared files your ticket really needs. Changes to
  shared files (`app.ts`, `routes/index.ts`, `models/constants.ts`, `main.tsx`, configs) should
  be small and mentioned in the PR description.
- Add dependencies only with `npm install <pkg> -w server|client` from the root, in their own
  `chore(deps)` commit, after asking the team. Never delete or regenerate `package-lock.json`;
  on a lockfile conflict, take `main`'s version and rerun the same `npm install`.
- `--no-verify` is not a way to get past the hooks. Fix the problem instead; CI runs the same
  checks.

## 8. When something goes wrong

| Problem                                     | Fix                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Hook rejected my commit message             | `git commit` again with a valid message; your staged changes are kept                                                     |
| Typo in my last commit message (not pushed) | `git commit --amend -m "fix(ui): TF-9 correct message"`                                                                   |
| Committed on `main` by mistake (not pushed) | `git switch -c feature/TF-n-name`, then `git switch main && git reset --hard origin/main`                                 |
| Rebase conflict in `package-lock.json`      | `git checkout origin/main -- package-lock.json && npm install && git add package-lock.json`, then `git rebase --continue` |
| `push` rejected after a rebase              | `git push --force-with-lease` (your branch only)                                                                          |
| CI fails but it works on my machine         | Run `npm ci && npm run lint && npm test` locally on Node 24                                                               |
