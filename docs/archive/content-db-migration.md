# GDPR-säker Content DB-separation

## Översikt

Separerar content-data (exercises, programs, articles) från persondata (clients, logs, cycle)
genom att introducera ett dedikerat **Content DB**-Supabase-projekt. Admin-webben har
tekniskt omöjlig tillgång till persondata eftersom User DB-credentials aldrig förekommer i den miljön.

```
User DB (befintligt)          Content DB (nytt)
─────────────────────         ─────────────────────
clients                       exercises
workout_sessions_log          training_programs
set_logs                      program_blocks
daily_readiness               program_weeks
cycle_events                  program_sessions
cycle_phases                  session_exercises
cycle_symptoms                session_templates
body_measurements             session_template_exercises
client_program_assignments    articles
...                           tips_library
```

---

## Faser

### FAS 1 – Infrastruktur ✅

**Mål:** Introdusera två klienter och ett repo-lager. Appen fungerar exakt som förut (feature flag = false).

#### Checklistor

- [x] `jomoa-mobile/src/lib/supabase/featureFlags.ts` – `USE_SEPARATE_CONTENT_DB`
- [x] `jomoa-mobile/src/lib/supabase/userClient.ts` – wrappa User DB
- [x] `jomoa-mobile/src/lib/supabase/contentClient.ts` – wrappa Content DB (fallback till User DB tills flagga = true)
- [x] `jomoa-mobile/src/lib/repos/contentRepo/` – programs, exercises, sessionTemplates
- [x] `jomoa-mobile/src/lib/repos/userRepo/` – assignments, workoutLog, cycle
- [x] `jomoa-mobile/src/lib/services/programService.ts` – thin wrapper, delegerar till repos
- [x] `jomoa-mobile/src/lib/services/workoutService.ts` – thin wrapper, delegerar till repos
- [x] `jomoa-mobile/src/lib/services/sessionTemplateService.ts` – thin wrapper, delegerar till repos
- [x] `web/lib/contentClient.ts` – Content DB-klient för Next.js
- [x] `jomoa-mobile/.env.example` – uppdaterad med nya env-variabler
- [x] `web/.env.local.example` – Content DB-variabler
- [x] `admin/.env.local.example` – ENBART Content DB, inga User DB-variabler

**Kräver inga ändringar i User DB eller driftstopp.**

---

### FAS 2 – Dual-read (säkert läge)

**Mål:** Sätt upp Content DB och verifiera att data är korrekt kopierad. Mobilappen kan
växla med feature flag utan driftstopp.

#### Checklistor

- [ ] Skapa nytt Supabase-projekt för Content DB
- [ ] Kör `supabase/content/migrations/001_content_schema.sql` i Content DB
- [ ] Kör `supabase/content/migrations/002_content_rls.sql` i Content DB
- [ ] Kör `supabase/content/seed/copy_from_user_db.sql` (med FDW eller manuell export/import)
- [ ] Kör `scripts/validate_content_migration.ts` – verifiera row counts och checksums
- [ ] Uppdatera `jomoa-mobile/.env` med Content DB-URL och anon key
- [ ] Uppdatera `web/.env.local` med Content DB-URL och anon key
- [ ] Sätt `EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB=true` i staging-miljö
- [ ] Testa mobilappen mot staging – verifiera att alla program, övningar och sessioner laddas
- [ ] Testa web-appen – verifiera att artiklar visas korrekt

**Rollback:** Sätt `EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB=false` – appen faller tillbaka på User DB.

---

### FAS 3 – Cutover (produktion)

**Mål:** Slå på flaggan i produktion. Rensa fallback-kod.

#### Checklistor

