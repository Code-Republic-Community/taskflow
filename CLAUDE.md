# CLAUDE.md

Rules for AI assistants (Claude, Copilot, Cursor…) working in the TaskFlow repository. Humans
follow the same rules. Read README.md for setup and CONTRIBUTING.md for the git workflow.

TaskFlow is a Jira-like issue tracker built by a class of 10 students, one feature track each:
auth, projects, issues, board, sprints, comments, search, notifications, dashboard, UI shell.
npm workspaces monorepo: `server/` (Express 5 + Mongoose 9, CommonJS) and `client/` (React +
Vite, ESM). JavaScript only, no TypeScript.

## Scope: stay inside the ticket

- Work only on what the current Jira ticket (`TF-<n>`) asks for. If you are not told the ticket,
  ask for it.
- Do not refactor, rename, reformat or "improve" code outside the ticket, and do not touch other
  tracks' folders. Suggest such changes instead of making them.
- Shared files (`server/src/app.js`, `server/src/routes/index.js`,
  `server/src/models/constants.js`, `client/src/main.jsx`, `client/src/App.jsx`, configs,
  workflows): only the minimal change the ticket needs (e.g. mounting a router), and say so.
- Do not add, remove or upgrade dependencies unless the ticket says so. If one is needed, stop
  and say which and why. Never edit `package-lock.json` by hand.
- Do not weaken lint rules, tests, hooks or CI to make something pass.

## Commands

```bash
npm run dev                 # server :3000 + client :5173
npm run lint                # must pass
npm test                    # must pass (server: Jest, client: Vitest)
npm run test -w server -- tests/health.test.js   # one server test file
npm run test -w client -- src/App.test.jsx       # one client test file
```

Run lint and the relevant tests before saying a change is done.

## Server architecture

Layered, one direction only: **routes → controllers → services → models**.

| Layer                      | Does                                                                  | Never                                   |
| -------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| `routes/<track>.routes.js` | path + method, auth middleware, `validate({ body, query, params })`   | logic                                   |
| `controllers/`             | read `req`, call one service, send the response with the right status | business rules, direct model access     |
| `services/`                | **all business rules**, permissions, model queries                    | touch `req`/`res`                       |
| `models/`                  | Mongoose schemas                                                      | business rules beyond schema validation |

- Mount each track's router in `routes/index.js` (everything lives under `/api/v1`), e.g.
  `router.use("/projects", projectRoutes)`.
- `app.js` exports `createApp()` and never listens; tests use it with Supertest.
- Config comes only from `config/env.js` (validated, frozen). Never read `process.env`
  elsewhere. A new env variable goes into the zod schema and `server/.env.example`.
- **Async errors**: Express 5 forwards rejected promises to the error handler. Write plain
  `async (req, res) => {}` handlers. Do not add `asyncHandler` wrappers or try/catch just to
  call `next(err)`.
- To fail, `throw new AppError(message, statusCode, code, details?)` from `utils/AppError.js`.
  Never `res.status(4xx).json(...)` by hand.

### Response format (mandatory)

```js
// success
res.status(200).json({ data: project });
res.status(201).json({ data: createdIssue });
res.status(204).end();
// list
res.json({ data: issues, meta: { page, limit, total } });
// error (produced by middlewares/errorHandler.js, never by hand)
{ "error": { "code": "NOT_FOUND", "message": "Project not found", "details": [] } }
```

