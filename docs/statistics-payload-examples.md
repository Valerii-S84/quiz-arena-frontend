# Statistics Payload Examples

This document records the concrete payload examples captured for step 2 of the statistics hardening plan.

Source:

- Backend repo: `Valerii-S84/quiz-arena`
- Generation date: `2026-04-25`
- Generation method: seeded directly through backend code against the local test database, then serialized from the real backend payload builders

Generated fixtures:

- [public-stats-seeded.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/public-stats-seeded.json)
- [admin-overview-seeded-7d.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/admin-overview-seeded-7d.json)
- [admin-overview-seeded-30d.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/admin-overview-seeded-30d.json)
- [admin-overview-seeded-90d.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/admin-overview-seeded-90d.json)
- [admin-overview-empty-7d.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/admin-overview-empty-7d.json)

Scenario meanings:

- `public-stats-seeded.json`
  - One user.
  - One completed quiz session.
  - One started but not completed quiz session.
  - Confirms that `/stats.quizzes` counts completed quiz sessions only.

- `admin-overview-seeded-7d.json`
  - Focused “active current week” scenario.
  - Contains signups, completed quiz sessions, two bot-start analytics events, and one credited purchase.
  - Good baseline for validating KPI cards, hourly activity, funnel, and a non-empty revenue series.

- `admin-overview-seeded-30d.json`
  - Same seed, but wider period.
  - Pulls an older user and older quiz session into the current window.
  - Shows how `new_users`, `retention_d1`, `hourly_activity_series`, and funnel counts shift when the selected period expands.

- `admin-overview-seeded-90d.json`
  - Same seed, 90-day period.
  - In this controlled dataset it is almost identical to `30d`, because the seeded activity already fits inside the wider window and the earlier comparison window stays empty.

- `admin-overview-empty-7d.json`
  - Empty database window.
  - Confirms the real backend empty-state shape:
    - KPI numbers are `0.0`
    - `revenue_series` and `users_series` are empty arrays
    - `hourly_activity_series` still contains 24 buckets
    - `funnel` still contains all named steps with zero values

What these fixtures prove:

- Backend returns numeric values as JSON numbers, not strings, in these seeded scenarios.
- Backend always returns all 24 hourly buckets, even when there is no activity.
- Empty overview payloads still preserve dashboard structure instead of omitting sections.
- The public `/stats` response is much narrower than `/admin/overview` and only exposes lifetime `users` and completed `quizzes`.

Known limitation of these fixtures:

- They cover normal and empty real backend payloads, but not malformed payloads, because the backend serializers do not emit malformed shapes in these runs.
- Feature-usage metrics are all zero in the seeded examples because no feature-specific analytics events were injected yet.
- Alert scenarios are not represented yet; no webhook failures, promo abuse spikes, or conversion-drop comparison case were seeded in this step.