- [ ] Kör `validate_content_migration.ts` mot produktion
- [ ] Sätt `EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB=true` i produktion
- [ ] Driftsätt ny version av mobilappen
- [ ] Verifiera i produktion (5–15 min monitorering)
- [ ] Ta bort alla `USE_SEPARATE_CONTENT_DB ? ... : userClient`-grenar i repos
- [ ] Ta bort `web/lib/supabaseClient.ts` (legacy alias)
- [ ] Uppdatera import i `web/app/api/articles/` att importera `contentClient` direkt
- [ ] Rename content-tabeller i User DB till `_archived_*` (INTE DROP – vänta 30 dagar)
- [ ] Ta bort `EXPO_PUBLIC_SUPABASE_URL` legacy alias från .env

---

## Miljövariabler – sammanfattning

### jomoa-mobile

| Variabel | Beskrivning | FAS |
|----------|-------------|-----|
| `EXPO_PUBLIC_USER_SUPABASE_URL` | User DB URL | FAS 1+ |
| `EXPO_PUBLIC_USER_SUPABASE_ANON_KEY` | User DB anon key | FAS 1+ |
| `EXPO_PUBLIC_CONTENT_SUPABASE_URL` | Content DB URL | FAS 2+ |
| `EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY` | Content DB anon key | FAS 2+ |
| `EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB` | Feature flag (true/false) | FAS 2+ |
| `EXPO_PUBLIC_SUPABASE_URL` | Legacy alias – tas bort i FAS 3 | – |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Legacy alias – tas bort i FAS 3 | – |

### web

| Variabel | Beskrivning |
|----------|-------------|
| `NEXT_PUBLIC_CONTENT_SUPABASE_URL` | Content DB URL |
| `NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY` | Content DB anon key |

### admin

| Variabel | Beskrivning |
|----------|-------------|
| `CONTENT_SUPABASE_URL` | Content DB URL |
| `CONTENT_SERVICE_ROLE_KEY` | Service role key – server-only, ALDRIG NEXT_PUBLIC_ |

**OBS: `admin/.env.local` innehåller INGA User DB-variabler.**

---

## Säkerhetsmatris

| Komponent | Kan nå User DB | Kan nå Content DB | Nyckeltyp |
|-----------|---------------|------------------|-----------|
| Mobilapp (jomoa-mobile) | Ja (RLS per user) | Ja (read-only) | anon |
| webb (web/) | Nej | Ja (read-only) | anon |
| Admin (admin/) | **Nej** | Ja (full CRUD) | service_role (server-only) |

---

## Datakopiering – steg för steg

### Alternativ A – postgres_fdw (enklast för Supabase)

```sql
-- Kör i Content DB
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE SERVER user_db
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'db.jfilxiqtecaxbwdsztaz.supabase.co', dbname 'postgres', port '5432');
CREATE USER MAPPING FOR CURRENT_USER
  SERVER user_db OPTIONS (user 'postgres', password '<DB_PASSWORD>');
IMPORT FOREIGN SCHEMA public
  LIMIT TO (exercises, training_programs, program_blocks, program_weeks,
            program_sessions, session_exercises, session_templates,
            session_template_exercises, articles)
  FROM SERVER user_db INTO public_fdw;
-- Kör sedan copy_from_user_db.sql
```

### Alternativ B – pg_dump (rekommenderas för produktion)

```bash
# 1. Exportera från User DB
pg_dump \
  -h db.jfilxiqtecaxbwdsztaz.supabase.co \
  -U postgres \
  -t exercises \
  -t training_programs \
  -t program_blocks \
  -t program_weeks \
  -t program_sessions \
  -t session_exercises \
  -t session_templates \
  -t session_template_exercises \
  -t articles \
  --data-only \
  postgres > content_data.sql

# 2. Importera till Content DB
psql -h db.<content-project>.supabase.co -U postgres postgres < content_data.sql
```

---

## Verifiering

```bash
USER_DB_SUPABASE_URL=https://jfilxiqtecaxbwdsztaz.supabase.co \
USER_DB_SUPABASE_ANON_KEY=<anon-key> \
CONTENT_SUPABASE_URL=https://<content-project>.supabase.co \
CONTENT_SUPABASE_ANON_KEY=<anon-key> \
npx tsx scripts/validate_content_migration.ts
```

