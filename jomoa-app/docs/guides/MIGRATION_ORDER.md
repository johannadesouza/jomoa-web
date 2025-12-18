# Supabase Migrations - Körordning

**Projekt:** jomoa-app  
**Datum:** 2025-01-20

## 📋 Migrations i korrekt ordning

Kör migrations i **exakt** denna ordning i Supabase SQL Editor:

### 1. Huvudschema (MÅSTE köras först)
**Fil:** `supabase/migrations/20251216091014_remote_schema.sql`

**Vad den gör:**
- Skapar alla extensions (pgcrypto, uuid-ossp, etc.)
- Skapar alla tabeller (profiles, clients, training_programs, etc.)
- Skapar alla functions och types
- Skapar alla indexes

**Viktigt:** Detta är grunden för allt annat. Måste köras först!

---

### 2. Notification Triggers
**Fil:** `supabase/migrations/create_notifications_triggers.sql`

**Vad den gör:**
- Skapar `notifications` tabellen (om den inte finns)
- Skapar functions för att skapa notifikationer
- Skapar triggers för automatiska notifikationer

**Varför efter huvudschema:** Behöver `profiles` tabellen som skapas i steg 1.

---

### 3. Seed Onboarding Tasks
**Fil:** `supabase/migrations/20250120000000_seed_onboarding_tasks.sql`

**Vad den gör:**
- Seed data för `onboarding_tasks` tabellen
- Lägger till coach och client onboarding tasks

**Varför efter huvudschema:** Behöver `onboarding_tasks` tabellen som skapas i steg 1.

---

### 4. RLS Policies (Huvudpolicies)
**Fil:** `supabase/migrations/20250120000001_add_rls_policies.sql`

**Vad den gör:**
- Aktiverar Row Level Security (RLS) på alla kritiska tabeller
- Skapar policies för clients, training_programs, workout_sessions_log, etc.
- Säkerställer att coaches bara ser sina klienter och clients bara ser sin egen data

**Varför efter huvudschema:** Behöver alla tabeller som skapas i steg 1.

---

### 5. Fix RLS Clients
**Fil:** `supabase/migrations/20250120000002_fix_rls_clients.sql`

**Vad den gör:**
- Fixar och förenklar RLS policies för `clients` tabellen
- Droppar och återskapar policies med förbättrad logik

**Varför efter steg 4:** Uppdaterar policies som skapades i steg 4.

---

### 6. Cycle Phases RLS
**Fil:** `supabase/migrations/20250120000003_add_cycle_phases_rls.sql`

**Vad den gör:**
- Aktiverar RLS på `cycle_phases` och `cycle_symptoms` tabeller
- Skapar policies för att clients kan se sina egna cykeldata
- Coaches kan se sina klienters cykeldata

**Varför efter huvudschema:** Behöver `cycle_phases` och `cycle_symptoms` tabeller som skapas i steg 1.

---

## 🚀 Snabbkommando för Supabase SQL Editor

Kör dessa i ordning (kopiera och klistra in hela innehållet från varje fil):

```sql
-- 1. Huvudschema
-- Kopiera innehållet från: supabase/migrations/20251216091014_remote_schema.sql

-- 2. Notification Triggers
-- Kopiera innehållet från: supabase/migrations/create_notifications_triggers.sql

-- 3. Seed Onboarding Tasks
-- Kopiera innehållet från: supabase/migrations/20250120000000_seed_onboarding_tasks.sql

-- 4. RLS Policies
-- Kopiera innehållet från: supabase/migrations/20250120000001_add_rls_policies.sql

-- 5. Fix RLS Clients
-- Kopiera innehållet från: supabase/migrations/20250120000002_fix_rls_clients.sql

-- 6. Cycle Phases RLS
-- Kopiera innehållet från: supabase/migrations/20250120000003_add_cycle_phases_rls.sql
```

---

## ⚠️ Viktiga noteringar

### Om du kör migrations flera gånger
- **Huvudschema (steg 1):** Använder `CREATE TABLE IF NOT EXISTS` - säkert att köra flera gånger
- **Notification Triggers:** Använder `CREATE TABLE IF NOT EXISTS` och `CREATE OR REPLACE FUNCTION` - säkert att köra flera gånger
- **Seed Onboarding Tasks:** Använder `ON CONFLICT DO UPDATE` - säkert att köra flera gånger
- **RLS Policies:** Använder `DROP POLICY IF EXISTS` innan skapande - säkert att köra flera gånger

### Om något går fel
1. **Kontrollera felmeddelandet** - det säger ofta vilken tabell/function som saknas
2. **Verifiera att steg 1 är klart** - huvudschemat måste köras först
3. **Kör migrations i ordning** - varje steg bygger på tidigare steg

### Verifiera efter migration
Efter att alla migrations är körda, verifiera:

```sql
-- Kontrollera att RLS är aktiverat
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'training_programs', 'workout_sessions_log', 'daily_readiness', 'cycle_phases');

-- Alla ska ha rowsecurity = true

-- Kontrollera att onboarding tasks finns
SELECT COUNT(*) FROM onboarding_tasks;
-- Borde returnera minst 8 rader (5 coach + 3 client tasks)

-- Kontrollera att notifications tabellen finns
SELECT COUNT(*) FROM notifications;
-- Borde returnera 0 (tom tabell är OK)
```

---

## 📝 Sammanfattning

| Steg | Fil | Beskrivning | Kräver |
|------|-----|-------------|--------|
| 1 | `20251216091014_remote_schema.sql` | Huvudschema - alla tabeller | Inget |
| 2 | `create_notifications_triggers.sql` | Notifications system | Steg 1 |
| 3 | `20250120000000_seed_onboarding_tasks.sql` | Seed data | Steg 1 |
| 4 | `20250120000001_add_rls_policies.sql` | RLS policies | Steg 1 |
| 5 | `20250120000002_fix_rls_clients.sql` | Fix RLS clients | Steg 4 |
| 6 | `20250120000003_add_cycle_phases_rls.sql` | Cycle RLS | Steg 1 |

---

## 🔄 Om du använder Supabase CLI

Om du använder Supabase CLI lokalt:

```bash
cd jomoa-app
supabase db reset  # Kör alla migrations i ordning automatiskt
```

För production, kör migrations manuellt i Supabase Dashboard → SQL Editor i ordningen ovan.