| Code               | Status | When                                               |
| ------------------ | ------ | -------------------------------------------------- |
| `VALIDATION_ERROR` | 400    | invalid body/query/params, bad ObjectId, bad JSON  |
| `UNAUTHORIZED`     | 401    | not logged in, invalid/expired token               |
| `FORBIDDEN`        | 403    | logged in but not allowed                          |
| `NOT_FOUND`        | 404    | resource does not exist (or the user can't see it) |
| `CONFLICT`         | 409    | duplicate (unique index), state conflict           |
| `RATE_LIMITED`     | 429    | too many requests                                  |
| `INTERNAL`         | 500    | anything unexpected                                |

ZodError, Mongoose ValidationError, CastError and duplicate key (11000) errors are already
mapped by the error handler: let them throw.

Pagination: `const { page, limit, skip } = parsePagination(req.query)` from
`utils/pagination.js` (default 20, max 100), then return `meta: { page, limit, total }`.

### Validation

- Validate every request input with **zod** through `middlewares/validate.js`:
  `validate({ body: createIssueSchema, params: idParamsSchema })`. Put schemas next to the
  route (`routes/<track>.schemas.js`) or in the track's service folder, not inline in handlers.
- Validated values replace `req.body` / `req.params`; the parsed query is on
  `req.validatedQuery` (also `req.query`). Unknown keys are stripped.

### Models

- One file per model in `server/src/models/`, PascalCase model name, e.g. `Issue.js`.
- Always `{ timestamps: true, strict: "throw" }` in the schema options.
- Use the enums from `models/constants.js` (`ROLES`, `PROJECT_ROLES`, `ISSUE_TYPES`,
  `ISSUE_STATUSES`, `PRIORITIES`, `SPRINT_STATUSES`, `NOTIFICATION_TYPES`, `ACTIVITY_TYPES`)
  for `enum:` and in code. Never hard-code those strings. Adding a value there is a shared
  change: keep it minimal and mention it in the PR.
- `PROJECT_ROLES` is ordered from least to most privileged; compare with `indexOf`.
- Never return password hashes or other secrets: use `select: false` or a `toJSON` transform.
- Add indexes for fields you query or that must be unique.

### Server tests

- Jest + Supertest against `createApp()`, in `server/tests/<track>.test.js`.
- A MongoDB in memory is started for the run (`process.env.MONGODB_URI`). Use the helpers in
  `tests/helpers/db.js`: `connect()`, `clearDatabase()` (empties every collection) and
  `disconnect()`. Never call `mongoose.connect` directly: `connect()` goes through `connectDB`,
  which carries a driver fix needed inside Jest.

  ```js
  const db = require("./helpers/db");

  beforeAll(() => db.connect());
  afterEach(() => db.clearDatabase());
  afterAll(() => db.disconnect());
  ```

- Test success, validation failure, auth/permission failure and not-found paths, and assert the
  response shape.

## Client architecture

- Feature code lives in **`client/src/features/<track>/`** (its pages, components, hooks, API
  functions). Shared, cross-track code goes in `components/`, `hooks/`, `pages/`, `routes/`.
  Don't import from another track's internals; ask its owner to expose something shared.
- **Server data goes through TanStack Query** (`useQuery`, `useMutation`, invalidate on
  success). No `useEffect` + `fetch` for API data, no copying server data into global state.
  Query keys start with the resource: `["projects", projectId, "issues", filters]`.
- HTTP goes through the shared axios instance `api` from `src/api/client.js` (base URL
  `/api/v1`). The payload is `res.data.data`; show errors with `getErrorMessage(error)`.
- Routing uses `react-router` (already wrapped in `BrowserRouter` in `main.jsx`).
- Every component that shows server data handles **loading, error and empty states**.
- Use the enum values the server uses (same strings as `models/constants.js`).
- Tests: Vitest + Testing Library, next to the file (`Component.test.jsx`). Mock the `api`
  module, not the network. Query by role/label, as a user would.

## General code rules

- Match the surrounding code: naming, comments, formatting (Prettier and ESLint run on commit).
- No `console.log` in committed code (`console.error`/`console.warn` for real problems only).
- No secrets in code or commits. `.env` files are git-ignored; update `.env.example` instead.
- Keep functions small; name things for what they mean in the domain (issue, sprint, board).

## Git conventions

- Branch: `<type>/TF-<n>-<short-description>`, types `feature|fix|hotfix|chore|docs|test|refactor`,
  e.g. `feature/TF-6-issue-key-generation`.
- Commit: `<type>(<scope>): TF-<n> <summary>`, types
  `feat|fix|refactor|test|docs|style|chore|ci|perf`, optional scope
  `auth|projects|issues|board|sprints|comments|search|notifications|dashboard|ui|api|db|ci|deps`,
  imperative lowercase summary, no full stop, header ≤ 72 characters.
  e.g. `feat(issues): TF-6 generate sequential issue keys per project`.
- PR title uses the commit format (it becomes the squash commit).
- Never commit to `main`, never `--no-verify`, never `git push --force` (use
  `--force-with-lease`, own branch only). Don't commit or push unless asked.
