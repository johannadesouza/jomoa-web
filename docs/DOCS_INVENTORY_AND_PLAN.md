# Documentation inventory and cleanup plan

## 1. Inventory (aktuell lista)

| File | Summary | Status |
|------|---------|--------|
| `README.md` | Repo root: product, monorepo, env, doc links | KEEP |
| `CONTRIBUTING.md` | Bidra – tester, PR, arkitektur | KEEP |
| `docs/AGILE_PRACTICES.md` | Agila rutiner, DoD, CI, backlog | KEEP |
| `docs/ARCHITECTURE.md` | Högnivå arkitektur | KEEP |
| `docs/PRODUCT_OVERVIEW.md` | Produktöversikt | KEEP |
| `docs/DECISIONS.md` | Beslutslogg | KEEP |
| `docs/DOCS_INVENTORY_AND_PLAN.md` | Denna fil – doc-lista + plan | KEEP |
| `docs/DOCUMENTATION_SUMMARY.md` | Kort sammanfattning av doc-struktur | KEEP |
| `docs/RELEASE_CTA_AND_ENV.md` | Release/CTA och miljö | KEEP |
| `docs/archive/AGILITY_AUDIT.md` | Punkt-in-time agility | ARCHIVED |
| `docs/archive/FINSLIPNING_PLAN.md` | Plan copy/settings/man | ARCHIVED |
| `docs/archive/MODULAR_DOMAIN_ARCHITECTURE.md` | Förslag domäner | ARCHIVED |
| `docs/archive/TESTFLIGHT_UX_REVIEW.md` | Punkt-in-time UX | ARCHIVED |
| `docs/archive/content-db-migration.md` | Content DB historik | ARCHIVED |
| `jomoa-mobile/README.md` | Mobile: tech stack, structure, features, env | UPDATE |
| `jomoa-mobile/docs/DATA_FLOW.md` | Calendar, workouts, readiness, cycle | UPDATE |
| `jomoa-mobile/docs/SCHEMA_REFERENCE.md` | Tabeller, migrationssökvägar | UPDATE |
| `jomoa-mobile/docs/QA_SEED_GUIDE.md` | Seed-scenarier, daily_readiness | UPDATE |
| `jomoa-mobile/docs/E2E_VERIFICATION.md` | Manuell E2E-checklista | UPDATE |
| `jomoa-mobile/docs/TESTFLIGHT_READINESS.md` | TestFlight/build | KEEP |
| `jomoa-mobile/docs/FLOW_MAN_KVINNA.md` | Flöde man/kvinna, onboarding | KEEP |
| `jomoa-mobile/docs/PLACEHOLDER_FEATURES.md` | Placeholder-features (Kost m.m.) | KEEP |
| `jomoa-mobile/docs/DECISIONS_ADJUSTMENT_HISTORY.md` | strategy_decisions vs adjustment_history | KEEP |
| `jomoa-mobile/docs/DATABASE_BACKLOG.md` | Databas-backlog | KEEP |
| `jomoa-mobile/supabase/README.md` | Migrations, schema-länk | UPDATE |
| `web/README.md` | Web: landing, waitlist, Next.js | UPDATE |
| `web/docs/README.md` | Fontfiler | KEEP |
| `web/docs/ENVIRONMENT_VARIABLES.md` | Vercel/env (Content DB, Mailchimp) | KEEP |
| `web/docs/BRAND_COLORS.md` | Varumärkesfärger | KEEP |
| `web/docs/MAILCHIMP_SETUP.md` | Mailchimp-inställning | KEEP |
| `web/docs/TROUBLESHOOTING_WAITLIST.md` | Felsök waitlist | KEEP |
| `web/docs/LOGO_AND_FAVICON_SETUP.md` | Logo och favicon | KEEP |
| `web/docs/LANDING_PAGE_REDESIGN.md` | Landningssida redesign | KEEP |

## 2. Code vs doc alignment (mismatches)

