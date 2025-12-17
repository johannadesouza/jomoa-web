# Pre-Launch Checklist

## ✅ Klart

### Backend
- [x] Databas schema komplett
- [x] RLS policies skapade (`20250120000001_add_rls_policies.sql`)
- [x] Notification triggers implementerade
- [x] Onboarding tasks seed data
- [x] Tips library seed data

### Frontend Core
- [x] Authentication (login/logout)
- [x] Role-based routing
- [x] Client dashboard med onboarding
- [x] Coach dashboard
- [x] Program creation (stepper wizard)
- [x] Calendar view (week)
- [x] Notifications system
- [x] Tips library
- [x] Readiness logging

### UX Components
- [x] Card, Button, Input components
- [x] Empty states
- [x] Loading states (Skeleton)
- [x] Navigation (Sidebar/BottomNav)
- [x] Cycle indicators

## 🔧 Att göra innan launch

### 1. Kör Migrations i Supabase ⚠️ **KRITISKT**

```sql
-- I Supabase SQL Editor, kör i ordning:
1. 20251216091014_remote_schema.sql (om inte redan körts)
2. create_notifications_triggers.sql
3. 20250120000000_seed_onboarding_tasks.sql
4. 20250120000001_add_rls_policies.sql ⚠️ VIKTIGT FÖR SÄKERHET
```

### 2. Verifiera RLS Policies

Kör detta i Supabase SQL Editor för att verifiera:
```sql
-- Kontrollera att RLS är aktiverat
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'clients', 
  'training_programs', 
  'workout_sessions_log', 
  'daily_readiness',
  'cycle_events',
  'client_program_assignments',
  'exercises',
  'notifications'
);
```

Alla ska ha `rowsecurity = true`.

### 3. Seed Data

Kör seed-filer:
```sql
-- Tips library (om inte redan körts)
-- Kör relevanta INSERT statements från supabase/seed.sql
```

### 4. Environment Variables

Sätt i `.env.local` (lokalt) och deployment-plattform:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (endast för API routes)

### 5. Testa Core Flows

#### Coach Flow
- [ ] Logga in som coach
- [ ] Skapa klient (direkt eller invite)
- [ ] Skapa träningsprogram
- [ ] Tilldela program till klient
- [ ] Se klientens progress

#### Client Flow
- [ ] Logga in som client
- [ ] Fyll i onboarding-checklistan
- [ ] Logga readiness
- [ ] Logga mensstart (om relevant)
- [ ] Starta och logga pass
- [ ] Se tips baserat på cykelfas
- [ ] Se notifications

### 6. Säkerhetstest

- [ ] Testa att coach bara ser sina klienter
- [ ] Testa att client bara ser sin egen data
- [ ] Testa att RLS blockerar otillåtna queries
- [ ] Verifiera att service role key inte exponeras i client

### 7. Build & Deploy

- [ ] `npm run build` fungerar utan fel
- [ ] TypeScript errors fixade
- [ ] Linter errors fixade
- [ ] Deploy till Vercel/Netlify
- [ ] Environment variables satta i deployment

### 8. Post-Deployment

- [ ] Testa authentication i production
- [ ] Testa core features i production
- [ ] Verifiera RLS fungerar i production
- [ ] Testa mobile responsiveness

## 📝 Dokumentation

- [x] README.md
- [x] DEPLOYMENT_GUIDE.md
- [x] PRODUCTION_READINESS.md
- [x] NOTIFICATIONS_README.md
- [x] ONBOARDING_FIX.md

## 🚀 När allt är klart

1. **Skapa test-användare**
   - 1-2 coaches
   - 2-3 clients

2. **Testa end-to-end**
   - Coach skapar program → Client loggar pass → Coach ser progress

3. **Gör en "soft launch"**
   - Bjud in några testare
   - Samla feedback
   - Fixa kritiska buggar

4. **Monitorera**
   - Kolla Supabase logs för errors
   - Övervaka performance
   - Samla användarfeedback

## ⚠️ Kända Begränsningar

- **Scheduled Jobs**: `check_missing_readiness` måste köras manuellt eller via extern cron (inte Supabase Cron ännu)
- **Coach Comments**: Notification trigger för coach comments är kommenterad (kräver `notes` fält på `workout_sessions_log`)

## 🐛 Vanliga Problem

### "RLS policy violation"
→ Kör `20250120000001_add_rls_policies.sql`

### "Missing environment variables"
→ Kontrollera `.env.local` och deployment settings

### "Migration errors"
→ Kör migrations i rätt ordning, kontrollera dependencies

### "Build fails"
→ Fixa TypeScript/linter errors: `npm run build`

