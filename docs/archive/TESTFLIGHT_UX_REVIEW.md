# TestFlight Beta UX/Flow/Design Review

**Date:** 2025-02-27  
**Scope:** User-friendliness, navigation clarity, premium design consistency. No large rewrites or new features.

---

## 1) Core flows (simulated end-to-end)

**Onboarding → Home → first workout → logging → progress → cycle → readiness → settings**

- **Onboarding:** Welcome → PathChoice → Goals → Frequency → TrainingDays → CycleSetup → Complete. Linear; no skip. Copy is calm and structured.
- **Home (Dashboard):** Date picker, today’s session/check-in card, Quick Actions (Logga energi, Logga symptom, Vilotimer, Kalender). “Check-in + starta pass” opens **MorningRoutineModal** (emoji check-in → adapt → direct to WorkoutSession). **Strong:** one path to check-in + workout.
- **First workout (no program):** Train tab → “Du har inget program valt” → “Utforska och välj program” → ProgramSelect (modal) → pick program → back to Train → “Dagens pass” card → Starta pass. **Friction:** 3–4 steps; no “Start first workout” from onboarding complete.
- **Logging:** Readiness via Dashboard quick action “Logga energi” → ReadinessScreen (form). Cycle/symptoms via “Logga symptom” → Cycle. Journey has segment “Logga” (QuickLogStrip). Readiness form is 1–10 inputs; no inline validation message on blur.
- **Progress:** Journey (Insikter) tab: Idag / Historik / Logga; stats (volym, pass, streak), CycleHeroCard, SymptomRelief, etc. Good structure; when `stats` is empty the screen still shows cards with “0” – no dedicated empty state for “Inga pass loggade än”.
- **Cycle:** CycleScreen from Settings or OverdueBanner/Dashboard. Period logging, symptoms, phase. Has LoadingScreen, ErrorState, EmptyState.
- **Readiness:** Reached from Dashboard quick action or (theoretically) Journey; ReadinessScreen has loading and save error state.
- **Settings:** Profile, Mina program, Menscykel, Notifikationer (Kommer snart), Hjälp/Feedback/Villkor (Kommer snart). Theme toggle. **No paywall/restore:** only `LockIcon` for “premium/låst”; no purchase or restore flow in app.

**Dead end / orphan:** `LogScreen` (`src/features/log/LogScreen.tsx`) is **not in RootNavigator or TabNavigator**. It’s dead code; either remove or wire into a tab/entry point.

---

## 2) Top 10 UX issues (by impact)

| Prio | Issue | Impact | Location / note |
|------|--------|--------|------------------|
| **P0** | **EmptyState never shows icon when only `iconName` is passed** | High | `EmptyState.tsx`: `IconWrapper` only uses `icon`; when callers pass `iconName="nutrition-outline"` (NutritionScreen, GoalsSection, ProgramList, CycleInsights, etc.) the icon is never rendered. |
| **P0** | **LoadingScreen is text-only** | Medium | `LoadingScreen.tsx`: Only “Laddar...” text; no spinner/skeleton. Feels unfinished and can look like a freeze. |
| **P1** | **No paywall/restore** | Product | No purchase or “Återställ köp” flow. If the app will be paid/premium, add a minimal restore entry (e.g. Settings). |
| **P1** | **Settings “Kommer snart” everywhere** | Trust | Notifikationer, Hjälp, Feedback, Villkor all show alert “Kommer snart”. Prefer in-screen empty state + short explanation or disable with “Kommer snart” label. |
| **P1** | **Readiness form: no validation feedback** | Clarity | ReadinessScreen: 1–10 inputs; invalid values only surface on save. Add inline hint or validation on blur (e.g. “Ange 1–10”). |
| **P1** | **Journey “Inga pass än” empty state** | Guidance | When `stats.sessionsThisMonth === 0` and `streak === 0`, Journey still shows stat cards with 0. Add a clear empty state: “Logga ditt första pass från Hem eller Träna” + CTA. |
| **P2** | **Tab labels vs content** | Clarity | Tab “Insikter” (Journey) includes “Logga”; “Logga” is also a segment name. Consider “Insikter & logga” or keep but ensure first segment makes “logga” obvious. |
| **P2** | **Quick action label “Logga energi”** | Consistency | QuickActionsSection: “Logga energi” → Readiness (sömn, stress, energi). Consider “Check-in” or “Hur mår du?” to match ReadinessScreen title. |
| **P2** | **Nutrition empty state has no CTA** | Guidance | NutritionScreen EmptyState has no `actionLabel`/`onAction`. Add e.g. “Notifiera mig” or “Gå till Lär dig” so the screen isn’t a dead end. |
| **P2** | **ProgramList “Inga program”** | Edge case | EmptyState has no action; if list is empty because of loading/error, user has no next step. Add “Tillbaka” or “Uppdatera” depending on context. |

