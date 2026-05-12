# Website Quiz Teaser Frontend E2E Evidence

Date: 2026-05-12

Scope: local-only frontend verification against the API Bank handoff for consumer `website_quiz_teaser`. VPS/live deploy was not touched. This is a Controlled Protected Beta verification, not a broad public launch, not public signup, and not a commercial launch.

## Handoff Used

- Source contract: `../API Quiz Bank/reports/beta/website_quiz_teaser_api_handoff_evidence_2026-05-12.md`
- Local secure env handoff copied to ignored `.env.local`.
- API Bank base URL, masked: `http://127.0.0.1:8***`
- Consumer id: `website_quiz_teaser`
- No consumer reprovisioning was performed.
- No new credentials were generated.
- No API Bank repository files were changed.

Note: because the controlled quota is `5/day`, the local E2E run used an API process pointed at a temporary SQLite copy under `/tmp` with prior delivery/quota rows cleared for this consumer. The original API Bank repo and local source DB were not modified.

## Frontend URL

- Local frontend: `http://127.0.0.1:3000`

## Contract Alignment

- Browser calls frontend route: `POST /api/quiz-teaser/next`.
- Server route calls API Bank endpoint: `POST /v1/quiz-items/next`.
- Server route sends handoff headers server-side only: `X-API-Key`, `X-Consumer-Id`, `X-QuizBank-API-Key`.
- Server route sends body aligned with handoff: `{ consumer_id, cefr_level: "A2", theme_ids: ["T02"] }`.
- Response mapper reads:
  - id from `quiz_item.id` / `quiz_item.public_id`
  - prompt from `quiz_item.question.text`
  - options from `quiz_item.options[].id` / `quiz_item.options[].text`
  - feedback from protected-beta `quiz_item.feedback.correctAnswerId`
  - explanation from `quiz_item.feedback.explanation`
- Raw backend internals and credentials are not returned to the browser.
- Raw `answer_key` is not expected or used.

## Browser E2E Proof

Headless Chrome DevTools Protocol drove the homepage and captured network requests.

- Homepage opened: yes.
- Quiz teaser placement: `#stats` before `#quiz-teaser`, `#quiz-teaser` before `#bot`.
- “Quiz starten” worked: yes.
- Progress observed:
  - `Frage 1 von 5`
  - `Frage 2 von 5`
  - `Frage 3 von 5`
  - `Frage 4 von 5`
  - `Frage 5 von 5`
- Real question calls: 5 successful calls through the local proxy.
- Answer feedback displayed: yes.
- Explanation displayed at least once: yes.
- Final score displayed: `Dein Ergebnis: 1/5`.
- Telegram CTA worked: `https://t.me/Deine_Deutsch_Quiz_bot?start=site_public_home`.

Captured browser API-like requests:

```text
POST http://127.0.0.1:3000/api/quiz-teaser/next -> 200
POST http://127.0.0.1:3000/api/quiz-teaser/next -> 200
POST http://127.0.0.1:3000/api/quiz-teaser/next -> 200
POST http://127.0.0.1:3000/api/quiz-teaser/next -> 200
POST http://127.0.0.1:3000/api/quiz-teaser/next -> 200
POST http://127.0.0.1:3000/api/quiz-teaser/next -> 429
```

Direct browser requests to API Bank (`127.0.0.1:8000` or `/v1/quiz-items/next`): none.

## Quota Behavior

After the 5-question run consumed the daily quota, “Noch einmal spielen” called the same local proxy and received `429`.

Frontend public message:

```text
Das Quiz-Limit für heute ist erreicht. Bitte versuche es später erneut oder mache im Telegram-Bot weiter.
```

No backend details were visible in the quota UI: no `QUOTA_EXCEEDED`, no auth codes, no reason codes, no stack traces.

## Security Proof

- `.env.local` is git-ignored by `.gitignore:15`.
- `QUIZ_BANK_*` secrets are server-side only; no `NEXT_PUBLIC_QUIZ_BANK_*` secrets were added.
- Browser HTML scan:
  - `QUIZ_BANK_` names found: no
  - `qb_...` key pattern found: no
- JS bundle scan:
  - secret/env hits: none
- Browser network:
  - API Bank direct calls: none
  - only local quiz route: `/api/quiz-teaser/next`
- Tracked-file raw secret scan:
  - scanned tracked files plus this report: 123
  - raw secret value hits: none
- Git status shows `.env.local` is not tracked.

Fail-closed/error coverage:

- Missing env returns safe `503 { "error": "quiz_teaser_unavailable" }`.
- Wrong credential / unauthorized upstream `401` maps to safe unavailable response.
- Suspended or revoked consumer-style upstream `403` maps to safe unavailable response.
- Upstream `429` maps to safe quota response and the public quota message.

## Analytics

Observed event names during E2E:

- `quiz_teaser_started`
- `quiz_teaser_question_answered`
- `quiz_teaser_completed`
- `quiz_teaser_cta_clicked`
- `quiz_teaser_error`

Payload check:

- no personal data
- no secrets
- no raw `answer_key`

## Verification Commands

```text
npm run lint      -> pass
npm test          -> pass (17 files, 105 tests)
npm run typecheck -> pass
npm run build     -> pass
npm run ci        -> pass
```

Additional checks:

```text
git check-ignore -v .env.local .env -> ignored
tracked raw secret scan -> 0 hits
browser HTML secret scan -> 0 hits
browser JS bundle secret scan -> 0 hits
git status --short -> modified frontend files plus this report; .env.local absent
```

## Result

Website Quiz Teaser works end-to-end locally:

```text
website -> Next.js /api/quiz-teaser/next -> API Bank protected endpoint -> quiz widget
```

The local flow completed 5 real questions, displayed final score, fired the Telegram CTA, kept API Bank credentials server-side, and showed a clean quota-exceeded state after the quota was consumed.
