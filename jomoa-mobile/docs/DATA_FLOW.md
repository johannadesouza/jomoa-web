# Data Flow & Source of Truth

## Calendar & Planned Workouts

**Source of truth for planned workouts**: `client_program_assignments` (active) → `program_weeks` → `program_sessions`.

- The **calendar** (`useCalendarMonth`) shows planned sessions per month based on the client’s active program.
- **Dashboard** and **Workouts** use the same source: `fetchActiveAssignment` + `fetchSessionsByWeekId` / `fetchSessionsForWorkouts`.
- Planned sessions come from `program_sessions` (day_of_week, name, etc.).

## Workout Completion

**Source of truth for completed workouts**: `workout_sessions_log`.

- When a workout is completed, a row is inserted in `workout_sessions_log` with `status = 'completed'`.
- `set_logs` stores reps, weight, RPE per set.
- Calendar and Dashboard use `fetchLoggedWorkoutsForRange` / `fetchTodayCompletedSession` to show completed workouts.

## Readiness

**Source of truth**: `daily_readiness`.

- One row per client per date.
- Logged from ReadinessScreen, used by Dashboard and `useDailyInsight`.

## Insights

**Source of truth**: derived from `workout_sessions_log` and `set_logs`.

- `fetchInsightStats` / `fetchWeeklyStats` aggregates volume, RPE, streak.
- Insights are calculated on demand, not stored separately (except `daily_insight_log` for today’s recommendation).

## Cycle

**Primary source of truth**: Cycle engine – tabellerna `cycles`, `cycle_stats`, `user_cycle_settings` (User DB, se `supabase/user/migrations/003_cycle_engine.sql`).

- **cycleEngineService** läser/skriver `cycles` och `cycle_stats`, använder **cycleEngine.ts** (pure) för fas, overdue, fasgränser.
- **user_cycle_settings** styr läge: `regular` | `missing_period` | `perimenopause` (cycle mode).
- Legacy **cycle_events** används fortfarande för periodloggning; `getLatestPeriodStart` (cycleService) anropas av cycleEngineService för migrering/fallback.
- UI använder **CycleContext** och hooks (useCycle, useCyclePhase, useTrainingAdaptation) som bygger på cycleEngineService.
