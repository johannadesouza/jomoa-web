# Debug Audit – jomoa-mobile

**Date:** 2025-02-21  
**Scope:** `jomoa-mobile/src`  
**Focus:** infinite loops, async/loading bugs, state issues, circular imports

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 8 |
| Medium   | 5 |
| Low      | 4 |

---

## 1. Loading states that never resolve

### 1.1 usePrograms – no try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/usePrograms.ts` |
| **Lines** | 13–18 |
| **Explanation** | `load()` has no try/catch. If `fetchTemplatePrograms()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and always call `setIsLoading(false)`. |

```ts
async function load() {
  setIsLoading(true);
  try {
    const data = await fetchTemplatePrograms();
    setPrograms(data);
  } catch {
    setPrograms([]);
  } finally {
    setIsLoading(false);
  }
}
```

---

### 1.2 AuthContext – getSession().then() without .catch()

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/shared/context/AuthContext.tsx` |
| **Lines** | 54–61 |
| **Explanation** | `supabase.auth.getSession().then(...)` has no `.catch()`. If the promise rejects, `setIsLoading(false)` is never called. |
| **Severity** | Critical |
| **Fix** | Add `.catch(() => setIsLoading(false))` or use async/await with try/finally. |

---

### 1.3 useReadiness – fetchReadiness without try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useReadiness.ts` |
| **Lines** | 17–27 |
| **Explanation** | `fetchReadiness()` has no try/catch. If `getTodayReadiness()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and call `setIsLoading(false)` in `finally`. |

---

### 1.4 useCycle – fetchLatestPeriod without try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useCycle.ts` |
| **Lines** | 24–34 |
| **Explanation** | `fetchLatestPeriod()` has no try/catch. If `getLatestPeriodStart()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and call `setIsLoading(false)` in `finally`. |

---

### 1.5 useReadinessHistory – refetch without try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useReadinessHistory.ts` |
| **Lines** | 27–37 |
| **Explanation** | `refetch()` has no try/catch. If `getReadinessHistory()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and call `setIsLoading(false)` in `finally`. |

---

### 1.6 useWorkoutSession – load() without try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useWorkoutSession.ts` |
| **Lines** | 56–84 |
| **Explanation** | `load()` inside the effect has no try/catch. If `fetchSessionById()` or `getInProgressWorkout()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and call `setIsLoading(false)` in `finally`. |

---

### 1.7 useDailyInsight – refetch without try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useDailyInsight.ts` |
| **Lines** | 37–60 |
| **Explanation** | `refetch()` has no try/catch. If `getOrCreateTodayInsight()` or `getTodayInsight()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and call `setIsLoading(false)` in `finally`. |

---

### 1.8 ProgramDetailScreen – load() without try/finally

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/features/programs/ProgramDetailScreen.tsx` |
| **Lines** | 55–65 |
| **Explanation** | `load()` has no try/catch. If `fetchProgramWithStructure()` throws, `setIsLoading(false)` never runs. |
| **Severity** | Critical |
| **Fix** | Wrap in try/finally and call `setIsLoading(false)` in `finally`. |

---

## 2. Async / promises not awaited or failing silently

### 2.1 useWorkoutSession – getRestTimerState().then() not awaited, no .catch()

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useWorkoutSession.ts` |
| **Lines** | 91–95 |
| **Explanation** | `getRestTimerState().then(...)` is fire-and-forget. Rejections are unhandled. |
| **Severity** | Medium |
| **Fix** | Add `.catch(() => {})` or use async/await inside an async IIFE. |

---

### 2.2 AuthContext – fetchClient().then(setClient) fire-and-forget

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/shared/context/AuthContext.tsx` |
| **Lines** | 59, 69–70 |
| **Explanation** | `fetchClient(...).then(setClient)` has no `.catch()`. If `fetchClient` rejects, the error is unhandled. |
| **Severity** | Medium |
| **Fix** | Add `.catch(() => setClient(null))` or handle errors. |

