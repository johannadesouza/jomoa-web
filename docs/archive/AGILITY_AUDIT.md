# JOMOA Mobile – Agility Audit Report

## Executive summary

The app has a **clear split** between Content DB (programs, articles, training goals, symptom options, onboarding copy) and User DB, and the **adaptation engine** is a pure, testable domain layer. Main agility limits: **insight and phase copy are still hardcoded**, **time is not injectable** (hard to test or simulate dates), **no feature flags**, **one large dashboard screen**, and **journey/goal options and readiness formula** are still in code. Overall the project is in the **5–6/10** range for iteration speed; with the suggested refactors it can reach **7–8/10** without big rewrites.

---

## 1) Agility score (0–10)

| Dimension | Score | Notes |
|-----------|--------|--------|
| Change business rules without breaking UI | **7** | Adaptation engine is pure and tested; cycle/readiness rules live in `lib/adaptation/rules`. UI only consumes results. Readiness **score formula** and **insight copy** are still in services. |
| Change content without shipping a new build | **6** | Training goals, symptom options, symptom relief, onboarding copy, articles, programs → Content DB + admin. **Still in app:** goalOptions (AddGoalModal), phaseProfiles, phaseKnowledgeCopy, FREQUENCIES, insightService titles/bodies/actions. |
| Add a new user mode | **6** | Cycle mode (regular / missing_period / perimenopause) is explicit; adding e.g. "contraception" would mean new mode in `CycleMode`, new rules, and context/hooks. No feature flag to gate it. |
| Test alternative logic paths | **5** | Adaptation and cycle engine are unit-tested. **Time is not injectable** (`todayString()`, `getLocalDateString()` use `new Date()`), so scenario "what if today is X?" requires mocking globals. No test harness for full flows. |
| Refactor safely | **6** | Good test coverage on adaptation and cycle utils. Many features still depend on one big dashboard and direct service/hook use; some duplicate patterns (refetch bundles, date handling). |

**Overall agility score: 6/10.**

---

## 2) Bottleneck map

### 2.1 Hardcoded content

| Location | Why it slows iteration | Minimal refactor |
|----------|------------------------|-------------------|
| `lib/data/goalOptions.ts` (FITNESS_GOALS, NUTRITION_GOALS, WELLNESS_GOALS, EVENT_GOALS) | AddGoalModal "resans mål" require app release to add/change. | Add Content DB table `goal_type_options` (type, option_id, label, icon_name, order_index) and admin CRUD; mobile fetches and caches like training_goals. |
| `lib/services/insightService.ts` (`computeInsightTitle`, `computeInsightBody`, `computeActions`) | All daily insight copy is in code; A/B or copy tweaks need release. | Move to Content DB: e.g. `insight_templates` (phase, readiness_tier, title, body_template, actions[]) or keep logic but load copy from DB by key. |
| `lib/data/phaseProfiles.ts` (PHASE_PROFILES, PHASE_SECTION_LABELS) | Phase knowledge (physiology, training focus, etc.) is ~200 lines of copy; changes need release. | Already have `cycle_phases` + `phase_training_tips` / `phase_wellness_tips` in Content DB; extend or add a "phase knowledge" content model and use it in PhaseDetailScreen / phase knowledge service. |
| `lib/data/phaseKnowledgeCopy.ts` | Small but still release-bound for any wording change. | Add to `onboarding_copy` or a generic `app_copy` table (key, value_sv, value_en) and read at runtime. |
| `features/onboarding/FrequencyScreen.tsx` – `FREQUENCIES` | Frequency labels/descriptions require release. | Either extend `onboarding_copy` (e.g. frequency_2_label, frequency_2_description) or a small `training_frequency_options` in Content DB. |

### 2.2 Tightly coupled UI + business logic

| Location | Why it slows iteration | Minimal refactor |
|----------|------------------------|-------------------|
| `lib/services/readinessService.ts` – `calculateReadinessScore()` | Formula (sleep 25%, energy 30%, stress 20%, soreness 25%) is fixed; changing weights or adding factors needs code change and release. | Extract to a pure function in e.g. `lib/domain/readinessScore.ts` (input → score). Optionally later: store weights or formula id in DB/remote config so you can tune without release. |
| `lib/services/insightService.ts` – `generateInsight()` | Combines "which insight" logic with all copy; hard to A/B or change copy independently. | Split: (1) Pure function that returns **template keys** from phase + readiness; (2) Resolve keys to copy from Content DB or a local map loaded from DB. |
| `features/dashboard/DashboardScreen.tsx` – `getGreeting()` | Uses `new Date().getHours()`; not testable for "morning vs evening" without mocking. | Inject "now" (e.g. from a small `AppNowContext` or hook that defaults to `new Date()`). Same for any "today" used for business decisions. |