---

## 3) Suggested navigation map (simplified)

```
[Auth]
  Login | Register

[Onboarding] (stack)
  Welcome → PathChoice → Goals → Frequency → TrainingDays → CycleSetup → Complete

[Main] (tabs)
  Träna (Train)     → Dagens pass, Favoriter, ProgramSelect (modal)
  Insikter (Journey)→ Idag / Historik / Logga; links to Readiness, Cycle, Measurements
  Hem (Dashboard)   → Vecka, Dagens pass/check-in, Quick actions, Cycle banner
  Kost (Nutrition)  → Coming soon (empty state + CTA)
  Lär dig (Learn)   → Cykelplan, Ämnen, Artiklar

[Stack from Main]
  WorkoutSession, WorkoutPreview, WorkoutSummary
  ProgramSelect (modal), ProgramList, ProgramDetail
  Readiness, Cycle, Calendar, DayDetail
  CycleInsights, Measurements, Settings, Profile
  ArticleDetail, PhaseDetail
```

**Suggested tweaks (no big re-architect):**

- From **CompleteScreen**, add a CTA that goes to **Main** with `screen: "TrainTab"` (or “Hem”) so “first next step” is one tap.
- Ensure **Settings** has a single, clear entry for “Prenumeration / Återställ köp” when you add paywall.

---

## 4) Screen-by-screen notes (what to change)

| Screen | Change |
|--------|--------|
| **DashboardScreen** | Already has ErrorState + refetch. Optional: skeleton for week strip while loading. |
| **TrainScreen** | No program: keep CTA “Utforska och välj program”. Consider one line: “Ditt första pass är bara några klick borta.” |
| **JourneyScreen** | When no stats (0 pass, 0 streak): show EmptyState “Logga ditt första pass” + button to Train or Home. |
| **NutritionScreen** | EmptyState: add `actionLabel` + `onAction` (e.g. “Läs om kost” → Learn tab or PhaseDetail). Fix EmptyState so `iconName` shows icon. |
| **LearnScreen** | Already clear; segment bar and phases work. |
| **ReadinessScreen** | Add short validation hint under inputs (e.g. “1–10”) and/or onBlur validation message. Keep save error as is. |
| **CycleScreen** | Already has Loading/Error/Empty. Optional: empty state CTA “Logga periodstart” if applicable. |
| **ProgramListScreen** | When programs.length === 0: EmptyState with “Uppdatera” or “Tillbaka” so user isn’t stuck. |
| **ProgramSelectScreen** | Loading + list; OK. |
| **SettingsScreen** | Replace “Kommer snart” alerts with in-list subtitle “Kommer snart” and no alert, or a small in-screen message. Add “Prenumeration / Återställ köp” row when you have IAP. |
| **MorningRoutineModal** | Already reduces friction; keep as is. |
| **QuickActionsSection** | Consider renaming “Logga energi” → “Check-in” or “Hur mår du?”. |
| **EmptyState (component)** | **Fix:** When `iconName` is set and `icon` is not, render `<AppIcon name={iconName} />` inside EmptyStateIcon so all empty states show the correct icon. |
| **LoadingScreen (component)** | Add `<ActivityIndicator />` (or Tamagui spinner) next to “Laddar...” for a clear loading state. |

