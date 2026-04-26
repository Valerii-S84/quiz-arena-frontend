# Frontend Baseline (дата: 2026-04-26)

## Метрики до змін
- `npm run ci` на момент знімка проходить:
  - `lint`
  - `test` (`9` файлів, `40` тестів)
  - `typecheck`
  - `build`
- Next build маршрутний дублікат:
  - `/` — `17.1 kB`, First Load JS `159 kB`
  - `/contact` — `139 B`, First Load JS `102 kB`
  - `/projects` — `139 B`, First Load JS `102 kB`
  - `/admin/login` — `10.1 kB`, First Load JS `149 kB`
  - `/admin/dashboard` — `14.3 kB`, First Load JS `263 kB`
- `lang` на root layout до змін: `uk`

## Що було виконано в baseline-сетапі
- Відмічено сильні точки для швидких кроків:
  - глобальний metadata у `app/layout.tsx`
  - відсутні route-level метадані для ключових публічних сторінок
  - відсутній `sitemap` і явний `sitemap` в `robots`
  - public home мав admin login modal
  - контактний email `ops@quizarena.local`
- Цей файл використовується як стартова точка для порівняння після кроків 1–7.