### 2.3 Duplicated logic across screens

| Pattern | Files | Minimal refactor |
|---------|--------|-------------------|
| Refetch-on-focus bundle | DashboardScreen (refetchRef + useFocusEffect calling 6 refetches) | Single hook e.g. `useDashboardRefetch()` that returns one `refetch()` calling all; or a small "refetch registry" so screens register and one place triggers. |
| "Today" / selected date | `getLocalDateString()`, `todayString()` (cycleEngine), various `new Date()` in services | Centralise "current date" behind one abstraction (e.g. `getAppDate(): string` from context); in tests or scenario mode, inject date. |
| Empty/loading/error for async content | Repeated across screens (LoadingScreen, ErrorState, EmptyState) | Already have shared components; add one small "async content" wrapper: `<AsyncContent loading={} error={} empty={} onRetry={}>` to reduce boilerplate. |

### 2.4 Date/time bound to system clock

| Location | Issue | Minimal refactor |
|----------|--------|-------------------|
| `lib/utils/cycleEngine.ts` – `todayString()` | Uses `new Date()`; tests/scenarios cannot simulate "today = 2025-03-15". | Add optional `asOfDate?: string` to functions that need "today", or introduce `Clock`/`AppNow` interface; default implementation uses `new Date()`, test/scenario injects fixed date. |
| `lib/utils/date.ts` – `getLocalDateString(date = new Date())` | Same. | Callers that need "app current date" should get it from context (e.g. `useAppNow().todayString`); date.ts stays pure (given date → string). |
| `lib/services/insightService.ts` – `getLocalDateString()` in getOrCreateTodayInsight | "Today" is implicit. | Pass `today` as argument (from context); keeps service testable and allows "simulate day X". |

### 2.5 Lack of feature flags

| Impact | Minimal refactor |
|--------|-------------------|
| Can't ship "contraception mode" or new paywall placement behind a flag; can't A/B readiness formula or tip frequency. | Add a minimal **remote config** layer: e.g. Supabase table `app_config` (key, value_json) or a single row "feature_flags" (jsonb). App fetches once at startup (or with TTL); no UI imports Supabase directly – use e.g. `useFeatureFlags(): Record<string, boolean \| number>`. Gate new modes and experiments behind keys (e.g. `contraception_mode`, `paywall_after_onboarding`). |

### 2.6 Lack of test harness for scenarios

| Impact | Minimal refactor |
|--------|-------------------|
| Hard to manually test "user in luteal + low readiness" or "first day after period" without waiting or mocking at many call sites. | Add a **scenario/debug menu** (only in __DEV__ or when a secret flag is on): e.g. "Set today = 2025-03-10", "Set phase = luteal", "Set readiness = 25". Store overrides in context or a small store; `todayString()` and adaptation/insight inputs read from overrides when set. Single entry point to drive "persona" behaviour. |

### 2.7 Folder structure and "god" components

| Location | Issue | Minimal refactor |
|----------|--------|-------------------|
| `features/dashboard/DashboardScreen.tsx` (~600 lines) | One screen handles greeting, week picker, calendar strip, highlights, insights, quick actions, rest timer, morning routine, recommended programs, readiness insight. Heavy to change and easy to break. | Extract sections into components (e.g. `DashboardWeekStrip`, `DashboardHighlights`, `DashboardInsightsBlock`) and keep DashboardScreen as composition + wiring. Same data hooks can be passed as props or context. |
| `lib/` mixing domain, services, repos, data | `lib/data` has both static content (goalOptions, phaseProfiles) and content that could move to DB. | Keep `lib/domain` for pure logic (readiness score, cycle phase math); `lib/data` for static or fallback data only; content that's in DB is accessed only via `lib/repos/contentRepo` and optional in-memory cache. |

### 2.8 Hidden state mutations

