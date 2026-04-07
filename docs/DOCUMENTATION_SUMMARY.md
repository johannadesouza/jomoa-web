# Documentation cleanup – summary

## Kommenteringsregelverk (kod)

- **Fil-nivå:** Kort blockkommentar överst som beskriver syfte och var filen används.
- **Offentlig API:** JSDoc med `@param` / `@returns` för exporterade funktioner och hooks när det inte är uppenbart.
- **Komplex logik:** Inline-kommentar för "varför", inte "vad".
- **Svenska** för kommentarer i jomoa-mobile; engelska eller svenska i delad lib enligt projekt.
- Undvik TODO/FIXME kvar i produktion – flytta till docs/DOCS_INVENTORY_AND_PLAN eller DATABASE_BACKLOG.

## Updated documentation file tree

```
README.md
CONTRIBUTING.md                  # Bidra – tester, PR, arkitektur
.github/
├── workflows/ci.yml             # CI: mobile test
└── PULL_REQUEST_TEMPLATE.md    # PR-checklista
docs/
├── AGILE_PRACTICES.md           # Agila rutiner, DoD, CI, backlog
├── ARCHITECTURE.md
├── PRODUCT_OVERVIEW.md
├── DECISIONS.md
├── DOCS_INVENTORY_AND_PLAN.md   # Inventory + code-vs-doc + 3-tier plan
├── DOCUMENTATION_SUMMARY.md     # This file
└── archive/
    ├── content-db-migration.md
    ├── FINSLIPNING_PLAN.md
    ├── MODULAR_DOMAIN_ARCHITECTURE.md
    ├── TESTFLIGHT_UX_REVIEW.md
    └── AGILITY_AUDIT.md

jomoa-mobile/
├── README.md
├── docs/
│   ├── DATA_FLOW.md
│   ├── SCHEMA_REFERENCE.md
│   ├── QA_SEED_GUIDE.md
│   ├── E2E_VERIFICATION.md
│   ├── DEMO_MODE.md
│   └── TESTFLIGHT_READINESS.md
└── supabase/
    └── README.md
```

## Deleted files

- **None.** Obsolete or point-in-time docs were **moved to `docs/archive/`**, not deleted.

## Archived files (Tier A)

| From | To |
|------|-----|
| jomoa-mobile/docs/FINSLIPNING_PLAN.md | docs/archive/FINSLIPNING_PLAN.md |
| jomoa-mobile/docs/MODULAR_DOMAIN_ARCHITECTURE.md | docs/archive/MODULAR_DOMAIN_ARCHITECTURE.md |
| jomoa-mobile/docs/TESTFLIGHT_UX_REVIEW.md | docs/archive/TESTFLIGHT_UX_REVIEW.md |
| jomoa-mobile/docs/AGILITY_AUDIT.md | docs/archive/AGILITY_AUDIT.md |
| docs/content-db-migration.md | docs/archive/content-db-migration.md |

## Rewritten / updated files (Tier B)

| File | Changes |
|------|---------|
| **README.md** (root) | Product line inkl. man och no-cycle; två Supabase-projekt; env USER/CONTENT; migrationspaths; doc-lista utan BRANDING_GUIDE_V1. |
| **jomoa-mobile/README.md** | Tog bort referenser till design/engineering-standards; uppdaterad projektstruktur (adaptation, domain, repos, features); rätt env; features-lista (tabs, cycle, readiness, presentation). |
| **jomoa-mobile/docs/DATA_FLOW.md** | Cycle-sektion: cycle engine (cycles, user_cycle_settings, cycleEngineService, cycleEngine.ts), legacy cycle_events. |
| **jomoa-mobile/docs/SCHEMA_REFERENCE.md** | clients: presentation_profile, presentation_theme; ny sektion Cycle engine (cycles, cycle_stats, user_cycle_settings); migrationspaths. |
| **jomoa-mobile/docs/QA_SEED_GUIDE.md** | readiness_check_ins → daily_readiness. |
| **jomoa-mobile/docs/E2E_VERIFICATION.md** | Env USER/CONTENT; migrationspaths; onboarding-steg (PathChoice, Kön/Tema, CycleSetup). |
| **jomoa-mobile/supabase/README.md** | Tog bort MIGRATION_ORDER.txt; beskrivning av migrations + cycle engine i user migrations; seed + Content DB. |

## New files (Tier C)

| File | Innehåll |
|------|----------|
| **docs/ARCHITECTURE.md** | Data layers, cycle engine, readiness, terminology (presentation_profile, cycle mode, adaptation engine). |
| **docs/PRODUCT_OVERVIEW.md** | Vad JOMOA är, core flows, begrepp; ingen marknadsföring. |
| **docs/DECISIONS.md** | Two DBs, cycle engine, adaptation engine, presentation profile/theme, migrations. |

## Major documentation changes

- **Terminology:** All dokumentation använder nu: presentation_profile, presentation_theme, cycle mode (regular / missing_period / perimenopause), adaptation engine, cycle engine, User DB / Content DB.
- **Backend:** Root och mobile README beskriver två Supabase-projekt och rätt env-variabler (EXPO_PUBLIC_USER_SUPABASE_*, EXPO_PUBLIC_CONTENT_SUPABASE_*).
- **Cycle:** DATA_FLOW och SCHEMA_REFERENCE beskriver både cycle engine (cycles, user_cycle_settings, cycle_stats) och legacy cycle_events.
- **Migrations:** Tydliga sökvägar: jomoa-mobile/supabase/migrations/, supabase/user/migrations/, supabase/content/migrations/.
- **Ingen referens till** BRANDING_GUIDE_V1, design-standards.md eller engineering-standards.md (filer finns inte).

