# JOMOA Training OS – Product Roadmap

Inspired by **Weglow** (structured program + logging) and **Hormona** (daily intelligence + biological insights).

---

## Four-Phase Structure

| Phase | Focus | Timeline |
|-------|--------|----------|
| **Fas 1** | Core Engine | 2–3 veckor |
| **Fas 2** | Adaptation Engine | 2 veckor |
| **Fas 3** | Home Cockpit | — |
| **Fas 4** | Moat & Differentiation | — |

---

## Fas 1 – Core Engine (2–3 veckor)

**Mål:** Stabil motor. Inga laddningsloopar. Allt sparas korrekt.

### 1.1 Program → Planerade pass → Sessioner (låst system)

| Concept | Definition |
|---------|------------|
| WorkoutTemplate | Program structure (blocks, weeks, sessions) |
| PlannedWorkoutDay | Date-bound plan – which session is planned for which date |
| WorkoutSession | Logging instance (start → log sets → complete) |
| Finish flow | Locks the day – cannot log same planned session twice |

**Definition of Done:**
- Man kan inte "göra samma planerade pass oändligt"
- Kalender + progress stämmer
- Restart → allt kvar

### 1.2 Logging-system 2.0

- Set logging autosave
- RPE (per set + overall at finish)
- Volymberäkning
- Rest timer (persist)
- Resume session

### 1.3 Persistence Layer

- Single source of truth
- Atomic save strategy
- No duplicated state
- Rehydration fungerar

---

## Fas 2 – Adaptation Engine (2 veckor)

**Mål:** Unik differentiering – cykel + readiness + insights kopplade till träning.

### 2.1 Cykelmodell

- CycleLog per dag
- Phase detection: menstrual, follicular, ovulation, luteal
- Persistens

### 2.2 Readiness Engine (riktig, inte fluff)

**Inputs:** Fas, energi, sömn, soreness, stress, recent load

**Outputs:**
- Score (0–100)
- Tier (low/medium/high)
- RPE delta
- Set multiplier
- Recovery suggestion
- Top 2 drivers (WHY)

Persist dagligen.

### 2.3 Insight Engine

**Baserat på:** Phase, symptoms, readiness

**Output:** 1–2 cues, action suggestion, adjustment summary

---

## Fas 3 – Home Cockpit (Hormona x OS)

**Mål:** Hemskärmen känns levande.

### 3.1 Graf-kort

- Cykeldag
- Phase
- Readiness trend
- Energi trend
- "Today marker"

### 3.2 Dagens beslut

- "Idag: -1 RPE, -20% sets"
- WHY: Low sleep + luteal phase

### 3.3 Dagens pass

- Preview
- Resume
- Start

### 3.4 Quick actions

- Logga energi
- Logga symptom
- Starta timer
- Öppna kalender

---

## Fas 4 – Moat & Differentiation

**Mål:** Långsiktig differentiering.

- Adaptive progression over weeks
- Fas-baserad overload
- Deload suggestions
- Performance vs phase analysis
- "You lift 8% stronger in follicular phase"

---

## Current State Audit (per phase)

### Fas 1 – Implementerat / Gap

| Del | Implementerat | Gap |
|-----|---------------|-----|
| Program system | `programService`, `workoutService`, `client_program_assignments` | Endast vecka 1 (`getFirstWeekId`), ingen date-bound PlannedWorkoutDay |
| Planned sessions | Planerade sessioner från `program_sessions` (day_of_week) | Vecko-relativ, inte date-bound |
| Finish flow | Sparar till `workout_sessions_log` | Ingen låsning – man kan logga samma pass flera gånger |
| Logging | Set logs, rest timer, resume | Overall RPE vid finish saknas (skickas aldrig) |
| Persistence | AsyncStorage in-progress, Supabase completed | Migrations saknas i repo – schema måste finnas externt |

### Fas 2 – Implementerat / Gap

| Del | Implementerat | Gap |
|-----|---------------|-----|
| Cykel | `cycle_events`, `calculateCyclePhase` | Ingen explicit CycleLog per dag |
| Readiness | `daily_readiness`, score, rules | Recent load som input; RPE delta, set multiplier, top 2 drivers saknas |
| Insight | `daily_insight_log`, `insightService` | Fungerar – symptom-input kan förstärkas |
| Adaptation | Engine + rules, `useTrainingAdaptation` | Endast display – volumeModifier/rpeModifier tillämpas inte |

### Fas 3 – Implementerat / Gap

| Del | Implementerat | Gap |
|-----|---------------|-----|
| Graf | `CycleGraphSection` (4-fas bar), `readinessHistory` (7 dagar) | Placeholder – riktiga grafer, Today marker saknas |
| Dagens beslut | Textrekommendation | Saknar kvantifierat output (-1 RPE, -20% sets) + WHY |
| Dagens pass | "Starta pass" på Dashboard | Resume-CTA kan förtydligas |
| Quick actions | — | Saknas helt |

### Fas 4 – Implementerat / Gap

| Del | Implementerat | Gap |
|-----|---------------|-----|
| Progression | `computeProgression` (completed vs total) | Adaptive progression, fas-baserad overload, deload, performance vs phase – allt saknas |

---

## Gap Prioritering

| Prioritet | Gap | Fas |
|-----------|-----|-----|
| P0 | Supabase-migrations saknas i repo | 1 |
| P0 | Date-bound PlannedWorkoutDay | 1 |
| P0 | Finish flow låser inte dagen | 1 |
| P1 | Endast vecka 1 – fler veckor ignoreras | 1 |
| P1 | Overall RPE vid finish fångas aldrig | 1 |
| P2 | Adaptation tillämpas inte (volumeModifier, rpeModifier) | 2 |
| P2 | Readiness output: RPE delta, set multiplier, top 2 drivers | 2 |
| P3 | Grafer placeholder | 3 |
| P3 | Quick actions saknas | 3 |
| P4 | Adaptive progression, performance vs phase | 4 |

---

## Nästa Milestone

**Milestone: Core Engine – Date-Bound Plans & Finish-Lock**

### Vad det löser
1. Planerade pass blir date-bound (PlannedWorkoutDay-koncept)
2. Finish-lås – kan inte logga samma planerade pass flera gånger samma dag
3. Overall RPE fångas vid completion
4. Migrations i repo så schema kan köras från scratch

### Filer som påverkas
- Ny migration (eller dokumentera befintlig schema)
- `workoutService` / `programService` – funktion för "planned session för datum X"
- `workoutLogService` – validering mot befintlig completion för dag + session
- `useWorkoutSession` – skicka `overallRpe` till `completeWorkout`
- `WorkoutSessionScreen` – UI för overall RPE vid finish
- `useCalendar`, `useDashboard` – använd date-bound planeringslogik

### Definition of Done
- [ ] Schema definieras i migrations (jomoa-mobile eller monorepo-root)
- [ ] Planerade pass mappas till datum (vecka + dag → datum)
- [ ] Finish kollar om passet redan är completat för dag + session; blockerar vid dubblering
- [ ] Overall RPE sparas i `workout_sessions_log`
- [ ] Kalender och progress visar korrekt planerad vs genomförd per datum

### Komplexitet
Medium–High

### Risk
Medium (schema- och datamodelländringar)

---

## Execution Mode

- PR-style: en milestone i taget
- Minimal diff
- `git status` före
- `git diff` efter
- Commit efter varje steg
- Inga refactors om de inte krävs
- Bygger ett strukturerat Training OS, inte en UI-demo

---

*Senast uppdaterad: 2025-02*
