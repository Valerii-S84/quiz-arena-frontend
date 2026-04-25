# Statistics Manual Verification

Status: completed on 2026-04-26.

Source payloads:

- [public-stats-seeded.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/public-stats-seeded.json)
- [admin-overview-seeded-7d.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/admin-overview-seeded-7d.json)
- [admin-overview-empty-7d.json](/mnt/c/Users/User/Desktop/quiz-arena-frontend/docs/statistics-fixtures/admin-overview-empty-7d.json)

Frontend surfaces checked:

- [app/(public)/public-home-sections.tsx](/mnt/c/Users/User/Desktop/quiz-arena-frontend/app/(public)/public-home-sections.tsx)
- [app/(admin)/admin/(secure)/dashboard/dashboard-normalization.ts](/mnt/c/Users/User/Desktop/quiz-arena-frontend/app/(admin)/admin/(secure)/dashboard/dashboard-normalization.ts)
- [app/(admin)/admin/(secure)/dashboard/dashboard-overview-sections.tsx](/mnt/c/Users/User/Desktop/quiz-arena-frontend/app/(admin)/admin/(secure)/dashboard/dashboard-overview-sections.tsx)

Verification checklist:

| Metric | Raw payload value | Expected meaning | UI result |
|---|---:|---|---|
| `/stats.quizzes` | `1` | Lifetime completed quiz sessions only | Public card `Gespielte Quizze` shows `1` |
| `kpis.dau.current` | `2` | Distinct active users in the last 24h | KPI card `Aktive Nutzer (24h)` shows `2` |
| `kpis.conversion_start_to_quiz.current` | `50` | New users with first quiz in period | KPI card `Neue Nutzer zu erstem Quiz` shows `50,0 %` |
| `feature_usage.duel_completed_users.current` | `0` | Real zero feature usage, not missing data | Feature card `Duell abgeschlossen` shows `0`, not `Keine Daten` |
| `hourly_activity_series` peak | `hour=10`, `active_users=2` | Highest Berlin hour bucket in fixture; ties keep the earliest bucket | Insight card `Peak` shows `10:00-11:00` and `2 aktive Nutzer...` |
| `revenue_series` total stars | `100` | Sum of current-window revenue stars | Revenue badge shows `Gesamt: 100 ⭐` |
| `alerts` empty array | `[]` | Valid empty alert state | Alert section shows `Aktuell keine kritischen Warnungen.` |

Empty-state cross-check:

- `admin-overview-empty-7d.json` keeps all KPI metrics structurally valid with numeric zero values.
- In the dashboard, valid zero KPI cards still show `0`.
- `Keine Daten` is reserved for missing/invalid section data such as dropped KPI fields or invalid series payloads.

Evidence in automated checks:

- `app/(admin)/admin/(secure)/dashboard/dashboard-normalization.test.ts`
- `app/(admin)/admin/(secure)/dashboard/dashboard-overview-sections.test.tsx`
- `app/(public)/public-home-data.test.ts`

Result:

- The checked raw payload values, normalized values, and rendered frontend copy are aligned for the selected real backend fixtures.
