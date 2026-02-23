# FULL SYSTEM PANIC AUDIT

**Date:** 2026-02-22  
**Scope:** jomoa-mobile (React Native / Expo)  
**Focus:** Loading loops, state issues, persistence problems. No implementation—analysis only.

---

## 1. RUNTIME & LOADING AUDIT

### 1.1 useEffect with incorrect or risky dependency arrays

| File | Line | Issue | Severity | Suggested minimal fix |
|------|------|-------|----------|------------------------|
| `src/lib/hooks/useDailyInsight.ts` | 65–73 | `useEffect` depends on `[clientId, refetch]`. `refetch` is recreated whenever `phase`, `cycleDay`, or `readiness?.readiness_score` / `readiness?.energy_level` change. When Cycle or Readiness finish loading, `refetch` identity changes → effect re-runs → another debounced refetch after 300ms. Can cause multiple insight refetches on dashboard mount/focus. | **Medium** | Stabilize refetch (e.g. ref for latest input) or run effect only on `clientId` and call refetch from a ref that always has current phase/readiness. |
| `src/features/dashboard/DashboardScreen.tsx` | 80–97 | `useFocusEffect` depends on 7 refetch functions. If any hook returns a new refetch reference on each render (e.g. from unstable `useCallback` deps upstream), focus effect may run more than intended. | **Low** | Ensure all refetch callbacks are memoized with stable deps; or use a single “refresh all” callback that doesn’t depend on refetch identities. |

### 1.2 useEffect that sets state inside itself

All identified useEffects that set state are async loaders or one-time init. No infinite setState-in-effect loop found.  
**Note:** `ReadinessScreen.tsx` (39–46) syncs form state from `readiness` in an effect; this is a controlled sync pattern, not a loop risk.

### 1.3 Async functions not awaited

| File | Line | Issue | Severity | Suggested minimal fix |
|------|------|-------|----------|------------------------|
| `src/shared/context/AuthContext.tsx` | 61 | `fetchClient(session.user.id).then(setClient)` is not awaited. `setIsLoading(false)` runs in the same microtask immediately after scheduling `fetchClient`, so loading is cleared before client is set. If `fetchClient` fails, `setClient` is never called and client stays null with no error surface. | **Medium** | Await `fetchClient` in the initial getSession then-block and call `setIsLoading(false)` in a finally (or after both setSession/setUser and client fetch). |
| `src/lib/hooks/useWorkoutSession.ts` | 153, 171 | `persistSetLogs(next).catch(() => {})` — fire-and-forget. Persistence can fail silently. | **Critical** | At minimum log on catch; optionally surface “save failed” to user or retry. |
| `src/lib/hooks/useWorkoutSession.ts` | 96–104, 226, 236, 242, 255 | `getRestTimerState().catch(() => {})`, `setRestTimerState(...).catch(() => {})` — all silent. Rest timer state can desync from storage. | **Medium** | Log failures in dev; consider retry or user-visible “couldn’t save rest timer”. |

### 1.4 Loading flags set but never cleared

| File | Line | Issue | Severity | Suggested minimal fix |
|------|------|-------|----------|------------------------|
| `src/features/calendar/DayDetailScreen.tsx` | 48–71 | `load()` has no try/catch. If `Promise.all([getEntriesForRange, fetchSessionsForWorkouts, fetchStandaloneSessions])` throws, `setIsLoading(false)` is never reached → screen can stay in loading forever. | **Critical** | Wrap load body in try/finally and call `setIsLoading(false)` in finally. |
| `src/features/programs/ProgramDetailScreen.tsx` | 59–72 | If `fetchProgramWithStructure(programId)` throws, `setIsLoading(false)` is never called (it’s only after the `if (!cancelled)` block). | **Critical** | Move `setIsLoading(false)` into a finally block, or call it in both success and catch paths. |
| `src/lib/hooks/useCalendarEntries.ts` | 25–36 | `load()` has no try/catch. If `getEntriesForRange` throws, `setIsLoading(false)` never runs. | **Critical** | try/finally around load body; `setIsLoading(false)` in finally. |

### 1.5 Selectors depending on undefined/null

- Dashboard and other screens guard with `client?.id`, `clientId` checks before fetch. No obvious selector that reads `.id` or similar on undefined.
- **Low risk** if all data hooks are used with `client?.id` or `clientId` from auth; document that callers must pass `undefined` when not logged in.

### 1.6 Hydration flags that never resolve

