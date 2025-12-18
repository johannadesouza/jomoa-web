# Vercel Deploy Audit & Cleanup Rapport

**Datum:** 2025-01-20  
**Projekt:** jomoa-app  
**Mål:** Förbereda projektet för Vercel-deployment och rensa oanvänd kod

---

## (a) Varför deploy troligen failar just nu

### 1. **Saknade Environment Variables** ⚠️ KRITISKT
- `NEXT_PUBLIC_SUPABASE_URL` - Krävs för Supabase-anslutning
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Krävs för client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Krävs för API routes (`/api/clients/create`, `/api/notifications/check-missing`)
- **Impact:** Appen kommer crasha vid runtime när Supabase-client initieras

### 2. **ESLint Configuration Missing** ⚠️
- `npm run lint` failar: saknar `eslint.config.js` (ESLint v9 kräver ny format)
- **Impact:** Vercel kan faila build om lint körs i build-processen (beroende på settings)

### 3. **Nested Directory Structure** ⚠️
- Det finns en `jomoa-app/jomoa-app/` mapp med duplicerade public-filer
- **Impact:** Förvirring, risk för att deploya fel mapp, onödig storlek

### 4. **Multiple Lockfiles** ⚠️
- Både `package-lock.json` och `pnpm-lock.yaml` finns
- Next.js varnar om detta vid build
- **Impact:** Potentiell dependency-resolution konflikt

### 5. **Saknad Vercel Configuration** ℹ️
- Ingen `vercel.json` för custom build settings
- **Impact:** Kan fungera, men bättre kontroll med explicit config

### 6. **Debug Route i Production** ⚠️
- `/app/debug-role/page.tsx` - Debug-sida som inte ska finnas i production
- **Impact:** Säkerhetsrisk, exponerar intern debug-funktionalitet

### 7. **Hardcoded Values** ⚠️
- Inga hårdkodade API-keys hittade (bra!)
- Men: `create_auth_users.sh` har hårdkodad localhost URL (`http://127.0.0.1:54321`)
- **Impact:** Script fungerar inte i production (men används troligen bara lokalt)

### 8. **Saknad .env.example** ℹ️
- Ingen `.env.example` fil för dokumentation
- **Impact:** Svårt att veta vilka env vars som behövs

---

## (b) Top 10 Cleanup-åtgärder

### 1. **Ta bort nested `jomoa-app/jomoa-app/` mapp**
   - **Fil:** `jomoa-app/jomoa-app/public/` (hela mappen)
   - **Anledning:** Duplicerad struktur, förvirrande, onödig storlek
   - **Risk:** Låg (verkar vara backup/kopia)

### 2. **Ta bort `pnpm-lock.yaml`**
   - **Fil:** `jomoa-app/pnpm-lock.yaml`
   - **Anledning:** Projektet använder npm (package-lock.json finns), dubbel lockfile orsakar varningar
   - **Risk:** Låg (npm används)

### 3. **Ta bort debug-route**
   - **Fil:** `jomoa-app/app/debug-role/page.tsx`
   - **Anledning:** Debug-funktionalitet ska inte finnas i production
   - **Risk:** Låg (endast debug)

### 4. **Skapa ESLint config**
   - **Fil:** Ny `jomoa-app/eslint.config.mjs`
   - **Anledning:** ESLint v9 kräver ny config-format, annars failar lint
   - **Risk:** Ingen (fixar problem)

### 5. **Ta bort oanvända dokumentationsfiler (valfritt)**
   - **Filer:**
     - `jomoa-app/COMPLETION_PLAN.md`
     - `jomoa-app/COVERAGE_MAP.md`
     - `jomoa-app/DATABASE_REQUIREMENTS.md`
     - `jomoa-app/DEBUG_RLS.md`
     - `jomoa-app/FIX_COACH_ROLE.md`
     - `jomoa-app/GRUNDFUNKTIONER_PLAN.md`
     - `jomoa-app/IMPLEMENTATION_STATUS.md`
     - `jomoa-app/IMPLEMENTATION_SUMMARY.md`
     - `jomoa-app/master_overview.md`
     - `jomoa-app/NOTIFICATIONS_README.md`
     - `jomoa-app/ONBOARDING_FIX.md`
     - `jomoa-app/PRE_LAUNCH_CHECKLIST.md`
     - `jomoa-app/PRODUCTION_READINESS.md`
     - `jomoa-app/QUICK_FIX_RLS.md`
     - `jomoa-app/QUICK_START_TESTING.md`
     - `jomoa-app/STATUS_SUMMARY.md`
     - `jomoa-app/SUMMARY_FINAL.md`
     - `jomoa-app/TEST_RLS.sql`
     - `jomoa-app/TESTING_BLOCKS_WEEKS.md`
     - `jomoa-app/UI_CLEANUP_SUMMARY.md`
     - `jomoa-app/UX_QUESTIONS.md`
     - `jomoa-app/functions.md`
   - **Anledning:** Många dokumentationsfiler som troligen inte behövs i production repo
   - **Rekommendation:** Behåll endast `README.md` och `DEPLOYMENT_GUIDE.md`, flytta resten till wiki/docs
   - **Risk:** Låg (dokumentation)

