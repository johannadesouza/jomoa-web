# JOMOA – Decisions

Korta noteringar om viktiga tekniska beslut. Ingen historik – bara nuvarande läge.

## Two Supabase projects (User DB + Content DB)

- **User DB:** Persondata (clients, workout_sessions_log, set_logs, daily_readiness, cycles, user_cycle_settings, body_measurements, etc.). Endast mobilappen och backend som behöver det har tillgång.
- **Content DB:** Program, övningar, artiklar, copy, insiktsmallar, symptomoptions. Web och admin använder endast Content DB – ingen persondata där. GDPR-separation; content-db-migration är genomförd (historik i `docs/archive/content-db-migration.md`).

## Cycle engine (event-driven, DB-driven)

- Ny modell: tabellerna `cycles`, `cycle_stats`, `user_cycle_settings` och tjänsten `cycleEngineService` + ren logik i `cycleEngine.ts`. Legacy `cycle_events` används fortfarande för periodloggning; engine kan läsa därifrån vid behov.
- Cycle mode (regular / missing_period / perimenopause) styr vilka regler som används i adaptation och vilken copy/UI som visas.

## Adaptation engine

- Ren, testad domän: `lib/adaptation/` – engine + rules (cycle phase, readiness, perimenopause, recent load, weekly progression). UI anropar engine via hooks (t.ex. useTrainingAdaptation); ingen affärslogik i komponenter.
- Readiness-score och insiktslogik kan ligga kvar i services tills de flyttats till domain/ eller Content DB (insight_templates finns redan i Content DB).

## Presentation profile och tema

- `clients.presentation_profile` (male / female / neutral) och `presentation_theme` (bold / soft / neutral) används för onboarding och anpassat innehåll; terminology överens med koden.

## Migrationsplatser

- **User DB:** `jomoa-mobile/supabase/migrations/` (grundschema, RLS, mätningar, daganteckningar, etc.) och `supabase/user/migrations/` (cycle engine).
- **Content DB:** `supabase/content/migrations/`.
- Web har egna tabeller (t.ex. waitlist) enligt web-projektet.