- **AuthContext:** If `getSession()` never resolves (e.g. network hang), `setIsLoading(false)` would never run. Uncommon but possible. **Low** — consider timeout or error path.
- **CycleContext:** `fetchLatestPeriod` always sets `setIsLoading(false)` (and setError). No stuck hydration.

### 1.7 Promises that can fail silently

| File | Lines | Issue | Severity |
|------|-------|-------|----------|
| `useWorkoutSession.ts` | 104, 152, 171, 228, 236, 242, 255 | All `.catch(() => {})` — no logging, no retry, no user feedback. | **Critical** (persistence), **Medium** (rest timer) |
| `insightService.ts` | (recent change) | Now returns error string and logs in __DEV__. Failures are no longer fully silent. | **Low** (improved) |

### 1.8 Circular imports

- No circular import chain found in the scanned files. `CycleContext` imports `AuthContext`; `useCycle` uses `CycleContext`; no Auth → Cycle → Auth loop.

### 1.9 State updates during render

- No direct `setState` during render found in the audited components. Recommendation: keep business logic and side effects out of render.

### 1.10 Duplicated sources of truth

- **Dashboard date:** `selectedDate` in DashboardScreen is local state; passed to `useDashboard(client?.id, selectedDate)` and `useReadiness(client?.id, selectedDate)`. Single source for “which day the dashboard is showing.” **OK.**
- **Cycle data:** CycleContext is the intended single source; useCycle reads from it. **OK.**
- **In-progress workout:** workoutStore (AsyncStorage) + useWorkoutSession local state. Store is source of truth for persistence; in-memory state is synced from store on load and on persist. Risk: if `persistSetLogs` fails silently, memory and storage can diverge. **See 1.7.**

---

## 2. STATE & PERSISTENCE AUDIT

### 2.1 Store shape

- **No global Redux/Zustand store** for app data. State is:
  - **Auth:** AuthContext (session, user, client).
  - **Cycle:** CycleContext (latestPeriodStart, derived phase, etc.).
  - **AsyncStorage (workoutStore):** `IN_PROGRESS_WORKOUT`, `REST_TIMER_STATE`, `PREFERRED_THEME`.
- **Remaining data:** Fetched per screen/hook from Supabase (assignments, sessions, readiness, insights, calendar entries, etc.).

### 2.2 AsyncStorage usage

- **storage.ts:** getItem/setItem/removeItem with JSON; catch returns null or logs. **OK.**
- **workoutStore.ts:** getInProgressWorkout, setInProgressWorkout, clearInProgressWorkout, get/setRestTimerState. All async; callers often use `.catch(() => {})` (see 1.7). **Risk:** writes can fail silently.

### 2.3 Hydration logic

- **Auth:** getSession() then fetchClient; loading false set before fetchClient completes (see 1.3). Client may arrive after first paint.
- **Cycle:** fetchLatestPeriod on mount; loading cleared in all paths.
- **Workout in-progress:** useWorkoutSession loads session + getInProgressWorkout() in parallel; cancelled flag used. **OK.** Rest timer state loaded in separate effect with silent catch.

### 2.4 Atomic save flows

- **completeWorkout (useWorkoutSession):** createWorkoutLogWithSets → then clearInProgressWorkout(). If clearInProgressWorkout fails after successful API write, in-memory/store can be inconsistent; UI will have left the session screen. **Medium** — ensure clearInProgressWorkout is awaited and consider retry.
- **Readiness:** saveReadiness is single upsert; no multi-step atomicity issue.
- **Insight:** getOrCreateTodayInsight: read then optional insert; race possible if two tabs/clients write same day — DB unique constraint handles it. **OK.**

### 2.5 finishWorkoutSession() / completeWorkout

- **Flow:** User completes → `completeWorkout(overallRpe)` → createWorkoutLogWithSets (Supabase) → on success, clearInProgressWorkout(). **Writes are awaited.** Risk: clearInProgressWorkout() failure leaves stale data in AsyncStorage (see 2.4).

### 2.6 Readiness logging

- ReadinessScreen calls saveReadiness (awaited); success/error returned; setSaving(false) and refetch on success. **OK.** No silent failure.

### 2.7 Insight logging

- getOrCreateTodayInsight: read/insert to daily_insight_log; errors now returned and logged in __DEV__. **OK.**

### 2.8 Planned workout completion logic

- Completion is via createWorkoutLogWithSets (program or standalone). Duplicate same-day check exists in service. **OK.** No double-completion from UI identified.