| Location | Issue | Minimal refactor |
|----------|--------|-------------------|
| CycleContext + cycleEngineService | Multiple state vars (activeCycle, stats, settings, error) updated in async flows; refetch on focus. | Already centralised in one context; ensure all writes go through explicit actions (logPeriodStart, updateMode, refetch) and avoid direct setState from nested callbacks that can race. |
| useDashboard / useReadiness etc. | Each hook manages its own loading/error; no shared "mutation lock". | Acceptable for reads; for mutations (e.g. log readiness, log period), ensure one-at-a-time where it matters (e.g. disable button while saving) and show error in UI. |

---

## 3) Refactor plan (incremental)

### Phase 1 – Low effort / high impact (1–3 days)

1. **Time abstraction** – Add `lib/context/AppNowContext.tsx`: provides `todayString()` and optionally `now: Date`, defaulting to real time. Use it in CycleContext and in `getOrCreateTodayInsight` (pass `today` from context). In tests, wrap with a provider that returns fixed date.
2. **Readiness score extraction** – Move `calculateReadinessScore` from `readinessService.ts` to `lib/domain/readinessScore.ts` (pure function). Service imports and calls it; add unit tests for the formula.
3. **Dashboard composition** – Extract 2–3 sections (e.g. week strip, highlights, insights block) into `DashboardWeekStrip`, `DashboardHighlights`, `DashboardInsightsBlock` to shrink `DashboardScreen.tsx` and make changes safer.
4. **Single refetch hook for dashboard** – Create `useDashboardRefetch()` that returns one `refetch()` calling all dashboard-related refetches; use it in DashboardScreen to replace the refetchRef + useFocusEffect list.

### Phase 2 – Structural cleanup (1–2 weeks)

1. **Insight copy to Content DB** – Add `insight_templates` (or reuse a key-value table) in Content DB with keys per (phase, readiness_tier) and fields title, body, actions. insightService: keep "pick template key" logic in code, resolve copy from DB (with fallback to current strings).
2. **Goal type options in Content DB** – Add `goal_type_options` (type, option_id, label, icon_name, order_index); admin CRUD. AddGoalModal fetches and caches like training_goals; remove or reduce `lib/data/goalOptions.ts`.
3. **Minimal feature flags** – Add `app_config` or `feature_flags` in Supabase (or Content DB); fetch at app start; expose `useFeatureFlags()`. Use for one concrete flag (e.g. "show morning routine" or "paywall placement") to validate the pattern.
4. **Phase knowledge from Content** – Map PhaseDetailScreen (and phase knowledge service) to existing `cycle_phases` + tips, or add a "phase knowledge" content model and migrate copy from `phaseProfiles.ts` over time; keep `phaseProfiles` as fallback during migration.

### Phase 3 – Long-term scalability (optional)

1. **AppNowProvider everywhere** – All "today" and "now" go through context; enable deterministic E2E and scenario testing.
2. **Experimentation** – Use feature flags + remote config for readiness formula weights, tip frequency, paywall placement, and "contraception mode" (or similar).
3. **Test persona / scenario UI** – __DEV__-only screen or menu to set "today", phase, readiness; entire app uses that for one session.

---

## 4) Content agility plan

| Content type | Where it lives today | Move to DB? | Where | Notes |
|--------------|----------------------|------------|-------|--------|
| Training goals (onboarding) | Content DB | Done | training_goals | Already in plan/impl. |
| Symptom options / relief | Content DB | Done | symptom_options, symptom_relief_tips | Same. |
| Onboarding copy | Content DB | Done | onboarding_copy | Same. |
| Programs, exercises, articles | Content DB | Done | Existing tables | Admin already. |
| "Resans mål" (fitness/nutrition/wellness/event) | `goalOptions.ts` | Yes | goal_type_options | Add table + admin; mobile fetches. |
| Daily insight titles/bodies/actions | `insightService.ts` | Yes | insight_templates or app_copy | Enables copy and A/B without release. |
| Phase knowledge (physiology, training focus, etc.) | `phaseProfiles.ts` | Optional | Extend cycle_phases or new table | Large copy; move in phases. |
| Phase knowledge UI labels | `phaseKnowledgeCopy.ts` | Yes | app_copy or onboarding_copy | Small; easy. |
| FREQUENCIES (onboarding) | FrequencyScreen | Yes | onboarding_copy or frequency_options | Few keys. |
| Readiness insight text | Content DB | Done | readiness_insights | Already. |
| Readiness **score formula** | readinessService | Keep in code first | lib/domain/readinessScore.ts | Later: weights in remote config. |