### 6. **Ta bort `create_auth_users.sh`**
   - **Fil:** `jomoa-app/create_auth_users.sh`
   - **Anledning:** Lokalt dev-script med hårdkodad localhost URL, inte relevant för production
   - **Risk:** Låg (endast lokalt script)

### 7. **Konsolidera utils**
   - **Fil:** `jomoa-app/lib/utils.ts` (endast `cn` funktion)
   - **Status:** Används aktivt (26+ imports)
   - **Action:** Ingen ändring behövs, men notera att det finns både `lib/utils.ts` och `lib/utils/` mapp
   - **Rekommendation:** Överväg att flytta `cn` till `lib/utils/index.ts` för konsistens

### 8. **Verifiera alla UI-komponenter används**
   - **Status:** Alla 26 UI-komponenter verkar användas (baserat på grep)
   - **Action:** Ingen ändring behövs

### 9. **Ta bort `JOMOA Branding.pdf`**
   - **Fil:** `jomoa-app/JOMOA%20Branding.pdf` (69,263 rader!)
   - **Anledning:** Stor PDF-fil som inte behövs i codebase
   - **Rekommendation:** Flytta till separat assets-repo eller dokumentation
   - **Risk:** Låg (endast branding-dokument)

### 10. **Skapa `.env.example`**
   - **Fil:** Ny `jomoa-app/.env.example`
   - **Anledning:** Dokumentera vilka env vars som krävs
   - **Risk:** Ingen (endast dokumentation)

---

## (c) Environment Variables som krävs

### Kritiska (måste finnas)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Var används de:**
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 
  - `lib/supabaseClient.ts` (client-side Supabase client)
  - Används i alla hooks, components, pages
  
- `SUPABASE_SERVICE_ROLE_KEY`:
  - `app/api/clients/create/route.ts` (admin operation för att skapa klienter)
  - `app/api/notifications/check-missing/route.ts` (admin operation för notifications)

### Valfria (för framtida features)

```env
# App URL (för redirects, emails, etc.)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Notera:** `NEXT_PUBLIC_APP_URL` refereras i dokumentation men används inte aktivt i koden just nu. Bra att ha för framtida features (email links, etc.).

---

## Ytterligare observations

### Tech Stack
- **Framework:** Next.js 16.0.10 (App Router)
- **React:** 19.2.0
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + custom components
- **State Management:** React Context (AuthContext)
- **Charts:** Recharts

### Projektstruktur
- ✅ Tydlig separation: `app/client/`, `app/coach/`, `app/api/`
- ✅ Komponenter i `components/` med subfolders
- ✅ Hooks i `hooks/`
- ✅ Utils i `lib/utils/`
- ⚠️ Nested `jomoa-app/jomoa-app/` mapp bör tas bort

### Build Status
- ✅ `npm run build` fungerar lokalt
- ⚠️ `npm run lint` failar (saknar ESLint config)
- ✅ TypeScript kompilerar utan errors

### Säkerhet
- ✅ Supabase credentials använder env vars (bra!)
- ✅ Service role key används endast i API routes (korrekt)
- ⚠️ Debug-route bör tas bort i production

---

## Nästa steg

1. **Skapa ESLint config** (kritiskt för build)
2. **Skapa `.env.example`** (dokumentation)
3. **Ta bort nested mapp och oanvända filer** (cleanup)
4. **Ta bort debug-route** (säkerhet)
5. **Ta bort pnpm-lock.yaml** (cleanup)
6. **Testa build lokalt** efter cleanup
7. **Sätt env vars i Vercel** innan deploy
8. **Deploy och verifiera**

---

**Rapport genererad:** 2025-01-20

