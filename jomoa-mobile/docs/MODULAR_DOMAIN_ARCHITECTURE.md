# Modular Domain Architecture Proposal

**Goal:** Separate app into 3 independent but connected domains with no hard dependencies between them.

**Status:** Minimal changes (4.1–4.2) implemented. AdaptationContext uses `cyclePhase` and `trainingLoad`.

---

## 1. Proposed Modular Store Structure

### Domain boundaries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DOMAIN BOUNDARIES                                 │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│  CYCLE DOMAIN       │  TRAINING DOMAIN     │  INTELLIGENCE LAYER         │
│  (standalone)       │  (standalone)        │  (optional bridge)          │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│                     │                     │                             │
│  • cycleService     │  • workoutStore     │  • readinessService         │
│  • cycleSymptomSvc  │  • programService   │  • adaptation/engine        │
│  • cycleUtils       │  • workoutService   │  • adjustmentService        │
│                     │  • workoutLogSvc    │  • insightService           │
│  Data:              │                     │  • phasePerformanceService  │
│  - cycle_events     │  Data:              │                             │
│  - cycle_symptoms   │  - client_program_  │  Data:                      │
│  - cycle_phases     │    assignments      │  - daily_readiness          │
│                     │  - workout_sessions │  - daily_insight_log        │
│                     │  - set_logs         │                             │
│                     │  - AsyncStorage     │  Uses (optional):           │
│                     │    (in-progress)    │  - cycle phase              │
│                     │                     │  - recent load              │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### Store / service layout

| Domain | Store/Service | Responsibility | Cross-refs |
|--------|---------------|----------------|------------|
| **Cycle** | `cycleService` | Period events, phase calc | None |
| **Cycle** | `cycleSymptomService` | Symptoms per date | None |
| **Training** | `workoutStore` | In-progress session, rest timer (AsyncStorage) | None |
| **Training** | `programService` | Programs, assignments, weeks | None |
| **Training** | `workoutService` | Sessions, exercises | None |
| **Training** | `workoutLogService` | Completed sessions, set logs, recent load | None |
| **Intelligence** | `readinessService` | Daily check-in, score | None |
| **Intelligence** | `adaptation/engine` | Training adaptation rules | Accepts optional cycle + load |
| **Intelligence** | `adjustmentService` | Text recommendations | Accepts optional cycle |
| **Intelligence** | `insightService` | Daily insight generation | Accepts optional cycle |
| **Intelligence** | `phasePerformanceService` | Phase vs volume analysis | Needs both cycle + training |

**Explicit stores (optional):**

- `cycleStore.ts` – thin wrapper / facade over `cycleService` + `cycleSymptomService` if you want a unified “cycle domain” API
- `trainingStore.ts` – thin wrapper over `workoutStore` + `programService` + `workoutService` + `workoutLogService`
- `readinessStore.ts` – thin wrapper over `readinessService` for symmetry

Or keep services as-is and treat “store” as a conceptual grouping rather than new files.

---

## 2. Proposed Readiness / Adaptation Signatures

### Readiness score (already partial-input safe)

```ts
function calculateReadinessScore(data: {
  sleep_quality?: number | null;
  energy_level?: number | null;
  stress_level?: number | null;
  soreness?: number | null;
}): number | null
```

- Each field is optional.
- If none provided → returns `null`.
- Uses only provided factors; no assumptions about cycle or training.

### Readiness engine / adaptation context

```ts
export interface ReadinessInput {
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness: number | null;
}

export interface CyclePhaseInput {
  phase: CyclePhase | null;  // null = no cycle data, ignore cycle rules
}

export interface TrainingLoadInput {
  sessionsLast7Days: number;
  volumeLast7Days: number;
  // 0/0 = no training data, ignore load rules
}

export interface AdaptationContext {
  /** Readiness check-in – may be null (no check-in today) */
  readiness: ReadinessInput | null;
  /** Cycle phase – null if no cycle tracking */
  cyclePhase: CyclePhase | null;
  /** Training load – null or {0,0} if no training */
  trainingLoad: TrainingLoadInput | null;
}

export function computeAdaptation(context: AdaptationContext): AdaptationResult
```

### Rule behaviour with optional inputs

| Input | Rule module | Behaviour when absent |
|-------|-------------|------------------------|
| `cyclePhase === null` | `evaluateCyclePhaseRules` | Return `[]` |
| `trainingLoad === null` or `sessionsLast7Days < 4` | `evaluateRecentLoadRules` | Return `[]` |
| `readiness === null` | `evaluateReadinessRules` | Return `[]` |

---

