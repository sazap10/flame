# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Flame is a self-hosted start page: an Express + Sequelize/SQLite backend serving a React/Redux/TypeScript SPA. Users manage "apps" and "bookmarks" (grouped into categories), with optional Docker/Kubernetes auto-discovery, a weather widget, JWT auth, and custom theming.

## Commands

The repo is two packages: the backend (root `package.json`) and the client (`client/package.json`).

```sh
# One-time setup: creates data/ + public/, installs server AND client deps
npm run dev-init

# Run both dev servers concurrently (backend :5005, client :3000)
npm run dev

# Run them individually
npm run dev-server   # nodemon server.js
npm run dev-client   # Vite dev server in client/

# Production: client must be built into public/ first, then:
npm start            # node server.js
```

Client-only commands (run from `client/`):

```sh
npm start            # Vite dev server on :3000 with proxy to :5005 (vite.config.ts)
npm run build        # production build (Vite, output goes to client/build, copied to public/ in Docker)
npm run preview      # serve the production build locally
npm run typecheck    # tsc --noEmit (the build itself does not type-check)
```

There is no test suite and no lint script — formatting is Prettier only (`.prettierrc`: 2-space, single quotes, `printWidth` 80, `trailingComma: es5`). The client uses Vite (not Create React App); the build is bundled by esbuild/Rolldown and does not run `tsc`, so run `npm run typecheck` separately to catch type errors.

## Architecture

### Backend boot sequence (`server.js`)

`initApp()` → `connectDB()` → `associateModels()` → `jobs()` → create raw `http.Server`, attach the Express `api` to its `request` event, register the weather WebSocket. The HTTP server is created manually (not `app.listen`) so the same server can host both Express and the `ws` WebSocket.

- **`utils/init`** — bootstraps the runtime: creates required files/dirs, seeds initial config from `initialConfig.json`, loads Docker secrets (any env var can be overridden by appending `_FILE`, which reads a file path — used for Docker secrets).
- **`db/index.js`** — single Sequelize SQLite instance (`./data/db.sqlite`). On connect it **backs up the DB**, then runs pending **Umzug migrations** from `db/migrations/` (numbered `00_`, `01_`, …). Schema changes go in a new migration file, never by editing models alone.
- **`utils/jobs.js`** — scheduled tasks via `node-schedule` (e.g. weather fetching).

### Request pipeline (`api.js`)

Express serves the built SPA from `public/`, `/uploads` from `data/uploads`, and falls through to `index.html` for any non-`/api` route (client-side routing). API routes are mounted under `/api/*` and delegate to controllers.

Controller convention (see `controllers/apps/createApp.js`):
- One file per action, re-exported via the folder's `index.js`. Routes wire these up.
- Every async controller is wrapped in `asyncWrapper` (`middleware/`) so thrown errors reach the central `errorHandler`.
- Errors are thrown as `new ErrorResponse(message, statusCode)` (`utils/ErrorResponse.js`), never `res.status().json()` for error paths.
- Success responses follow `{ success: true, data }`.

Middleware (all re-exported from `middleware/index.js`):
- **`auth`** — decodes the JWT and sets `req.isAuthenticated` (runs broadly; does not block).
- **`requireAuth`** — guards mutating routes, 401s if `!req.isAuthenticated`.
- **`requireBody`**, **`upload`** (multer for icon uploads).

Auth is JWT-based with a single password (env `PASSWORD` / `PASSWORD_FILE`). Many read routes are public; write routes require auth. Tokens signed via `utils/signToken.js`. Setting `ANONYMOUS_AUTH=true` short-circuits `middleware/auth.js` so every request is treated as authenticated (full access, login UI hidden) — for instances behind a trusted proxy. The client learns this from a computed `isAnonymousAuth` flag on the `/api/config` response, which drives an `setAnonymousAuth` action into the auth reducer.

### Config

App settings live in the DB `Config` model (key/value), seeded from `utils/init/initialConfig.json`. Read settings in controllers via `loadConfig()` (`utils/loadConfig.js`) rather than reading env directly. Env vars (`.env`): `PORT`, `NODE_ENV`, `VERSION`, `PASSWORD`.

### Integrations

- **Docker** — `controllers/apps/docker/useDocker.js` reads container labels (`flame.type`, `flame.name`, `flame.url`, `flame.icon`, `flame.category`; `;`-separated for multiple) and auto-creates **categorised bookmarks** (not flat apps). `flame.category` sets the category; containers without it fall back to `DOCKER_DEFAULT_CATEGORY` (default `Apps`). Categories are created on demand, and an app previously auto-created for the same service is deleted so it isn't shown twice. Discovery runs from `controllers/categories/getAllCategories.js` (gated by the "Use Docker API" setting), so it executes when categories are fetched. Requires the Docker socket mounted. URLs can also be derived from `traefik.*` rules, or from `tsdproxy.*` labels when `TSDPROXY_DOMAIN` is set (`tsdproxy.name` → `https://<name>.<TSDPROXY_DOMAIN>`); explicit `flame.*` labels always override the derived values.
- **Kubernetes** — `@kubernetes/client-node` reads ingress annotations (`flame.pawelmalak/*`).
- **Weather** — `utils/getExternalWeather.js` calls weatherapi.com; results pushed to the client over the `weather` WebSocket (`Socket.js`, registered in the `Sockets` singleton registry).

### Client (`client/src`)

- **Redux** lives in `store/` split into `action-types/`, `action-creators/` (thunks, async), `actions/` (typed action interfaces), and `reducers/`. Add a feature by touching all four plus `store/index.ts`.
- **`vite.config.ts`** proxies `/api`, `/uploads`, and `/socket` (WebSocket) to `localhost:5005` in dev, and sets the build output dir to `build/`. Client env vars must be prefixed `VITE_` and are read via `import.meta.env` (e.g. `VITE_VERSION` in `client/.env`).
- Components grouped by feature under `components/` (Apps, Bookmarks, Home, Settings, SearchBar, Widgets, UI, …). TypeScript throughout; shared types in `interfaces/` and `types/`.
- Icons use `@mdi/js` (Material Design Icons); external SVG icons via `external-svg-loader`.

## Deployment

Dockerfiles live in `.docker/` (`Dockerfile`, `Dockerfile.dev`, `Dockerfile.multiarch` for arm). The build compiles the client and serves it from the backend's `public/`. Kubernetes manifests use Kustomize in `k8s/base` and `k8s/overlays/`, orchestrated by `skaffold.yaml` (profiles: `dev`, `shokohsc`, `prod`).

## Conventions that aren't obvious

- The persistent `data/` directory (SQLite DB, uploads, custom CSS) is gitignored and created by `dev-init` — it must exist before the server boots.
- DB migrations are append-only and run automatically on boot; the DB is backed up before each migration run.
- Backend is CommonJS (`require`); client is ES modules + TypeScript.