### 2.9 Writes awaited?

- Yes for: createWorkoutLogWithSets, saveReadiness, savePeriodStart, client update (onboarding), calendar upsert/delete.
- Not awaited (fire-and-forget): persistSetLogs, setRestTimerState in useWorkoutSession. **Risk:** see 1.7.

### 2.10 Race condition risk

- **Dashboard focus:** Multiple refetches (dashboard, readiness, cycle, insight, etc.) run in parallel on focus. No single “master” ordering; possible brief inconsistent UI. **Low** if refetches are independent.
- **In-progress workout:** Concurrent addSetLog/updateSetLog both call persistSetLogs; order of writes is not guaranteed. **Medium** — could serialize or debounce persist.

### 2.11 Duplicated state in multiple slices

- Cycle: only in CycleContext. **OK.**
- “Today’s session” / “week view”: useDashboard holds assignment, todaySession, weekDays; useCalendar holds its own week data. Both fetch from API; no shared cache. **Acceptable** but could cause redundant network if both used on same screen.

### 2.12 Calendar as source of truth

- Calendar data: useCalendar fetches assignment + logged workouts + calendar_entries; useCalendarEntries fetches entries for a range. Calendar screen uses useCalendar; DayDetail uses getEntriesForRange + fetchSessionsForWorkouts etc. **Source of truth is Supabase** (calendar_entries, workout_sessions_log). No conflicting local source. **OK.**

### 2.13 Data flow summary

- **User action → state update → persistence → rehydration → UI**
  - **Complete onboarding:** Form submit → client update + savePeriodStart (if applicable) → refreshClient() → RootNavigator re-renders with client → dashboard/cycle get clientId. **Flow clear.** If refreshClient is not awaited or fails, client in UI can be stale. **Medium.**
  - **Log readiness:** handleSave → saveReadiness (awaited) → refetch() → useReadiness updates → UI. **Clear.**
  - **Complete workout:** completeWorkout → createWorkoutLogWithSets (awaited) → clearInProgressWorkout() (awaited) → navigate away. **Clear** except silent clear failure.
  - **Add set / update set:** addSetLog/updateSetLog → setState + persistSetLogs(next).catch(() => {}). **Persistence can fail silently.** **Critical.**

---

## 3. HARD-CODING & RULE VIOLATION CHECK

### 3.1 Hardcoded numbers (acceptable if documented as config/timeouts)

- Timeouts: 15_000, 10_000 ms in useDashboard, useCalendar, useWorkouts, useActiveAssignment, useStandaloneWorkouts. **Acceptable** as timeout constants.
- REFETCH_DEBOUNCE_MS 300 (useDailyInsight). **Acceptable.**
- 86400000 (ms per day) in workoutLogService, useCalendar, cycleUtils, programService. **Acceptable** but could be a named constant (e.g. MS_PER_DAY).
- MAX_AGE_MS = 24 * 60 * 60 * 1000 (workoutStore). **Acceptable.**

### 3.2 Hardcoded dates

- “Today” and “yesterday” derived from `new Date()` and `getLocalDateString()` in services. No literal date strings for business logic. **OK.**

### 3.3 Hardcoded strings that should be config-driven

- UI strings (e.g. “God morgon”, “Lugn dag”, “Pass klart!”) are Swedish literals. **Low** — i18n not in scope for this audit.
- Error messages and validation text in components. **Low.**

### 3.4 Business logic inside UI components

- **DashboardScreen:** getAdjustmentRecommendation(phase, readiness), getGreeting(), recommendation text. **Medium** — could move to a small helper or hook to keep screen thin.
- **ReadinessScreen:** clamp and save payload built in handler. **Acceptable.**

### 3.5 Nested uncontrolled objects

- No deep mutation of props/state observed in the audited code. Set log updates use immutable-style updates (map/filter/new array).

### 3.6 Direct mutation of state

- No `prev.x = y` or similar; state updates use setState with new objects/arrays. **OK.**

---

## 4. GIT & STRUCTURAL CHECK

### 4.1 Git status (at audit time)