---

## 5) Design consistency checklist + components to consolidate

**Spacing / typography:**  
- Screen padding and section gaps use `$4`/`$8` and tokens; Card.Content padding varies (`$4`, `$6`).  
- AppText variants (h1, h2, h3, body, small, caption) are used; keep one hierarchy (e.g. screen title = h2, card title = h3).

**Buttons:**  
- AppButton variants: primary, secondary, ghost. Use consistently (primary = main CTA, secondary = secondary action).  
- Some screens use `size="sm"` or `size="lg"`; define when to use which (e.g. empty state CTA = default or lg).

**Cards:**  
- Card + Card.Header + Card.Content used across features. A few places use raw YStack + border; prefer Card for list items and content blocks.

**Inputs:**  
- AppInput used in Readiness, Cycle, etc. Add a shared “hint” or “error” prop for validation and use it in Readiness.

**Empty / loading / error:**  
- **Consolidate:** Use `EmptyState` everywhere (with icon fix), `LoadingScreen` everywhere (with spinner), `ErrorState` with retry where applicable.  
- Ensure every data-dependent screen has: loading → content or empty → error with retry.

**Contrast / accessibility:**  
- Theme colors (deepPlumBrown, yellowBeigeSand, warmTerracotta) are readable.  
- Buttons and quick actions: ensure min touch target ~44pt; Card pressable areas are large enough.  
- No dynamic type audit done; consider testing with larger text size.

**Components to consolidate (candidates):**  
- “Stat card” (icon + label + value) appears in Journey and possibly elsewhere; consider `<StatCard iconName label value unit />`.  
- “Row with icon + title + subtitle + onPress” appears in Settings and similar; already consistent; optional `<SettingsRow />`.  
- Section header with “View all” (e.g. Dashboard “Vecka” + “Kalender”): keep as Section viewAllLabel/onViewAll pattern.

---

## 6) Content-driven architecture (lightweight)

**Good candidates to move to DB (to reduce app updates):**

| Content | Current | Suggestion |
|--------|----------|------------|
| Phase guidance / tips | `phaseKnowledgeCopy.ts`, `phaseProfiles` (data) | Already have `phaseKnowledgeService` + contentRepo/cycleContent; keep expanding phase/wellness content in Content DB. |
| Symptom options (mood, cravings, bleeding) | `symptomOptions.ts` | Move to Content DB (e.g. `symptom_options` table) and fetch once or cache; allows non-dev copy changes. |
| Program metadata | Content DB (programs, sessions) | Already in DB; no change. |
| Articles | Content DB (articles) | Already in DB. |
| Onboarding copy (welcome, goals, frequency labels) | In components | Later: optional “onboarding_copy” or feature flags in DB for A/B or copy updates without release. |

**Do not:** Build a full CMS or admin now. Prefer a few extra tables or columns in existing Content DB and simple fetch/cache in the app.

---

## 7) Quick wins implemented

1. **EmptyState** – `IconWrapper` now renders `<AppIcon name={iconName} size={48} />` when `iconName` is set (so all empty states show the correct icon).
2. **LoadingScreen** – Added `ActivityIndicator` with theme accent color beside “Laddar...” text.
3. **JourneyScreen** – When no sessions/stretch, shows EmptyState “Logga ditt första pass” with CTA “Gå till Träna”.
4. **NutritionScreen** – Added `actionLabel="Läs om kost och cykel"` and `onAction` → navigate to LearnTab.
5. **SettingsScreen** – “Kommer snart” items show subtitle “Kommer snart” and no longer trigger Alert.
6. **QuickActionsSection** – Label “Logga energi” changed to “Check-in”.
7. **ProgramListScreen** – Empty state when no programs now has `actionLabel="Tillbaka"` and `onAction={() => navigation.goBack()}`.
8. **CompleteScreen** – Primary button copy “Kom igång” and subtitle “Du kommer till Hem” so the outcome after tap is clear; navigation to Main remains state-driven (refreshClient causes RootNavigator to show Main).