## 3. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT / AUTH                                    │
│                              (clientId)                                       │
└──────────────────────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────────────┬─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   CYCLE DOMAIN      │     │   TRAINING DOMAIN   │     │  INTELLIGENCE       │
│                     │     │                     │     │  (Readiness)        │
│  cycleService       │     │  programService     │     │                     │
│  cycleSymptomSvc    │     │  workoutService     │     │  readinessService   │
│  cycleUtils         │     │  workoutLogService  │     │  (daily_readiness)  │
│                     │     │  workoutStore       │     │                     │
│  cycle_events       │     │  (AsyncStorage)     │     │  No deps on         │
│  cycle_symptoms     │     │  workout_sessions   │     │  cycle or training  │
└──────────┬──────────┘     └──────────┬──────────┘     └──────────┬──────────┘
           │                           │                           │
           │  phase (or null)          │  recentLoad (or null)     │  readiness
           │                           │                           │
           └───────────────────────────┼───────────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │         INTELLIGENCE LAYER            │
                    │                                       │
                    │  Adaptation Engine                    │
                    │  computeAdaptation({                  │
                    │    readiness,                         │
                    │    cyclePhase,   // optional           │
                    │    trainingLoad  // optional           │
                    │  })                                   │
                    │                                       │
                    │  Rules:                               │
                    │  • readinessRules(readiness)          │
                    │  • cyclePhaseRules(phase) → skip if null
                    │  • recentLoadRules(load)   → skip if null/empty
                    │                                       │
                    │  Output: volumeModifier, rpeModifier  │
                    │          suggestDeload, topDrivers    │
                    └──────────────────────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  useTrainingAdapt   │     │  adjustmentService  │     │  insightService     │
│  (training UI)      │     │  (text recs)        │     │  phasePerformance   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘

INDEPENDENT FLOWS:
- Cycle: useCycle → CycleScreen, CycleGraphSection (no training)
- Training: useWorkouts, useDashboard → WorkoutsScreen (no cycle)
- Readiness: useReadiness → ReadinessScreen (no cycle, no training)
- Intelligence: useTrainingAdaptation → only when training UI needs adaptation
```

---

## 4. Minimal Changes Required

### 4.1 Rename / clarify `AdaptationContext`

| Current | Proposed |
|---------|----------|
| `phase` | `cyclePhase` (explicit) |
| `recentLoad` | `trainingLoad` (explicit) |

### 4.2 `useTrainingAdaptation` – optional inputs

```ts
// Current: always fetches all three
const { phase } = useCycle(clientId);
const { readiness } = useReadiness(clientId);
const recentLoad = useRecentLoad(clientId);

// Proposed: same fetch, but pass through explicitly as optional
// Engine already handles null – no logic change.
// Optionally: add flags useCycleData?: boolean, useTrainingLoad?: boolean
// to skip fetches when caller knows domain is disabled.
```

- Minimal change: keep current fetches; engine already treats nulls as “no effect”.
- If desired: add optional flags so Training UI can skip `useCycle` when cycle is disabled, and vice versa.

### 4.3 Rule modules – no code change

- `evaluateCyclePhaseRules(phase, readiness)` – `phase === null` → returns `[]`.
- `evaluateRecentLoadRules(recentLoad, readiness)` – `!recentLoad || sessions < 4` → returns `[]`.
- `evaluateReadinessRules(readiness)` – `readiness === null` → returns `[]`.

### 4.4 `useCalendarMonth` – already optional

- `assignmentData` – training only; null/empty → `sessions = []`.
- `latestPeriodStart` – cycle only; null → `cyclePhase = null` for all days.
- No structural change needed.

### 4.5 `useDailyInsight` – optional cycle

- Passes `phase`, `cycleDay` to insight service.
- Service should treat `phase === null` as “no cycle insight”.
- Verify `computeInsightTitle/Body` handle null phase.

### 4.6 `adjustmentService`

- `getAdjustmentRecommendation(cyclePhase, readiness)` – already handles null `cyclePhase` (no menstruation/luteal rules).
- Ensure no assumptions when both are null.

### 4.7 `phasePerformanceService` (Intelligence only)

- Requires both cycle and training.
- Return `null` when `periodStarts.length === 0` or no workout data.
- No changes to other domains.

### 4.8 File layout (optional)

```
src/lib/
├── domains/
│   ├── cycle/
│   │   ├── cycleService.ts
│   │   ├── cycleSymptomService.ts
│   │   ├── cycleUtils.ts
│   │   └── index.ts
│   ├── training/
│   │   ├── workoutStore.ts
│   │   ├── programService.ts
│   │   ├── workoutService.ts
│   │   ├── workoutLogService.ts
│   │   └── index.ts
│   └── intelligence/
│       ├── readinessService.ts
│       ├── adaptation/
│       ├── adjustmentService.ts
│       ├── insightService.ts
│       ├── phasePerformanceService.ts
│       └── index.ts
```

- This is a refactor for clarity; not required for separation of concerns.

---

## 5. Summary

| Requirement | Status |
|-------------|--------|
| Cycle works without training | Yes – `cycleService` has no training imports |
| Training works without cycle | Yes – `workoutStore`, `programService` have no cycle imports |
| Readiness handles optional inputs | Yes – score uses only provided factors |
| Adaptation degrades gracefully | Yes – rules return `[]` when inputs are null |
| No hard dependency between domains | Yes – domains are separate; Intelligence layer is the only bridge |
| Minimal changes | Rename context fields, verify null handling, optional domain folder layout |

No UI changes needed for this logic separation.