---

### 2.3 useWorkoutSession – persistSetLogs() fire-and-forget

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useWorkoutSession.ts` |
| **Lines** | 138, 157 |
| **Explanation** | `persistSetLogs(next)` is called inside `setSetLogs` callbacks without await. If it rejects, the error is unhandled. |
| **Severity** | Low |
| **Fix** | Either await inside the callback (not ideal) or use `.catch(console.error)` on the returned promise. |

---

### 2.4 AuthContext – refreshClient not awaited in some callers

| Field | Value |
|-------|-------|
| **File** | Multiple (e.g. ProgramDetailScreen, ProgramSelectScreen) |
| **Lines** | Various |
| **Explanation** | `refreshClient()` returns a Promise but some callers may not await. Less critical if UI doesn’t depend on it. |
| **Severity** | Low |
| **Fix** | Ensure callers await when they need fresh client data before navigation. |

---

## 3. useEffect dependency arrays / infinite loop risks

### 3.1 useInsights – load not in dependency array

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useInsights.ts` |
| **Lines** | 9–15 |
| **Explanation** | `useEffect` calls `load()` but `load` is not in the deps. `load` is recreated each render. eslint exhaustive-deps would warn. No infinite loop because deps are only `[clientId]`. |
| **Severity** | Low |
| **Fix** | Wrap `load` in `useCallback` with proper deps and add it to the effect deps, or leave as-is if behavior is correct. |

---

### 3.2 useActiveProgram – load not in dependency array

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useActiveProgram.ts` |
| **Lines** | 83–85 |
| **Explanation** | `useEffect(..., [clientId])` calls `load()` but `load` is not in deps. `load` changes every render. No infinite loop because only `clientId` is in deps. |
| **Severity** | Low |
| **Fix** | Wrap `load` in `useCallback([clientId])` and add to effect deps, or keep current behavior if intentional. |

---

### 3.3 useReadiness / useCycle – fetchReadiness / fetchLatestPeriod not in deps

| Field | Value |
|-------|-------|
| **File** | `useReadiness.ts` L30–31, `useCycle.ts` L36–38 |
| **Explanation** | Effect calls async function but function is not in deps. Same pattern as above. |
| **Severity** | Low |
| **Fix** | Wrap in `useCallback` and add to deps, or accept the exhaustive-deps warning. |

---

## 4. State / naming issues

### 4.1 useWorkoutSession – confusing state variable name

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/lib/hooks/useWorkoutSession.ts` |
| **Line** | 39 |
| **Explanation** | `const [setLogs, setSetLogs] = useState<SetLogEntry[]>([])` – `setLogs` is the array value but reads like a setter. Causes confusion but not a runtime bug. |
| **Severity** | Low |
| **Fix** | Rename to `[setLogs, setSetLogs]` → `[setLogs, setSetLogs]` or better: `[logs, setLogs]` and update all usages. |

---

## 5. State selectors depending on undefined

