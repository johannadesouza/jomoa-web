# TestFlight Readiness – Pre-flight Report

**Date:** 2025-02-27  
**Scope:** Code health, stability, build/release config, crash risk. No UX/UI changes or new features.

---

## P0 – Blockers (must fix before TestFlight)

| # | Item | Status | Notes |
|---|------|--------|------|
| 1 | **Navigation params** – Screens that use `route.params` can crash if params are missing (e.g. deep link, state restore). | ✅ Fixed | RootNavigator DayDetail header uses `route.params?.date`; WorkoutSession, WorkoutPreview, WorkoutSummary, ProgramDetail, DayDetail screens guard missing params and goBack or show safe fallback. |
| 2 | **Error boundary** – Uncaught React errors crash the app with no recovery. | ✅ Fixed | Added `ErrorBoundary` component and wrapped app content; fallback UI with "Försök igen" and optional reload. |
| 3 | **Build/release config** – EAS Build required for TestFlight; no `eas.json`. | ✅ Fixed | Added `eas.json` with `development`, `preview`, and `production` profiles; iOS bundle id `com.jomoa.app`, version from app.json. |
| 4 | **Crash reporting** – No visibility into production crashes. | ✅ Fixed | Optional Sentry via `src/lib/sentry.ts`; set `EXPO_PUBLIC_SENTRY_DSN` and run `npm install` for `@sentry/react-native` to enable. |
| 5 | **Secrets** – No API keys in repo. | ✅ OK | Supabase URLs/keys from `EXPO_PUBLIC_*` env; `.env` in .gitignore; app throws at startup if missing. |

---

## P1 – Recommended (high value)

| # | Item | Status | Notes |
|---|------|--------|------|
| 1 | **Console in production** – `console.warn`/`console.error` in AuthContext and storage run in release. | ✅ Fixed | Gated with `__DEV__` in AuthContext and storage.ts. |
| 2 | **Unhandled promise in PhaseDetailScreen** – `fetchPhaseContent(phaseId).then(setContent).finally(...)` has no `.catch()`. | ✅ Fixed | Added `.catch()` to set content to null so loading ends and error state shows. |
| 3 | **WorkoutSummaryScreen** – `totalVolume.toLocaleString()` / `totalSets` can throw if params undefined. | ✅ Fixed | Defensive defaults: `totalVolume ?? 0`, `totalSets ?? 0`, `sessionName ?? "Pass"`. |
| 4 | **Date semantics** – `assignments.ts` uses `new Date().toISOString().split("T")[0]` (UTC); can be off-by-one for local "today". | ✅ Fixed | Use `getLocalDateString()` for today in `archiveAndSwitchProgram`. |
| 5 | **Long lists** – WorkoutsScreen, ProgramListScreen use ScrollView + map; not virtualized. | ⏳ Deferred | Acceptable for typical list sizes; consider FlatList if lists grow (P2). |

---

## Dead code / unused dependencies

- **Unused npm deps:** None removed. `expo-image` is a transitive dependency of `expo-image-picker`; Cormorant fonts, markdown, etc. are in use.
- **Unused TS/JS files:** No unused screens or entry points found; all registered in RootNavigator/TabNavigator are used.
- **Unused assets:** All referenced in app.json (icon, splash, adaptive-icon, favicon) exist under `assets/`.
- **Debug logs / TODO:** No TODO/FIXME in `src/`. Console usage limited to `insightService` (already `__DEV__`-gated), plus AuthContext/storage now gated.

---

## Build / Release checklist

| Item | Status |
|------|--------|
| Release scheme / bundle id | ✅ `com.jomoa.app` in app.json |
| Version / build number | ✅ app.json `version: "1.0.0"`; EAS auto-increment recommended for each upload |
| Env for production | ✅ Use EAS Secrets for `EXPO_PUBLIC_*`; no localhost in code |
| iOS assets | ✅ icon.png, splash-icon.png, adaptive-icon.png; display name "JOMOA" |
| No secrets in repo | ✅ Keys only via env |
| Crash reporting | ✅ Sentry minimal setup; set `EXPO_PUBLIC_SENTRY_DSN` for release |

---

## Crash risk – mitigations applied

- **Null/undefined:** Param guards on all screens that receive `route.params`; safe defaults in WorkoutSummary.
- **Unhandled promises:** PhaseDetailScreen fetch now has `.catch()`; ArticleDetailScreen already had catch/finally.
- **Error boundary:** One top-level boundary so a single component error does not white-screen the app.
- **Date math:** `getLocalDateString()` used for "today" in assignments to avoid UTC off-by-one.

---

## Summary of changes (PR-ready)

**New files**
- `docs/TESTFLIGHT_READINESS.md` – this report
- `eas.json` – EAS Build profiles (development, preview, production)
- `src/shared/ui/ErrorBoundary.tsx` – root error boundary with fallback UI
- `src/lib/sentry.ts` – optional Sentry init and wrap (no crash when package/DSN missing)

**Modified files**
- `App.tsx` – ErrorBoundary wrap, Sentry init via sentry.ts, wrapWithSentry(App)
- `package.json` – added `@sentry/react-native` (~6.0.0)
- `.env.example` – added optional `EXPO_PUBLIC_SENTRY_DSN`
- `src/navigation/RootNavigator.tsx` – safe `route.params?.date` / `?.title` / `?.phaseName` in screen options
- `src/features/calendar/DayDetailScreen.tsx` – guard missing `date` param; early return with message
- `src/features/workouts/WorkoutSessionScreen.tsx` – guard missing `sessionId`; early return
- `src/features/workouts/WorkoutPreviewScreen.tsx` – guard missing `sessionId`; early return
- `src/features/workouts/WorkoutSummaryScreen.tsx` – defensive defaults for `sessionName`, `totalSets`, `totalVolume`, `adaptationApplied`
- `src/features/programs/ProgramDetailScreen.tsx` – guard missing `programId`; early return
- `src/features/learn/ArticleDetailScreen.tsx` – guard missing `slug`; added AppButton import
- `src/features/learn/PhaseDetailScreen.tsx` – guard missing `phaseId`; `.catch()` on fetch; AppButton import
- `src/shared/context/AuthContext.tsx` – `console.error` gated with `__DEV__`
- `src/lib/store/storage.ts` – `console.warn` gated with `__DEV__`
- `src/lib/repos/userRepo/assignments.ts` – use `getLocalDateString()` for today in `archiveAndSwitchProgram`
- `src/shared/ui/index.ts` – export ErrorBoundary

**Verification**
- `npm run test` – 16 suites, 139 tests passed
- TypeScript: run `npx tsc --noEmit` (pre-existing test-type errors may remain if @types/jest not in scope)
- For TestFlight: `npm install` (to install Sentry), then `eas build --platform ios --profile production` and `eas submit --platform ios --latest`.
