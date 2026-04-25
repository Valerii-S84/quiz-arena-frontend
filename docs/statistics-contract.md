# Statistics Contract

Status: verified against the frontend repo and the backend repo `Valerii-S84/quiz-arena` on 2026-04-25.

This document is the current source of truth for the frontend-consumed statistics routes:

- `GET /stats`
- `GET /admin/overview?period=7d|30d|90d`

Backend sources used for verification:

- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/public_site.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_payload.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_payload_kpis.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_payload_conversion.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_series.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_feature_usage.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_activity_metrics.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_metrics.py`
- `https://github.com/Valerii-S84/quiz-arena/blob/main/app/api/routes/admin/overview_streak_metrics.py`

Frontend sources used for verification:

- `app/(public)/public-home-data.ts`
- `app/(public)/public-home-helpers.ts`
- `app/(public)/public-home-sections.tsx`
- `app/(admin)/admin/(secure)/dashboard/page.tsx`
- `app/(admin)/admin/(secure)/dashboard/dashboard-config.ts`
- `app/(admin)/admin/(secure)/dashboard/dashboard-types.ts`
- `app/(admin)/admin/(secure)/dashboard/dashboard-overview-sections.tsx`

## 1. `GET /stats`

Auth:

- Public route.

Response shape:

| Field | Type | Actual backend meaning | Frontend label |
|---|---|---|---|
| `users` | `number` | Lifetime total count of rows in `User` | `Nutzer` |
| `quizzes` | `number` | Lifetime total count of `QuizSession` rows where `status == "COMPLETED"` and `completed_at IS NOT NULL` | `Gespielte Quizze` |

Contract notes:

- `quizzes` is completed quiz sessions, not quiz starts.
- `quizzes` is not distinct users.
- `users` and `quizzes` are lifetime totals, not period-based metrics.
- The backend also exposes `GET /public/metrics`, but the frontend does not use it.

## 2. `GET /admin/overview`

Auth:

- Requires admin session via backend auth dependency.

Query params:

| Param | Allowed values | Backend behavior |
|---|---|---|
| `period` | `7d`, `30d`, `90d` | Any other value falls back to `7d` |

Caching:

- Response is cached for `300` seconds under `admin:overview:{days}`.

Window model:

- Current window: `[now_utc - days, now_utc)`
- Previous window: `[now_utc - 2 * days, now_utc - days)`
- `generated_at` is the backend `now_utc` timestamp.

Response shape:

| Field | Type | Actual backend meaning |
|---|---|---|
| `period` | `string` | Normalized backend period string: `7d`, `30d`, or `90d` |
| `generated_at` | ISO datetime | UTC timestamp generated on the backend |
| `kpis` | `Record<string, { current, previous, delta_pct }>` | KPI cards described below |
| `revenue_series` | `Array<{ date, stars, eur }>` | Revenue timeline for the current window |
| `users_series` | `Array<{ date, new_users, active_users }>` | Daily user timeline for the current window |
| `hourly_activity_series` | `Array<{ hour, active_users }>` | Hour-of-day activity aggregation for the current window |
| `funnel` | `Array<{ step, value }>` | Milestone counts in fixed backend order |
| `top_products` | `Array<{ product, revenue_stars }>` | Top 5 products by revenue in stars for the current window |
| `feature_usage` | `Record<string, { current, previous, delta_pct }>` | Feature usage cards described below |
| `alerts` | `Array<object>` | Alert cards described below |

### 2.1 KPI card contract

Each KPI card has this shape:

| Field | Type | Meaning |
|---|---|---|
| `current` | `number` | Current window value |
| `previous` | `number` | Previous same-length window value |
| `delta_pct` | `number` | `((current - previous) / previous) * 100`, rounded to 2 decimals |

Special delta rule:

- If `previous <= 0` and `current > 0`, backend returns `100.0`.
- If `previous <= 0` and `current == 0`, backend returns `0.0`.

### 2.2 `kpis` meanings

| Key | Actual backend meaning |
|---|---|
| `dau` | Distinct users with activity in the last 24 hours |
| `wau` | Distinct users with activity in the last 7 days |
| `mau` | Distinct users with activity in the last 30 days |
| `new_users` | Users created in the selected current window |
| `revenue_stars` | Sum of `Purchase.stars_amount` in the selected current window for paid purchases with status `PAID_UNCREDITED` or `CREDITED` |
| `revenue_eur` | `revenue_stars * 0.02` |
| `active_subscriptions` | Active `PREMIUM` entitlements at `now_utc` |
| `retention_d1` | Percentage of users created in the selected window who had activity on exactly Berlin local day `cohort_day + 1` |
| `retention_d7` | Percentage of users created in the selected window who had activity on exactly Berlin local day `cohort_day + 7` |
| `start_users` | Current backend implementation uses `new_users`, not a real `/start` event counter |
| `conversion_start_to_quiz` | `first_quiz_users / new_users * 100` in current backend implementation |
| `conversion_quiz_to_purchase` | `distinct paid purchase users / distinct quiz-start users * 100` in the selected window |

Activity definition used by `dau`, `wau`, `mau`, and retention:

- User created in the window.
- Or `AnalyticsEvent.user_id` exists in the window.
- Or `QuizSession.started_at` exists in the window.

This means a newly created user counts as active even without a later quiz or analytics event.

Retention note:

