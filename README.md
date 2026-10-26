# TaskFlow

TaskFlow is a Jira-like issue tracker: projects, issues with keys like `TF-42`, a drag-and-drop
board, sprints, comments, search, notifications and a dashboard. It is built by a class of 10
students over 4 weeks, each student owning one feature track.

| Layer  | Stack                                                                    |
| ------ | ------------------------------------------------------------------------ |
| Server | Node.js, Express 5, Mongoose 9 (MongoDB), Zod, JWT. CommonJS             |
| Client | React 19, Vite, React Router, TanStack Query, axios, dnd-kit, Recharts   |
| Tests  | Jest + Supertest + mongodb-memory-server (server), Vitest + RTL (client) |

Jira project key: **TF**. Read [CONTRIBUTING.md](CONTRIBUTING.md) before your first ticket.

## Requirements

- **Node.js 24** (see `.nvmrc`; run `nvm use`). Node 22 also works if you are on 22.22 or newer.
- **MongoDB 7+** running locally, or a free MongoDB Atlas cluster.
- Git, and a GitHub account with access to the repository.

## Setup from a fresh clone

```bash
git clone git@github.com:Code-Republic-Community/taskflow.git
cd taskflow
nvm use                                  # Node 24
npm install                              # installs server + client, activates git hooks
cp server/.env.example server/.env       # then edit MONGODB_URI and JWT_SECRET
cp client/.env.example client/.env       # nothing to change for local development
npm run dev                              # API on :3000, web app on :5173
```

Open <http://localhost:5173>. The page shows "TaskFlow" and the API status. If it says the
database is `disconnected`, check that MongoDB is running and that `MONGODB_URI` is correct.

To generate a `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server refuses to start, with a clear message, if `server/.env` is missing a value or holds
an invalid one.

> Always install packages with `npm install <pkg> -w server` or `-w client` from the repository
> root. There is one `package-lock.json`, at the root. Versions are saved exactly (`.npmrc`).
> Adding a dependency is a `chore(deps)` change: ask in the team channel first.

## Scripts

Run from the repository root.

| Command                        | What it does                                               |
| ------------------------------ | ---------------------------------------------------------- |
| `npm run dev`                  | Starts the server (nodemon) and the client (Vite) together |
| `npm run lint`                 | ESLint on server and client                                |
| `npm test`                     | Server tests (Jest), then client tests (Vitest)            |
| `npm run format`               | Formats everything with Prettier                           |
| `npm run format:check`         | Checks formatting without writing                          |
| `npm run dev -w server`        | Server only, on http://localhost:3000                      |
| `npm run dev -w client`        | Client only, on http://localhost:5173 (proxies `/api`)     |
| `npm run test:watch -w client` | Client tests in watch mode                                 |
| `npm run build -w client`      | Production build of the client into `client/dist`          |
| `npm start -w server`          | Server without nodemon                                     |

Git hooks run automatically: `pre-commit` lints and formats your staged files, and `commit-msg`
rejects messages that do not follow the [commit convention](CONTRIBUTING.md#commit-messages).

## Folder structure

```
taskflow/
  server/                       Express API (CommonJS)
    src/
      app.js                    builds the Express app (no listen); used by tests
      server.js                 connects to MongoDB, then listens
      config/env.js             validated, frozen config from .env
      data/db.js                connectDB / disconnectDB
      models/constants.js       shared enums (roles, statuses, priorities…)
      routes/                   one router per track, mounted under /api/v1 in routes/index.js
      controllers/              HTTP in/out only
      services/                 business rules
      middlewares/              errorHandler, notFound, validate (zod)
      utils/                    AppError, pagination
    tests/                      Jest + Supertest
  client/                       React app (Vite, ESM)
    src/
      main.jsx                  providers: TanStack Query, router
      App.jsx                   app shell
      api/client.js             shared axios instance
      features/<track>/         each track's pages, components, hooks and API calls
      components/ hooks/ pages/ routes/   shared, cross-track code
  .github/                      CI, PR checks, PR template
  scripts/setup-github.sh       one-time GitHub repository settings (maintainers only)
```

## API conventions (summary)

All endpoints live under `/api/v1`. Success: `{ "data": ... }`, lists add
`"meta": { "page", "limit", "total" }`. Errors: `{ "error": { "code", "message", "details"? } }`.
See [CLAUDE.md](CLAUDE.md) for the full rules; they apply to humans too.

## More

- [CONTRIBUTING.md](CONTRIBUTING.md): ticket workflow, branches, commits, pull requests, reviews
- [CLAUDE.md](CLAUDE.md): architecture and coding rules (for AI assistants and humans)