Exitar med kod 0 om allt stämmer.

---

## Rollback-plan

**FAS 1–2:** Sätt `EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB=false` → appen faller tillbaka på User DB.
Ingen dataförlust möjlig eftersom User DB inte rörts.

**FAS 3 (efter cutover):**
1. Sätt `EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB=false`
2. Driftsätt gammal version av mobilappen (User DB-klienten är kvar som legacy alias)
3. Innehållet i `_archived_*`-tabellerna kan återaktiveras med RENAME

**Riskbedömning FAS 3:** Låg – alla skrivoperationer (workout logs, cycle data) sker mot User DB
och påverkas aldrig av content-separationen.

---

## Filer skapade / ändrade

| Fil | Typ | Beskrivning |
|-----|-----|-------------|
| `jomoa-mobile/.env.example` | Ändrad | Content DB env-variabler |
| `web/.env.local.example` | Ny | Content DB env för web |
| `admin/.env.local.example` | Ny | Service-role env för admin |
| `jomoa-mobile/src/lib/supabase/featureFlags.ts` | Ny | Feature flag |
| `jomoa-mobile/src/lib/supabase/userClient.ts` | Ny | User DB-klient |
| `jomoa-mobile/src/lib/supabase/contentClient.ts` | Ny | Content DB-klient med fallback |
| `jomoa-mobile/src/lib/supabase/index.ts` | Ny | Re-export |
| `jomoa-mobile/src/lib/repos/contentRepo/exercises.ts` | Ny | Content repo – exercises |
| `jomoa-mobile/src/lib/repos/contentRepo/programs.ts` | Ny | Content repo – programs |
| `jomoa-mobile/src/lib/repos/contentRepo/sessionTemplates.ts` | Ny | Content repo – templates |
| `jomoa-mobile/src/lib/repos/contentRepo/index.ts` | Ny | Re-export |
| `jomoa-mobile/src/lib/repos/userRepo/assignments.ts` | Ny | User repo – assignments (cross-DB join löst) |
| `jomoa-mobile/src/lib/repos/userRepo/workoutLog.ts` | Ny | User repo – workout log |
| `jomoa-mobile/src/lib/repos/userRepo/cycle.ts` | Ny | User repo – cycle |
| `jomoa-mobile/src/lib/repos/userRepo/index.ts` | Ny | Re-export |
| `jomoa-mobile/src/lib/services/programService.ts` | Refaktorerad | Thin wrapper → repos |
| `jomoa-mobile/src/lib/services/workoutService.ts` | Refaktorerad | Thin wrapper → repos |
| `jomoa-mobile/src/lib/services/sessionTemplateService.ts` | Refaktorerad | Thin wrapper → repos |
| `web/lib/contentClient.ts` | Ny | Content DB-klient för Next.js |
| `web/lib/supabaseClient.ts` | Ändrad | Deprecated alias → contentClient |
| `supabase/content/migrations/001_content_schema.sql` | Ny | Content DB schema |
| `supabase/content/migrations/002_content_rls.sql` | Ny | Content DB RLS |
| `supabase/content/seed/copy_from_user_db.sql` | Ny | Datakopieringsskript |
| `scripts/validate_content_migration.ts` | Ny | Verifieringsskript |
| `admin/package.json` | Ny | Admin Next.js-app |
| `admin/lib/contentClient.ts` | Ny | Service-role klient (server-only) |
| `admin/app/layout.tsx` | Ny | Admin-layout med navigation |
| `admin/app/exercises/page.tsx` | Ny | CRUD övningar |
| `admin/app/programs/page.tsx` | Ny | CRUD program |
| `admin/app/session-templates/page.tsx` | Ny | CRUD passmallar |
| `admin/app/articles/page.tsx` | Ny | CRUD artiklar med draft/publish |
| `admin/app/tips/page.tsx` | Ny | CRUD tips |
