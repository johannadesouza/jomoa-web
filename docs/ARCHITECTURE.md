# JOMOA – Architecture

## High-level

- **jomoa-mobile:** React Native (Expo) app; `src/features/` per flöde (dashboard, train, journey, learn, cycle, readiness, settings, onboarding), `src/lib/` för domain, services, repos, hooks. Två Supabase-klienter: User DB (persondata) och Content DB (program, artiklar, copy, insiktsmallar).
- **admin:** Next.js admin; `app/` med sidor, delade komponenter (AdminNav, ConfirmDeleteButton). Content DB endast.
- **supabase/user** och **supabase/content:** Migrationer för User DB respektive Content DB.

## Data layers (jomoa-mobile)

| Layer | Innehåll |
|-------|----------|
| **config** | Supabase-klienter: `config/supabase.ts` → userClient; content anropas via `contentClient` från `lib/supabase`. |
| **repos** | `userRepo`: assignments, workoutLog, cycle (User DB). `contentRepo`: programs, exercises, sessionTemplates, articles, onboardingCopy, appCopy, insightTemplates, symptomOptions, etc. (Content DB). |
| **services** | Business logic: cycleEngineService, insightService, readinessService, calendarEntryService, workoutLogService, measurementsService, etc. Services anropar repos eller Supabase. |
| **domain** | Rena funktioner: program, workout, readinessScore, insightKeys. |
| **adaptation** | Träningsjustering: engine + rules (cycle phase, readiness, perimenopause, recent load, weekly progression). Input: cycle phase, readiness, perimenopause symptoms, load; output: volumeModifier, suggestDeload, suggestRecovery, reason. |
| **utils** | cycleEngine (pure: fas, overdue, datum), cycleUtils, date. |
| **hooks** | useDashboard, useCycle, useTrainingAdaptation, useInsights, useReadiness, useCalendarMonth, etc. |

## Features → services / repos

- **Riktlinje:** Feature-skärmar (screens i `features/`) anropar helst **services** eller **hooks** som i sin tur använder repos. Ingen direkt Supabase i UI – använd `userRepo`/`contentRepo` eller en service.
- **Enkla läs:** Att anropa contentRepo (t.ex. artiklar, program) direkt från en skärm är acceptabelt för enkla listor/detaljer. När det finns affärslogik, aggregering eller flera källor ska det ligga i en service eller hook.
- **Skriv:** Alla uppdateringar (clients, readiness, pass, etc.) ska gå via repo eller service, inte via Supabase-klient i komponenten.

## Cycle engine

- **DB:** Tabellerna `cycles`, `cycle_stats`, `user_cycle_settings` (User DB; migration i `supabase/user/migrations/003_cycle_engine.sql`). Legacy `cycle_events` används för periodloggning.
- **Pure logik:** `lib/utils/cycleEngine.ts` – getCyclePhase, getOverdueState, computePhaseBoundaries, todayString, dateDiffDays, addDaysToDate.
- **Service:** `cycleEngineService.ts` – getActiveCycle, getCycleStats, getUserCycleSettings, upsert cycle/stat/settings, migrering från cycle_events.
- **Mode:** `user_cycle_settings.mode`: `regular` | `missing_period` | `perimenopause`.

## Readiness

- **DB:** `daily_readiness` (User DB).
- **Score:** Beräknas i domain (readinessScore) eller readinessService; används av adaptation engine och insikter.

## Terminology (align with code)

| Term | Betydelse |
|------|-----------|
| presentation_profile | clients.presentation_profile (male / female / neutral) |
| presentation_theme | clients.presentation_theme (bold / soft / neutral) |
| cycle mode | user_cycle_settings.mode (regular / missing_period / perimenopause) |
| adaptation engine | lib/adaptation (engine + rules) |
| cycle engine | cycleEngineService + cycleEngine.ts; tabellerna cycles, cycle_stats, user_cycle_settings |

## Docs

- Dataflöden: `jomoa-mobile/docs/DATA_FLOW.md`
- Schema: `jomoa-mobile/docs/SCHEMA_REFERENCE.md`