- **Branch:** main (ahead of origin/main by 14 commits).
- **Modified (not staged):** 60+ files (see git status output).
- **Deleted:** `.cursor/rules/design-system.mdc`, `jomoa-mobile/src/lib/store/programStore.ts`.
- **Untracked:** New features (train/, log/, learn/, components/, dashboard sections), hooks (useActiveAssignment, useAwards, useCalendarEntries, useDailyPhaseInsight, useFavorites, useGoals, useInProgressWorkout, useMeasurements, usePhasePerformance, useStandaloneWorkouts, useWeeklyProgression), services (awardsService, calendarEntryService, favoritesService, goalsService, measurementsService, phaseKnowledgeService, phasePerformanceService, progressionService, sessionTemplateService), docs, supabase/, jest.setup.js, etc.

### 4.2 No changes made

- This audit does not modify any code.

---

## 5. OUTPUT FORMAT

### 5.1 Summary of root problems

1. **Loading never cleared** when async load throws in DayDetailScreen, ProgramDetailScreen, and useCalendarEntries (no try/finally).
2. **Silent persistence failures** in useWorkoutSession: persistSetLogs and setRestTimerState use `.catch(() => {})`, so in-progress workout and rest timer can desync from AsyncStorage without user or dev feedback.
3. **Auth hydration order:** Client is fetched after setIsLoading(false), so UI can render with session but client=null; if fetchClient fails, client stays null with no error surface.
4. **Multiple refetches on dashboard:** useDailyInsight effect depends on refetch, which changes when phase/readiness change, causing extra insight refetches; useFocusEffect runs many refetches on every focus with dependency on refetch identities.
5. **Complete workout flow:** clearInProgressWorkout() after createWorkoutLogWithSets is awaited but its failure is not surfaced; stale in-progress data can remain in storage.

### 5.2 Critical bugs list

| # | Location | Issue |
|---|----------|--------|
| 1 | DayDetailScreen.tsx ~48–71 | load() has no try/catch; throw leaves isLoading true forever. |
| 2 | ProgramDetailScreen.tsx ~59–72 | fetchProgramWithStructure throw skips setIsLoading(false). |
| 3 | useCalendarEntries.ts ~25–36 | getEntriesForRange throw skips setIsLoading(false). |
| 4 | useWorkoutSession.ts ~152, 171 | persistSetLogs(...).catch(() => {}) — set log persistence can fail silently. |
| 5 | useWorkoutSession.ts (rest timer) | setRestTimerState / getRestTimerState failures swallowed; rest timer can desync. |

### 5.3 Structural weaknesses

- **No single data layer:** Mix of Context (auth, cycle), per-hook Supabase fetches, and AsyncStorage. Redundant fetches (e.g. dashboard + calendar both load assignment) and no shared cache.
- **Refetch identity churn:** Many hooks expose refetch from useCallback(deps). When deps change (e.g. readiness, phase), any parent that puts refetch in a dependency array (e.g. useFocusEffect) may re-run more than intended.
- **Dashboard responsibility:** DashboardScreen coordinates many hooks and useFocusEffect; one place for “refresh all” but also a single point of coupling and refetch dependency sensitivity.

### 5.4 Persistence risks

- **In-progress workout + rest timer:** AsyncStorage writes in useWorkoutSession are fire-and-forget; failures are silent. Risk: lost set logs or wrong rest timer after app kill.
- **clearInProgressWorkout** after complete workout: If it fails, next open can show an old in-progress workout.
- **Readiness / insight / cycle:** All Supabase; writes are awaited and errors returned or logged. **Lower risk** than AsyncStorage path.

### 5.5 Top 5 actions required to stabilize system

1. **Guarantee loading is always cleared:** Add try/finally (and setLoading(false) in finally) in DayDetailScreen load(), ProgramDetailScreen load effect, and useCalendarEntries load(). Optionally in any other async load that sets loading and can throw.
2. **Stop silencing persistence in useWorkoutSession:** Replace `.catch(() => {})` for persistSetLogs and setRestTimerState with at least __DEV__ logging and, if feasible, a minimal retry or user-visible “couldn’t save” for set logs.
3. **Auth client load:** In AuthContext, await fetchClient in the initial getSession flow and set loading false only after session/user/client are set or fetch has failed; surface fetch failure so client=null is distinguishable from “still loading”.
4. **Stabilize dashboard refetch behavior:** Reduce useFocusEffect dependency on refetch identities (e.g. single refreshAll callback with refs to latest refetch functions, or mount-only refetch and explicit “pull to refresh”).
5. **completeWorkout robustness:** After createWorkoutLogWithSets success, await clearInProgressWorkout and on failure log/retry or at least ensure in-memory state is cleared so UI doesn’t show stale in-progress workout.

---

**End of audit. No implementation or UI changes were made.**
