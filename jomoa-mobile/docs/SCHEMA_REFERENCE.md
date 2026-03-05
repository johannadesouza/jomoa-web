# JOMOA Mobile – Supabase Schema Reference

Schema som jomoa-mobile förväntar sig. Använd för att sätta upp en ny Supabase-instans eller verifiera befintlig.

**Förutsättning:** Supabase Auth är aktiverat. Tabellen `auth.users` finns.

**Migrations:** User DB: `jomoa-mobile/supabase/migrations/` (001, 002, …) och `supabase/user/migrations/` (t.ex. 003_cycle_engine.sql). Content: `supabase/content/migrations/`.

**Verifiering User-DB:** Tabellen `daily_insight_log` krävs av `insightService` (dagens insikt på Hem). Om den saknas får du PGRST205/fel vid sparande. Definition finns i `jomoa-mobile/supabase/migrations/001_jomoa_training_schema.sql` – kör den migrationen (eller motsvarande) mot User-DB så att tabellen skapas.

---

## Tabeller (i förväntad ordning)

### clients
Kopplar auth.users till klient-profil.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | uuid, PK | |
| profile_id | uuid, FK → auth.users.id | |
| status | text | |
| onboarding_stage | text, nullable | t.ex. "completed" |
| presentation_profile | text | male / female / neutral – för anpassat innehåll |
| presentation_theme | text | bold / soft / neutral |
| created_at | timestamptz | |

(Fler kolumner kan finnas från tidigare migrations; se `supabase/migrations/` och `supabase/user/migrations/`.)

### training_programs
Programmallar.

| Kolumn | Typ |
|--------|-----|
| id | uuid, PK |
| name | text |
| description | text, nullable |
| target_goal | text, nullable |
| target_duration_weeks | int, nullable |
| is_template | bool |

### program_blocks, program_weeks
Programhierarki: block → veckor.

### program_sessions
Pass per vecka.

| Kolumn | Typ |
|--------|-----|
| id | uuid, PK |
| program_id | uuid |
| week_id | uuid |
| name | text |
| day_of_week | int (1–7, mån–sön) |
| focus | text, nullable |

### session_exercises
Övningar per pass. FK till `exercises`.

### exercises
Övningskatalog.

### client_program_assignments
Aktiva programtilldelningar.

| Kolumn | Typ |
|--------|-----|
| id | uuid, PK |
| client_id | uuid |
| program_id | uuid |
| start_date | date |
| end_date | date, nullable |
| is_active | bool |

### workout_sessions_log
Genomförda pass.

| Kolumn | Typ |
|--------|-----|
| id | uuid, PK |
| client_id | uuid |
| program_session_id | uuid, nullable |
| date | date |
| status | text | "completed" |
| overall_rpe | numeric, nullable | 1–10 |

### set_logs
Set per genomfört pass.

| Kolumn | Typ |
|--------|-----|
| workout_session_log_id | uuid |
| exercise_id | uuid |
| set_number | int |
| reps | int |
| weight | numeric, nullable |
| rpe | numeric, nullable |

### daily_readiness
Daglig readiness per klient.

| Kolumn | Typ |
|--------|-----|
| client_id | uuid |
| date | date |
| sleep_hours | numeric, nullable |
| sleep_quality | numeric, nullable |
| stress_level | numeric, nullable |
| energy_level | numeric, nullable |
| soreness | numeric, nullable |
| readiness_score | numeric, nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

### daily_insight_log
Dagliga insikter.

| Kolumn | Typ |
|--------|-----|
| client_id | uuid |
| date | date |
| phase | text, nullable |
| insight_title | text |
| insight_body | text, nullable |
| actions | jsonb (array) |
| tags | jsonb (array) |

### cycle_events
Legacy cykelhändelser (t.ex. period_start). Används fortfarande för periodloggning; cycle engine använder även denna data vid behov.

| Kolumn | Typ |
|--------|-----|
| client_id | uuid |
| date | date |
| event_type | text |
| source | text |

### cycle_phases, cycle_symptoms
Cykelfaser och symptom (valfritt; innehåll kan ligga i Content DB).

### Cycle engine (User DB)

Tabellerna finns i `supabase/user/migrations/003_cycle_engine.sql`:

- **cycles** – aktiva och avslutade cyklar (start_date, end_date, length_days, status).
- **cycle_stats** – rolling average/stddev, last_cycle_length_days, last_period_start_date.
- **user_cycle_settings** – per klient: mode (regular | missing_period | perimenopause), missing_period_threshold_days, overdue_soft_days, overdue_hard_days.

---

## RLS

Alla tabeller behöver RLS-policies så att:
- Klienter endast ser/ändrar egen data (`client_id` eller `profile_id` kopplat till auth.uid()).
- Auth-användare kan läsa `clients` via `profile_id = auth.uid()`.

---

## Körordning för migreringar

Om du skapar migrations manuellt:

1. `clients` (beroende: auth.users)
2. `training_programs`, `program_blocks`, `program_weeks`, `program_sessions`, `session_exercises`, `exercises`
3. `client_program_assignments`
4. `workout_sessions_log`, `set_logs`
5. `daily_readiness`, `daily_insight_log`
6. `cycle_events`, `cycle_phases`, `cycle_symptoms` (om används)
