# Auth boundary hardening: FE + BE checklist (step 15)

## FE changes implemented in this cycle

- `lib/api.ts`
  - встановлено централізований клієнтський timeout (`15_000` ms) на API-інстансі;
  - для всіх запитів додано `Accept: application/json` та `X-Requested-With: XMLHttpRequest`;
  - для всіх запитів додаються trace-заголовки `X-Request-Id`, `X-Client-Context`, `X-Client-Origin`
    для підтвердження походження запитів у backend-логах;
  - для state-changing методів (`POST`, `PUT`, `PATCH`, `DELETE`) додано спробу долучення CSRF токену з browser cookie (`XSRF-TOKEN` за замовчуванням) у `X-CSRF-Token`;
  - додано централізовану класифікацію помилок (`classifyApiError`) для `401/403/419/429` сценаріїв;
  - додано обробку `429` від API як окремого signal (`TOO_MANY_REQUESTS`) для дальшої політики retry/rate-limit UI.
- `app/(admin)/admin/login/page.tsx`
  - розрізняються помилки login/2FA на рівні UX: rate-limit отримує окреме повідомлення,
    `CSRF/Forbidden` — окремий security-блок, `NETWORK_ERROR` — повідомлення про мережу.
- `app/(admin)/admin/(secure)/layout.tsx`
  - до session-check запиту додано `Accept`, `X-Requested-With`, `X-Client-Context`
    для посилення traceability на ланці auth.
- `app/(admin)/admin/(secure)/layout.tsx`
  - посилена server-side сесійна перевірка: помилковий/невалідний payload (`email` відсутній або порожній) редиректить на `/admin/login`;
  - додано timeout для backend session-check (`3s`) із скасуванням запиту через `AbortController` (prevents hanging SSR requests).

## BE/infra verification checklist (required before step-15 DoD is complete)

All items below must be confirmed in backend / infra, not only in frontend code.

### Auth + session transport
- [ ] `POST /admin/auth/login` та `/admin/auth/2fa/verify` встановлюють cookie лише через HTTPS (`Secure`) та недоступно JS (`HttpOnly`).
- [ ] `SameSite` політика для auth-cookie відповідає threat-model (`Lax` або `Strict`) і не має fallback на `None` без `Secure`.
- [ ] `Set-Cookie` має чітко визначений `Path` / `Domain` для admin зони.
- [ ] `/admin/auth/session` повертає коректний JSON payload з мінімальним полем `email`.

### CORS + credentialed calls
- [ ] Для credentialed endpointів (`withCredentials=true`) API не повертає `Access-Control-Allow-Origin: *`.
- [ ] Для адмін-роутів відповідає CORS-набір: `Access-Control-Allow-Credentials: true`, точний origin frontend і явно дозволені headers.
- [ ] `OPTIONS` preflight для `POST/PATCH/DELETE` відповідає `Access-Control-Allow-Methods` та `Access-Control-Allow-Headers` з `X-CSRF-Token`/`Content-Type`.

### CSRF + origin policy
- [ ] Backend валідовує CSRF (double-submit або session token) для всіх state-changing admin endpointів.
- [ ] Для чутливих admin endpoints перевіряється `Origin`/`Referer` проти дозволених доменів.

### Rate limiting + abuse control
- [ ] `POST /admin/auth/login` має rate-limit за IP + user-agent + account signature.
- [ ] `POST /admin/auth/2fa/verify` має rate-limit/lockout та індикатор throttling (`429`).
- [ ] Впроваджений захист від credential stuffing + alert для burst-піків.

### Logging and audit
- [ ] Логи фіксують: failed login, 2FA failures, authz failures, session refresh, critical admin actions.
- [ ] Логи корелюються з trace/correlation id та мають retention policy, доступний для incident review.

## DoD (step 15)
- FE hardening changes are merged and deployed.
- All backend checklist items above are verified and documented with evidence (endpoint examples / config excerpts / screenshots / audit logs).
- Security smoke: admin login/logout, CSRF-failed request, `withCredentials` login flow, and rate-limit path pass QA smoke without regressions.

### Automated backend smoke (this repo)

- Command:
  - `AUTH_BOUNDARY_BASE_URL=<api-origin> AUTH_BOUNDARY_FRONTEND_ORIGIN=<public-origin> npm run auth:boundary:smoke`
  - or: `npm run auth:boundary:smoke -- --base-url=<api-origin> --frontend-origin=<public-origin>`
- Script:
  - [scripts/auth-boundary-smoke.mjs](/mnt/c/Users/User/Desktop/quiz-arena-frontend/scripts/auth-boundary-smoke.mjs)
- Evidence to keep:
  - command output with high-severity failures list,
  - timestamped copy of report in issue/task comment or `docs/auth-boundary-smoke-report.md`.
- What script checks:
  - CORS preflight for `POST /admin/auth/login` and `POST /admin/auth/2fa/verify`,
  - anonymous `/admin/auth/session` response code/payload,
  - login status and cookie flags on auth response,
  - rate-limit sampling on repeated `/admin/auth/login`.