### 5.1 DashboardScreen – multiple optional chaining

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/features/dashboard/DashboardScreen.tsx` |
| **Lines** | Various |
| **Explanation** | `client?.id`, `phase`, `readiness`, etc. are used widely. If `client` is null during auth loading, hooks receive `undefined`. Hooks handle `undefined` clientId, but complex composition (useCycle, useReadiness, useDailyInsight, useTrainingAdaptation) may have subtle ordering issues. |
| **Severity** | Medium |
| **Fix** | Ensure loading/guard before rendering dashboard content; verify hook behavior when `clientId` is undefined. |

---

## 6. Duplicated sources of truth

### 6.1 ProgramDetailScreen – structure loaded separately from useActiveProgram

| Field | Value |
|-------|-------|
| **File** | `jomoa-mobile/src/features/programs/ProgramDetailScreen.tsx` |
| **Lines** | 46–66 |
| **Explanation** | `useActiveProgram` already fetches `structure` via `fetchProgramWithStructure`. ProgramDetailScreen fetches structure again in its own effect. Possible desync if one updates and the other doesn’t. |
| **Severity** | Medium |
| **Fix** | Use `structure` from `useActiveProgram` for the selected program, or ensure a single source of truth (e.g. detail screen uses its own fetch only when needed). |

---

## 7. Circular imports

| Status | Details |
|--------|---------|
| **None found** | `workoutService` imports `programService` (one-way). No circular import chains detected in `src/lib`. |

---

## 8. Loading flag summary

| Hook / Screen       | Loading set | Loading cleared      | On error?   |
|---------------------|-------------|----------------------|-------------|
| useDashboard        | L43         | L119 finally         | Yes         |
| useCalendar         | L65         | L116 finally         | Yes         |
| useWorkouts         | L26         | L39 finally          | Yes         |
| useActiveProgram    | L52         | L79 finally          | Yes         |
| useInsights         | L20         | L27 finally          | Yes         |
| usePrograms         | L14         | L17 (no finally)     | **No**      |
| useReadiness        | L22         | L27 (no finally)     | **No**      |
| useCycle            | L29         | L34 (no finally)     | **No**      |
| useReadinessHistory | L32         | L36 (no finally)     | **No**      |
| useWorkoutSession   | L59         | L83 (no finally)     | **No**      |
| useDailyInsight     | L43         | L59 (no finally)     | **No**      |
| AuthContext         | —           | L61, L75 (in .then)  | **No .catch** |
| ProgramDetailScreen | —           | L62 (no finally)     | **No**      |
| CompleteScreen      | L26         | L64 finally          | Yes         |
| LoginScreen         | L37         | L44, L48             | Yes         |
| RegisterScreen      | L50         | L57, L62             | Yes         |
| useProgramSelect    | L31         | L32                  | Yes (before throw) |

---

## 9. Promises that can fail silently

| Location                         | Issue                                         |
|----------------------------------|-----------------------------------------------|
| `AuthContext` getSession         | No .catch; loading can hang on reject         |
| `AuthContext` fetchClient        | No .catch; unhandled rejection                |
| `useWorkoutSession` getRestTimerState | No .catch; unhandled rejection            |
| `useWorkoutSession` persistSetLogs   | Fire-and-forget; rejections unhandled     |
| `usePrograms` load               | Thrown error prevents setIsLoading(false)     |
| `useReadiness` fetchReadiness    | Thrown error prevents setIsLoading(false)     |
| `useCycle` fetchLatestPeriod     | Thrown error prevents setIsLoading(false)     |
| `useReadinessHistory` refetch    | Thrown error prevents setIsLoading(false)     |
| `useWorkoutSession` load         | Thrown error prevents setIsLoading(false)     |
| `useDailyInsight` refetch        | Thrown error prevents setIsLoading(false)     |
| `ProgramDetailScreen` load       | Thrown error prevents setIsLoading(false)     |

---

## 10. Terminal error (InsightsScreen)

The terminal showed a syntax error around line 21 in `InsightsScreen.tsx` (`</AppText>`). The current file content looks correct; that error may be from an older build or a different file state. If the error persists, check for:

- Stale Metro cache (`npx expo start --clear`)
- Merge/copy-paste artifacts (orphaned tags)
- Conflicting edits

---

## Suggested fix order

1. **Critical:** Add try/finally (or .catch for AuthContext) to all loading flows that can throw.
2. **Medium:** Add .catch to fire-and-forget promises (`getRestTimerState`, `fetchClient`).
3. **Medium:** Clarify ProgramDetailScreen vs useActiveProgram structure loading.
4. **Low:** Add useCallback and correct effect deps where appropriate.
5. **Low:** Rename `setLogs` → `logs` in useWorkoutSession for clarity.
