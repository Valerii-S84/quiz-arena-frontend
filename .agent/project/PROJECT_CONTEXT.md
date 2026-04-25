# PROJECT_CONTEXT

Заповни цей файл перед початком роботи агента.

Якщо обов'язкові поля лишаються незаповненими, агент має
зупинитися до початку будь-якої задачі.

## 1. Stack

- Project name: `quiz-arena-frontend`
- Primary languages: `TypeScript`, `TSX`, `CSS`, root-level JavaScript config files
- Runtime / platform: `Node.js 20+`, `Next.js 15 App Router`, browser + SSR, Docker image builds
- Main frameworks / libraries: `Next.js 15`, `React 18`, `TypeScript 5`, `Tailwind CSS 3`, `@tanstack/react-query`, `react-hook-form`, `zod`, `Vitest`, `ESLint`
- Data stores: No local datastore in this repo; the frontend consumes a backend HTTP API and keeps transient client/server state only
- Default user-facing language: `German` in the public site and admin UI

## 2. Project structure

- Root entrypoints: `app/layout.tsx`, route files under `app/**/page.tsx`, `app/robots.ts`
- Source directories: `app/`, `lib/`, `public/`
- Test directories: Colocated `*.test.ts` files inside `app/` and `lib/`
- Config / infra directories: No dedicated config directory; use root config files (`next.config.mjs`, `eslint.config.mjs`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `tsconfig.json`), `Dockerfile`, and `.agent/`
- Read-only or protected paths: `.agent/core/`; shipped static/binary assets under `public/downloads/` and `public/products/` should not be changed without a direct request

## 3. Key commands

| Purpose | Command | Notes |
|---|---|---|
| Test | `npm test` | Runs `vitest run` in Node environment against colocated `*.test.ts` files. |
| Lint | `npm run lint` | Runs ESLint 9 with the repo root config and Next core web vitals rules. |
| Build | `npm run build` | Produces the production Next.js build; use for release-readiness checks. |
| Dev / Run | `npm run dev` | Local development server; copy `.env.example` to a local env file before interactive work if needed. |

## 4. External dependencies

| System / service | Purpose | Access mode | Notes |
|---|---|---|---|
| Backend HTTP API | Public content stats, admin auth/session checks, dashboard, promo, contact workflows | Network via env-configured base URL (`NEXT_PUBLIC_API_URL`, server-side `API_INTERNAL_URL`) | Frontend route contract is centralized in `lib/api-routes.ts`. |
| Telegram links | Public CTA targets for the bot and channel | Public outbound URLs from env-backed frontend config | Public-site link config is centralized in `lib/public-site-config.ts`. |
| GitHub Container Registry | Frontend image publishing in CI/release flows | Remote registry outside normal local development | Referenced in `README.md`; not needed for normal local coding. |

## 5. Project constraints

- Protected paths: `.agent/core/`; `.agent/project/` is normative project context; `public/downloads/` and `public/products/` are protected content/assets; `package-lock.json` changes only when dependency work is explicitly in scope
- Secrets / credentials locations: Local env files (`.env.local`, `.env`, other `.env*`) and CI/runtime secret stores outside the repo; never print, diff, or copy secret values into tracked files
- Deploy / production boundaries: Do not deploy from local task flow; production orchestration stays outside this repo, and image publishing/runtime changes require a direct request
- Approval-required operations: Any git push/merge/history rewrite, dependency changes, CI/deploy changes, env/credential wiring changes, edits to protected binary/static assets, and any production action
- Restricted hosts / environments: Production hosts, CI runners, registry publishing targets, and non-local backend environments are out of scope unless directly requested
- Project-specific forbidden actions: Do not bypass admin auth/session flows, do not hardcode environment-specific API origins into feature code, do not change Docker/runtime/deploy behavior without a direct request, and do not rewrite static content assets as part of unrelated work

## 6. Git settings

- Default / protected branch: `main`
- Branching strategy: Short-lived feature/fix branches branch off `main` and return through pull requests; direct pushes to `main` are not part of the normal workflow
- Merge strategy: Squash merge into `main` with a clean PR title unless the hosting platform enforces a stricter repository setting
- PR title format: `type(scope): summary` (Conventional Commits style)
- PR requirements: Focused scope, passing local `npm run ci` for code changes, no direct push to `main`, and review before merge