- **Root README:** "Aktiva kvinnor" → product supports male and no-cycle; "samma Supabase-backend" → two backends (User DB + Content DB); env: `EXPO_PUBLIC_SUPABASE_*` → use `EXPO_PUBLIC_USER_SUPABASE_*` and `EXPO_PUBLIC_CONTENT_SUPABASE_*`; migrations: "web/supabase/migrations" → mobile: `jomoa-mobile/supabase/migrations/`, content: `supabase/content/`, user: `supabase/user/`; references `BRANDING_GUIDE_V1.md` (missing).
- **jomoa-mobile README:** References `design-standards.md`, `engineering-standards.md` (missing). Project structure: missing `lib/adaptation/`, `lib/domain/`, `lib/repos/`; features: WorkoutsScreen/InsightsScreen → actual tabs Dashboard, Train, Journey, Learn, Cycle, Readiness, Settings; env same as root; "Coming Soon: Cycle tracking" → implemented; Card.Header/Card.Title → verify against current Card API.
- **DATA_FLOW:** Cycle says "cycle_events" + "calculateCyclePhase in cycleUtils" → actual: `cycleEngineService` + `cycleEngine.ts`, tables `cycles`, `user_cycle_settings`, `cycle_stats` (supabase/user/migrations/003_cycle_engine.sql); legacy `cycle_events` still used for period start input.
- **SCHEMA_REFERENCE:** Missing `user_cycle_settings`, `cycles`, `cycle_stats`; `clients` missing `presentation_profile`, `presentation_theme`; cycle_phases/cycle_symptoms described as optional — schema also has cycle engine tables in user migrations.
- **QA_SEED_GUIDE:** "readiness_check_ins" → correct table is `daily_readiness`; seed path `supabase/seed.sql` exists.
- **E2E_VERIFICATION:** "EXPO_PUBLIC_SUPABASE_URL" → use USER/CONTENT env; "web/supabase/migrations" → mobile migrations in jomoa-mobile/supabase; onboarding step "Kön/Tema/CycleQuestion" can be mentioned.
- **content-db-migration:** FAS 1 done; feature flag and dual-DB branches removed in code (Content DB is always used). Doc is historical; keep in archive.
- **jomoa-mobile/supabase/README:** References `MIGRATION_ORDER.txt` (missing); migration list incomplete (e.g. 003 in supabase/user/).

## 3. Three-tier cleanup plan

**Tier A (Archive – obsolete or point-in-time)**  
Move to `docs/archive/`: `FINSLIPNING_PLAN.md`, `MODULAR_DOMAIN_ARCHITECTURE.md`, `TESTFLIGHT_UX_REVIEW.md`, `AGILITY_AUDIT.md`. Move `docs/content-db-migration.md` → `docs/archive/content-db-migration.md`.

**Tier B (Update required)**  
- **Root README:** Product line (inkludera man, no-cycle); two backends; env table (USER/CONTENT); migrations paths; remove BRANDING_GUIDE_V1; doc table without BRANDING.
- **jomoa-mobile README:** Remove references to missing design/engineering-standards; fix project structure (adaptation, domain, repos); fix feature list (tabs/screens); fix env; remove "Coming Soon: Cycle tracking"; keep Card example only if it matches current API.
- **DATA_FLOW:** Add cycle engine: cycles, user_cycle_settings, cycleEngineService, cycleEngine.ts; keep cycle_events as legacy input.
- **SCHEMA_REFERENCE:** Add clients.presentation_profile, presentation_theme; add section for cycle engine (cycles, cycle_stats, user_cycle_settings); note user migrations path.
- **QA_SEED_GUIDE:** Replace "readiness_check_ins" with "daily_readiness".
- **E2E_VERIFICATION:** Env vars USER/CONTENT; migrations path jomoa-mobile/supabase (and user/content if needed); optional: mention onboarding steps (PathChoice, CycleSetup, Kön/Tema).
- **jomoa-mobile/supabase/README:** Remove MIGRATION_ORDER.txt reference; list migration locations (migrations/, user migrations if applicable); link SCHEMA_REFERENCE.
- **web/README:** Short JOMOA-specific intro (waitlist/landing); keep Next.js commands.
- **web/docs/ENVIRONMENT_VARIABLES:** If web uses Content DB only, say so; keep Mailchimp.

**Tier C (Consolidate)**  
Create: `/docs/ARCHITECTURE.md`, `/docs/PRODUCT_OVERVIEW.md`, `/docs/DECISIONS.md`. Pull from archived docs and current code: terminology (presentation_profile, training_engine/adaptation, readiness_engine, cycle mode, bio_mode if used).

## 4. Terminology (align with code)

- **presentation_profile** – clients column (male/female/neutral).
- **presentation_theme** – clients column (bold/soft/neutral).
- **Cycle mode** – user_cycle_settings.mode (regular, missing_period, perimenopause).
- **Adaptation engine** – lib/adaptation (engine, rules: cyclePhase, readiness, perimenopause, etc.).
- **Readiness** – daily_readiness table; readiness score formula in domain/readinessScore or service.
- **Cycle engine** – cycleEngineService + cycleEngine.ts; tables cycles, cycle_stats, user_cycle_settings.
- **bio_mode** – use only if present in code (e.g. cycle mode vs no-cycle).
