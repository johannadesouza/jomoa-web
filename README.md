# JOMOA Coach Platform

Ett smart coachingsystem som stödjer tränare och klienter genom att förena träning, fysiologi och beteendemönster.

## 🚀 Snabbstart

### Förutsättningar

- Node.js 18+ och npm
- Supabase-konto och projekt
- Git

### Installation

1. **Klona repot**
   ```bash
   git clone <repository-url>
   cd jomoa.coach/jomoa-app
   ```

2. **Installera dependencies**
   ```bash
   npm install
   ```

3. **Konfigurera environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fyll i dina Supabase-värden i `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Din Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Din Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Din Supabase service role key (för admin-operationer)

4. **Sätt upp databasen**
   
   Kör migrations i Supabase SQL Editor eller via Supabase CLI:
   
   ```bash
   # Via Supabase CLI (om installerat)
   supabase db reset
   
   # Eller kör migrations manuellt i Supabase Dashboard → SQL Editor:
   # 1. Kör: supabase/migrations/20251216091014_remote_schema.sql
   # 2. Kör: supabase/migrations/create_notifications_triggers.sql
   # 3. Kör: supabase/migrations/20250120000000_seed_onboarding_tasks.sql
   # 4. Kör: supabase/migrations/20250120000001_add_rls_policies.sql
   ```

5. **Seed data (valfritt)**
   
   Kör seed-filer i Supabase SQL Editor:
   - `supabase/seed_onboarding_tasks.sql` (om inte redan körts via migration)
   - `supabase/seed.sql` (för tips_library och testdata)

6. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```

7. **Öppna appen**
   Gå till [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

```
jomoa-app/
├── app/                    # Next.js app router
│   ├── client/            # Client-side pages
│   ├── coach/             # Coach-side pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components (Card, Button, etc.)
│   └── layout/           # Layout components (Sidebar, Nav, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and services
│   ├── services/         # Business logic services
│   └── utils/            # Helper functions
├── supabase/             # Supabase configuration
│   └── migrations/       # Database migrations
└── styles/               # Global styles
```

## 🔐 Säkerhet

### Row Level Security (RLS)

Alla kritiska tabeller har RLS aktiverat med policies som säkerställer:
- **Coaches** kan bara se sina egna klienter och data
- **Clients** kan bara se sin egen data
- **Global data** (exercises, tips) är läsbar för alla autentiserade användare

Se `supabase/migrations/20250120000001_add_rls_policies.sql` för detaljer.

### Environment Variables

**VIKTIGT:** Lägg aldrig `SUPABASE_SERVICE_ROLE_KEY` i client-side kod. Den ska endast användas i server-side API routes.

## 🗄️ Databas

### Viktiga tabeller

- `profiles` - Användarprofiler (coach/client)
- `clients` - Klienter kopplade till coaches
- `training_programs` - Träningsprogram
- `program_blocks`, `program_weeks`, `program_sessions` - Programstruktur
- `workout_sessions_log` - Loggade träningspass
- `daily_readiness` - Dagsform (readiness)
- `cycle_events` - Cykelhändelser (mensstart, etc.)
- `notifications` - Notifikationer
- `tips_library` - Tips-bibliotek
- `onboarding_tasks` - Onboarding-uppgifter

### Migrations

Kör migrations i ordning:
1. `20251216091014_remote_schema.sql` - Huvudschema
2. `create_notifications_triggers.sql` - Notification triggers
3. `20250120000000_seed_onboarding_tasks.sql` - Onboarding tasks seed
4. `20250120000001_add_rls_policies.sql` - RLS policies

## 🧪 Testning

### Testa som Coach

1. Logga in som coach
2. Skapa en klient (direkt eller via inbjudan)
3. Skapa ett träningsprogram
4. Tilldela program till klient
5. Se klientens progress

### Testa som Client

1. Logga in som client (eller acceptera inbjudan)
2. Fyll i onboarding-checklistan
3. Logga readiness
4. Logga mensstart (om relevant)
5. Starta och logga träningspass
6. Se tips baserat på cykelfas

## 🚢 Deployment

### Vercel (Rekommenderat)

1. **Push till GitHub**
   ```bash
   git push origin main
   ```

2. **Importera projekt i Vercel**
   - Gå till [vercel.com](https://vercel.com)
   - Importera ditt GitHub-repo

3. **Sätt environment variables i Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (för API routes)

4. **Deploy**
   - Vercel deployar automatiskt vid push till main

### Supabase Production Setup

1. **Skapa production Supabase project**
2. **Kör alla migrations**
3. **Seed data** (om önskat)
4. **Verifiera RLS policies**
5. **Sätt upp scheduled jobs** (för readiness missing check)

## 📚 Ytterligare dokumentation

- `PRODUCTION_READINESS.md` - Checklista för production
- `NOTIFICATIONS_README.md` - Notifications system dokumentation
- `ONBOARDING_FIX.md` - Onboarding setup guide
- `GRUNDFUNKTIONER_PLAN.md` - Feature development plan

## 🐛 Felsökning

### "RLS policy violation"
- Kontrollera att RLS policies är korrekt konfigurerade
- Verifiera att användaren har rätt roll (coach/client)
- Kontrollera att foreign keys är korrekta

### "Missing environment variables"
- Kontrollera att `.env.local` finns och är korrekt konfigurerad
- Verifiera att variablerna är satta i deployment-miljön

### "Migration errors"
- Kör migrations i rätt ordning
- Kontrollera att alla dependencies (extensions, types) finns

## 🤝 Bidrag

Detta är ett privat projekt. Kontakta projektägaren för bidrag.

## 📄 Licens

Privat - Alla rättigheter förbehållna

