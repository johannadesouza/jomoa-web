# Deployment Guide för JOMOA

## Steg-för-steg guide för att göra plattformen redo för testning

### 1. Supabase Setup

#### A. Skapa Supabase Project
1. Gå till [supabase.com](https://supabase.com)
2. Skapa nytt projekt
3. Notera:
   - Project URL
   - Anon Key (Settings → API)
   - Service Role Key (Settings → API) - **HÅLL DENNA HEMLIG**

#### B. Kör Migrations
I Supabase Dashboard → SQL Editor, kör i denna ordning:

1. **Huvudschema**
   ```sql
   -- Kör: supabase/migrations/20251216091014_remote_schema.sql
   ```

2. **Notification Triggers**
   ```sql
   -- Kör: supabase/migrations/create_notifications_triggers.sql
   ```

3. **Onboarding Tasks Seed**
   ```sql
   -- Kör: supabase/migrations/20250120000000_seed_onboarding_tasks.sql
   ```

4. **RLS Policies** ⚠️ **VIKTIGT FÖR SÄKERHET**
   ```sql
   -- Kör: supabase/migrations/20250120000001_add_rls_policies.sql
   ```

5. **Tips Library Seed** (valfritt)
   ```sql
   -- Kör: supabase/seed.sql (endast INSERT INTO tips_library delen)
   ```

#### C. Verifiera RLS
Kontrollera att RLS är aktiverat:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'training_programs', 'workout_sessions_log', 'daily_readiness');
```

Alla ska ha `rowsecurity = true`.

### 2. Environment Variables

#### Lokal utveckling (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Production (Vercel/Netlify)
Sätt samma variabler i deployment-plattformens settings.

### 3. Testa Lokalt

```bash
# Installera dependencies
npm install

# Starta dev server
npm run dev
```

Testa:
- [ ] Login fungerar
- [ ] Coach kan skapa klient
- [ ] Client kan logga in
- [ ] Program creation fungerar
- [ ] Notifications fungerar

### 4. Build & Deploy

#### Vercel (Rekommenderat)

1. **Installera Vercel CLI** (valfritt)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Sätt Environment Variables i Vercel Dashboard**
   - Gå till Project Settings → Environment Variables
   - Lägg till alla variabler från `.env.local`

4. **Redeploy**
   - Vercel deployar automatiskt vid push till main branch

#### Alternativ: Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Environment variables**: Lägg till i Netlify Dashboard

### 5. Post-Deployment Checklist

#### A. Verifiera Supabase Connection
- [ ] Appen kan ansluta till Supabase
- [ ] Authentication fungerar
- [ ] Queries fungerar

#### B. Testa Säkerhet
- [ ] Coach kan bara se sina klienter
- [ ] Client kan bara se sin egen data
- [ ] RLS policies blockerar otillåtna queries

#### C. Testa Core Features
- [ ] Coach flow (skapa klient, program, etc.)
- [ ] Client flow (readiness, workouts, tips)
- [ ] Notifications
- [ ] Onboarding

#### D. Performance
- [ ] Sidor laddar snabbt
- [ ] Inga console errors
- [ ] Mobile responsiveness fungerar

### 6. Scheduled Jobs (Framtida)

För att `check_missing_readiness` ska köras automatiskt:

**Option 1: Supabase Cron (om tillgängligt)**
```sql
-- Skapa cron job i Supabase
SELECT cron.schedule(
  'check-missing-readiness',
  '0 9 * * *', -- Kör kl 09:00 varje dag
  $$SELECT public.check_missing_readiness()$$
);
```

**Option 2: External Cron (Vercel Cron, GitHub Actions, etc.)**
- Skapa en cron job som anropar `/api/notifications/check-missing`
- Kör dagligen kl 09:00

### 7. Monitoring (Rekommenderat)

#### Supabase Dashboard
- Övervaka database usage
- Kolla query performance
- Övervaka errors

#### Vercel Analytics
- Page views
- Performance metrics
- Error tracking

### 8. Backup

#### Supabase
- Automatiska backups ingår i Supabase
- Manuell backup: `pg_dump` via Supabase CLI

#### Code
- Git repository är backup
- Push regelbundet till GitHub/GitLab

## Troubleshooting

### "RLS policy violation"
**Lösning**: Kör `20250120000001_add_rls_policies.sql` migration

### "Missing environment variables"
**Lösning**: Kontrollera att alla variabler är satta i deployment-plattformen

### "Migration errors"
**Lösning**: 
- Kör migrations i rätt ordning
- Kontrollera att extensions är aktiverade (pgcrypto, uuid-ossp)

### "Build fails"
**Lösning**:
- Kontrollera TypeScript errors: `npm run build`
- Fixa linter errors: `npm run lint`

## Support

För problem eller frågor, kontakta projektägaren.

