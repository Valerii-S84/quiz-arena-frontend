# PR: chore(home): split public homepage islands and harden auth boundary checks

## Context
This PR closes the remaining implementation steps 14-15 from the frontend improvement plan:
- Step 14: split homepage into server/client islands to reduce initial JS
- Step 15: harden auth boundary (FE checks, headers, and backend smoke script)

## Changes

### 1) Homepage architecture (step 14)
- Converted public home page shell to server rendering and kept interactive behavior in a small client island.
  - `app/(public)/page.tsx`
  - `app/(public)/public-home-client.tsx`
  - `app/(public)/public-home-sections.tsx`
- Added server-side public stats loading helper for first paint without client hydration delay.
  - `app/(public)/public-home-server-stats.ts`
- Reworked hero/channel visual polish to avoid JSX keyframe injection in server route and keep styling in utility classes.

### 2) Auth boundary hardening (step 15)
- Added stronger client API defaults and security metadata in API client.
  - `lib/api.ts`
    - global timeout (`15_000ms`)
    - request headers: `Accept`, `X-Requested-With`, `X-Request-Id`, `X-Client-Context`, `X-Client-Origin`
    - CSRF header pass-through from cookie for state-changing methods
    - centralized error code classification (`classifyApiError`)
    - explicit tags for `401/403/429/CSRF`
- Improved admin login UX by mapping auth errors to security-aware messaging.
  - `app/(admin)/admin/login/page.tsx`
- Hardened secure admin layout session check.
  - `app/(admin)/admin/(secure)/layout.tsx`
    - fetch timeout + abort
    - safer payload validation (`email` presence check)
    - explicit request headers for traceability

### 3) Security verification tooling
- Added backend-facing boundary smoke script for reusable checks.
  - `scripts/auth-boundary-smoke.mjs`
- Added npm script:
  - `auth:boundary:smoke` in `package.json`
- Added implementation + verification checklist.
  - `docs/auth-boundary-hardening-checklist.md`

## Validation done
- `npm run ci` (from prior iteration) passed after these edits.
- `npm run auth:boundary:smoke -- --base-url=http://localhost:8000 --frontend-origin=http://localhost:3000`
  - currently fails with network-level `fetch failed` for all tested auth endpoints (backend not reachable from this environment), no endpoint-level conclusions.

## Risks / Scope notes
- Backend-side CORS/CSRF/rate-limit/security controls are still validation tasks and are intentionally part of Step 15 DoD in backend.
- This PR intentionally does not change backend logic; it strengthens FE boundary posture and prepares verification process.

## Deployment / Follow-up
- Merge this PR first to lock down production-ready client architecture + auth observability baseline.
- Follow-up PR:
  - rerun `auth:boundary:smoke` against real API origin and attach report artifacts
  - remove any remaining warnings depending on backend expectations
  - continue step 13->14 pipeline items if needed

## Files changed
- `app/(public)/page.tsx`
- `app/(public)/public-home-client.tsx`
- `app/(public)/public-home-sections.tsx`
- `app/(public)/public-home-server-stats.ts`
- `app/(admin)/admin/login/page.tsx`
- `app/(admin)/admin/(secure)/layout.tsx`
- `lib/api.ts`
- `package.json`
- `scripts/auth-boundary-smoke.mjs`
- `docs/auth-boundary-hardening-checklist.md`
