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

**Source of truth**: `cycle_events` (period_start, etc.).

- `getLatestPeriodStart` provides the basis for phase calculation.
- Phases are computed via `calculateCyclePhase` in `cycleUtils.ts`.