- Users whose `cohort_day + offset` is beyond the visible period end are excluded from the retention denominator.

### 2.3 `revenue_series`

Shape:

| Field | Type | Meaning |
|---|---|---|
| `date` | `YYYY-MM-DD` string | `date(Purchase.paid_at)` from the database |
| `stars` | `number` | Daily revenue in stars |
| `eur` | `number` | Daily revenue in euro using rate `0.02` |

Important note:

- `revenue_series.date` is grouped by database date from `Purchase.paid_at`, not by an explicit Berlin-local date conversion.
- `revenue_series` does not apply the stricter KPI purchase status filter. It uses any purchase row with `paid_at` inside the selected window.

### 2.4 `users_series`

Shape:

| Field | Type | Meaning |
|---|---|---|
| `date` | `YYYY-MM-DD` string | Berlin local calendar date |
| `new_users` | `number` | Users created on that Berlin local date |
| `active_users` | `number` | Distinct users active on that Berlin local date |

Activity definition for `users_series.active_users`:

- User created on that Berlin local date.
- Or `AnalyticsEvent.user_id` present on that Berlin local date.
- Or `QuizSession.started_at` present on that Berlin local date.

### 2.5 `hourly_activity_series`

Shape:

| Field | Type | Meaning |
|---|---|---|
| `hour` | `number` | Berlin local hour bucket `0..23` |
| `active_users` | `number` | Distinct users active at least once in that Berlin hour across the whole selected period |

Contract notes:

- Backend always returns exactly 24 entries for hours `0` through `23`.
- Missing hour buckets are filled with `0`.
- This is not per-day average activity.
- This is not total event count.
- The same user can be counted in multiple hours if they were active in multiple hour buckets during the selected period.

### 2.6 `funnel`

Backend order is fixed and currently emitted as:

1. `Start`
2. `First Quiz`
3. `Streak 3+`
4. `Purchase`

Actual meanings:

| Step | Meaning |
|---|---|
| `Start` | Current backend implementation uses `new_users` in the selected window |
| `First Quiz` | Users whose first non-canceled quiz start happened in the selected window |
| `Streak 3+` | Users whose first hit of a 3-day completed-quiz streak happened in the selected window |
| `Purchase` | Users whose first paid purchase happened in the selected window |

Important note:

- This is not a strict single-cohort funnel.
- `Start`, `First Quiz`, `Streak 3+`, and `Purchase` are milestone counts anchored to the same time window, but not to the same user cohort.
- Because of that, a later step can theoretically exceed an earlier step.

### 2.7 `top_products`

Shape:

| Field | Type | Meaning |
|---|---|---|
| `product` | `string` | Backend `Purchase.product_code` |
| `revenue_stars` | `number` | Sum of stars for that product from purchase rows with `paid_at` inside the selected window |

Contract notes:

- Top 5 products only.
- Ordered descending by `revenue_stars`.
- `top_products` does not apply the stricter KPI purchase status filter. It uses purchase rows with `paid_at` inside the selected window.

### 2.8 `feature_usage`

| Key | Actual backend meaning |
|---|---|
| `duel_created_users` | Distinct users with analytics event `duel_created` in the selected window |
| `duel_completed_users` | Distinct users with analytics event `duel_completed` in the selected window |
| `duel_completion_rate` | `duel_completed_users / duel_created_users * 100` |
| `referral_shared_users` | Distinct users with analytics event `referral_link_shared` in the selected window |
| `referral_referrers_started` | Distinct `Referral.referrer_user_id` rows created in the selected window |
| `daily_cup_registered_users` | Distinct users with analytics event `daily_cup_registered` in the selected window |

Important note:

- `duel_completion_rate` is user-level completion rate, not duel-level completion rate.

### 2.9 `alerts`

| Type | Actual backend trigger |
|---|---|
| `webhook_errors` | `OutboxEvent.status` in `FAILED` or `ERROR` during the last 24 hours |
| `conversion_drop` | Current `quiz_to_purchase` is below `80%` of previous `quiz_to_purchase` |
| `suspicious_activity` | Invalid promo attempts during the last hour are `>= 25` |

## 3. Frontend invariants required by this contract

- Public homepage `quizzes` must be read as completed quiz sessions, not started quiz sessions.
- Admin dashboard must treat `generated_at` as UTC input that is rendered in Berlin timezone.
- Admin dashboard must assume `hourly_activity_series` is exactly 24 Berlin-local hour buckets.
- Admin dashboard currently relies on backend `funnel` order; if backend order changes, frontend conversion display becomes wrong.
- Admin dashboard must not treat `revenue_series.date` and `users_series.date` as the same timezone semantic without explicit normalization.

## 4. Contract issues already visible from backend verification

- `start_users` does not represent a real start event today; it is backed by `new_users`.
- `conversion_start_to_quiz` therefore means `new users -> first quiz`, not `bot start -> first quiz`.
- `hourly_activity_series.active_users` is "distinct users seen in that hour bucket across the whole period", which is much broader than "users active in that hour today" or "average users per hour".
- `funnel` is a milestone window summary, not a strict conversion funnel over one cohort.
- `revenue_stars` KPI, `revenue_series`, and `top_products` are not filtered by exactly the same purchase-status rules today.

These are not frontend guesses. They follow directly from the current backend implementation and must be treated as real contract constraints until backend logic changes.