**What can stay local:** Veckodagar (Mån–Sön); typography/spacing tokens (theme); validation rules unless you want to drive them from config.

**Structure so new content doesn't require release:** Any new "list of options" (goals, frequencies, modes) → Content DB table + admin CRUD; app fetches and caches (with TTL or on app start). Any new copy (tips, phase text, insight templates) → Content DB or key-value table; app resolves by key with fallback.

---

## 5) Business logic isolation

**Adaptation engine** – Isolated: `lib/adaptation/engine.ts` and `lib/adaptation/rules/*` are pure (no UI, no Supabase, no Date). Well tested. UI only consumes results.

**Cycle logic** – Mostly isolated: `lib/utils/cycleEngine.ts` is pure. Not time-injectable: `todayString()` uses `new Date()`. Recommendation: make "today" injectable (optional param or AppNowContext).

**Readiness** – Score formula in `readinessService.ts`; extract to `lib/domain/readinessScore.ts` (pure function).

**Insight generation** – Coupled in `insightService.ts`. Recommendation: split into (1) pure "template key" selection, (2) copy resolution from DB or keyed map.

**Proposed pure domain layer:** Keep `lib/adaptation/*`. Add `lib/domain/readinessScore.ts`, optional `lib/domain/insightKeys.ts`. Refactor `cycleEngine.ts` for optional `asOfDate`. Add optional AppNowProvider.

---

## 6) Experimentation readiness

| Experiment | Current difficulty | With minimal feature flags |
|------------|--------------------|-----------------------------|
| New readiness scoring | Medium | Easy: flag + weights in remote config. |
| Change tip frequency | Hard | Easy: flag + numeric config. |
| Paywall placement | N/A (not implemented) | Easy: flag for placement. |
| "Contraception mode" | New mode in code | Medium: flag to enable for beta. |

**Minimal feature-flag pattern:** One row or table in Supabase (e.g. `app_config`: key, value_json). Fetch once at app start (optional TTL). Expose `useFeatureFlags(): { [key: string]: boolean \| number \| string }`. No direct Supabase in screens. Defaults when fetch fails.

---

## 7) Suggested folder structure (additions only)

```
lib/
  domain/           # Pure business logic, no UI, no Supabase
    readinessScore.ts
    insightKeys.ts  # (phase, readiness) → template key
  adaptation/       # (existing – already pure)
  context/
    AppNowContext.tsx   # Optional: provides todayString(), now
  data/            # Static/fallback data only
  services/
  repos/
```

---

## 8) Implementation status (long-term)

- [x] Phase 1.1: AppNowContext + todayString() injectable
- [x] Phase 1.2: Readiness score → lib/domain/readinessScore.ts + tests
- [x] Phase 1.3: Dashboard sections extracted (WeekStrip done; Highlights/InsightsBlock optional follow-up)
- [x] Phase 1.4: useDashboardRefetch() hook
- [x] Phase 2.1: Insight copy to Content DB (insight_templates + getInsightTemplateKey + fallback)
- [x] Phase 2.2: goal_type_options in Content DB + AddGoalModal (useGoalTypeOptions)
- [x] Phase 2.3: Minimal feature flags (app_config + FeatureFlagsProvider + useFeatureFlags)
- [x] Phase 2.4: Phase knowledge from Content / phaseProfiles fallback (fetchPhaseInsightContent + getDailyPhaseInsightAsync)
- [x] Phase 3.1: AppNow/todayString() överallt (CycleContext, useDashboard, insightService, cycleEngineService, useReadiness, perimenopause)
- [x] Phase 3.2: Scenario/debug-menyn (__DEV__): Inställningar → Scenario; sätt idag, fas, readiness
- [x] Phase 3.3: Experimentation (readiness_weights i app_config; calculateReadinessScore tar optional weights; tip_frequency dokumenterat)
- [x] Nice-to-have: DashboardHighlights + DashboardInsightsBlock utdragna; morning routine styrd av show_morning_routine; useTipFrequency() hook
