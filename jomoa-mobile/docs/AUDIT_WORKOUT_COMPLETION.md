# Audit: Workout Completion Flow

**Date:** 2025-02-21  
**Scope:** User action → state update → persistence → rehydration → UI render

---

## Data Lifecycle

```
User taps "Avsluta" → Alert confirm
  → completeWorkout(rpeValue)  [useWorkoutSession.ts L173]
  → createWorkoutLogWithSets(clientId, session.id, setLogInputs, overallRpe)
  → fetchTodayCompletedSession (finish-lock check)
  → INSERT workout_sessions_log
  → INSERT set_logs
  → clearInProgressWorkout (AsyncStorage)
  → navigation.replace("WorkoutSummary")
  → User taps "Tillbaka till hem"
  → navigation.navigate("Main")   [WorkoutSummaryScreen.tsx L61]
```

---

## Identified Break Points

### 1. Navigation does not land on Dashboard → no refetch

**File:** `WorkoutSummaryScreen.tsx` L61  
**Code:** `navigation.navigate("Main")`

**Problem:** When user taps "Tillbaka till hem", we navigate to "Main" (TabNavigator). The TabNavigator preserves tab state. The user came from WorkoutsTab → WorkoutSession → WorkoutSummary. So when we pop back to Main, the active tab is **WorkoutsTab**, not DashboardTab. The Dashboard never receives focus, so `useFocusEffect` on DashboardScreen does **not** run. No refetch → `todaySessionCompleted` stays false, progress does not update until user manually switches to Dashboard tab.

**Fix:** Navigate to Main with explicit screen so Dashboard gets focus and refetches:

```ts
navigation.navigate("Main", { screen: "DashboardTab" });
```

---

### 2. Program progress uses useActiveProgram – separate refetch

**File:** `programService.ts` L295-305  
**Flow:** `fetchAllProgramsWithAssignment` queries `workout_sessions_log` for completed sessions. Used by `useActiveProgram`. The ProgramListScreen and ProgramDetailScreen use `useActiveProgram`. They do not use `useFocusEffect` to refetch when returning from a workout. So progression stays stale until user navigates in a way that remounts useActiveProgram or the component refetches.

**Fix:** When we navigate to Main with DashboardTab, the user sees Dashboard. Program progress is shown in ProgramList/ProgramDetail. Those screens need to refetch when focused. `useActiveProgram` has no useFocusEffect – it only loads on clientId change. Adding refetch-on-focus to screens that show progression would fix this. Minimal fix: ensure we land on Dashboard (which shares the tab navigator); ProgramList is a separate stack screen – user would need to open it to see progress. The Dashboard shows "today completed" – that's the primary fix. Program progress is secondary – user would see it when opening ProgramList. For now, focus on Dashboard refetch.

---

### 3. Supabase RLS / schema (external)

If `workout_sessions_log` insert fails due to RLS or schema, we would get `insertError` and show Alert. User says "it says it was done" – so either insert succeeds, or the error is not displayed. No code bug identified for insert path.

---

### 4. Date timezone consistency

Both `createWorkoutLogWithSets` and `fetchTodayCompletedSession` use `new Date().toISOString().split("T")[0]` for today. Consistent. No bug.

---

## Summary – Fix for Workout Completion

**Primary fix:** Change `WorkoutSummaryScreen.tsx` L61 from:
```ts
onPress={() => navigation.navigate("Main")}
```
to:
```ts
onPress={() => navigation.navigate("Main", { screen: "DashboardTab" })}
```

This ensures Dashboard receives focus when returning, `useFocusEffect` runs, `refetchDashboard()` is called, and `fetchTodayCompletedSession` returns the new completion. `todaySessionCompleted` updates, progress bar and "completed" state render correctly.

**Secondary:** WorkoutsScreen also has `useFocusEffect` with refetch. When user lands on Dashboard first, then switches to WorkoutsTab, WorkoutsScreen would refetch. Good. CalendarScreen – check if it has useFocusEffect.
