# Deploy to Vercel - Steg-för-steg Checklista

**Projekt:** jomoa-app  
**Datum:** 2025-01-20

---

## ✅ Förberedelser (Lokalt)

### 1. Verifiera att projektet bygger lokalt
```bash
cd jomoa-app
npm install
npm run build
npm run lint
```

**Förväntat resultat:**
- ✅ Build lyckas utan errors
- ✅ Lint visar endast warnings (inga errors)
- ✅ Inga TypeScript errors

### 2. Verifiera Git status
```bash
git status
git add .
git commit -m "chore: prepare for Vercel deployment - cleanup and config"
```

**Kontrollera:**
- ✅ Alla ändringar är committade
- ✅ Ingen känslig data i commits (inga .env.local filer)

---

## 🚀 Vercel Deployment

### Steg 1: Skapa Vercel-konto och projekt

1. **Gå till [vercel.com](https://vercel.com)**
2. **Logga in** med GitHub/GitLab/Bitbucket
3. **Klicka på "Add New Project"**
4. **Importera ditt repository:**
   - Välj `jomoa.coach` repository
   - Vercel kommer automatiskt detektera Next.js

### Steg 2: Konfigurera projekt-inställningar

**Root Directory:**
- Sätt till: `jomoa-app`
- (Vercel behöver veta att projektet ligger i subfolder)

**Build Settings:**
- Framework Preset: **Next.js** (auto-detected)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Node Version:**
- Använd: **20.x** (eller senaste LTS)
- Sätt i Vercel Dashboard → Settings → Node.js Version

### Steg 3: Sätt Environment Variables

**Gå till:** Project Settings → Environment Variables

**Lägg till följande variabler:**

#### Kritiska (måste finnas):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Var hittar du dessa?**
1. Gå till [Supabase Dashboard](https://app.supabase.com)
2. Välj ditt projekt
3. Gå till **Settings → API**
4. Kopiera:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **HEMLIG!**

#### Valfria (rekommenderas):

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Viktigt:**
- ✅ Sätt variablerna för **Production**, **Preview**, och **Development** environments
- ✅ Efter att du satt variablerna, klicka **"Redeploy"** för att applicera dem

### Steg 4: Deploy

1. **Klicka på "Deploy"**
2. **Vänta på build att slutföras** (2-5 minuter)
3. **Kontrollera build logs:**
   - ✅ "Build Completed"
   - ✅ Inga errors
   - ⚠️ Warnings är OK

### Steg 5: Verifiera Deployment

#### A. Testa att appen laddas
- Öppna din Vercel URL (t.ex. `https://jomoa-app.vercel.app`)
- ✅ Appen laddar utan errors
- ✅ Inga console errors i browser

#### B. Testa Supabase-anslutning
1. Gå till `/login`
2. Försök logga in med test-användare
3. ✅ Login fungerar
4. ✅ Ingen "Supabase connection error"

#### C. Testa API Routes
- Testa `/api/clients/create` (kräver authentication)
- ✅ API routes fungerar
- ✅ Service role key fungerar

#### D. Testa Core Features
- ✅ Coach kan logga in
- ✅ Client kan logga in
- ✅ Dashboard laddar
- ✅ Navigation fungerar

---

## 🔧 Troubleshooting

### Problem: "Build Failed"

**Möjliga orsaker:**
1. **Saknade environment variables**
   - **Lösning:** Kontrollera att alla 3 Supabase-variabler är satta
   
2. **TypeScript errors**
   - **Lösning:** Kör `npm run build` lokalt och fixa errors
   
3. **ESLint errors**
   - **Lösning:** Kör `npm run lint` lokalt och fixa errors

**Debug:**
- Kolla build logs i Vercel Dashboard
- Leta efter specifika error messages

### Problem: "Runtime Error: Supabase connection failed"

**Möjliga orsaker:**
1. **Felaktiga environment variables**
   - **Lösning:** Dubbelkolla att URL och keys är korrekta
   
2. **Variabler inte satta för rätt environment**
   - **Lösning:** Sätt variablerna för Production environment

**Debug:**
- Kolla Vercel Function Logs
- Testa Supabase connection lokalt med samma variabler

### Problem: "API Route returns 500"

**Möjliga orsaker:**
1. **SUPABASE_SERVICE_ROLE_KEY saknas eller är felaktig**
   - **Lösning:** Verifiera service role key i Supabase Dashboard
   
2. **RLS policies blockerar requests**
   - **Lösning:** Kontrollera att RLS policies är korrekt konfigurerade

### Problem: "App works locally but not on Vercel"

**Möjliga orsaker:**
1. **Environment variables saknas i Vercel**
   - **Lösning:** Sätt alla variabler i Vercel Dashboard
   
2. **Cached build**
   - **Lösning:** Klicka "Redeploy" i Vercel Dashboard

---

## 📋 Post-Deployment Checklist

### Säkerhet
- [ ] Inga känsliga data i client-side kod
- [ ] Service role key används endast i API routes
- [ ] RLS policies är aktiverade i Supabase
- [ ] Debug routes är borttagna (✅ redan gjort)

### Performance
- [ ] Sidor laddar snabbt (< 3 sekunder)
- [ ] Inga stora bundle sizes
- [ ] Images är optimerade

### Funktioner
- [ ] Login fungerar
- [ ] Coach flow fungerar
- [ ] Client flow fungerar
- [ ] API routes fungerar
- [ ] Notifications fungerar (om implementerat)

### Monitoring
- [ ] Sätt upp Vercel Analytics (valfritt)
- [ ] Sätt upp error tracking (valfritt, t.ex. Sentry)
- [ ] Övervaka Supabase usage

---

## 🔄 Continuous Deployment

Vercel deployar automatiskt när du pushar till:
- **main/master branch** → Production
- **Andra branches** → Preview deployments

**Rekommendation:**
- Använd feature branches för development
- Merge till main när redo för production

---

## 📚 Ytterligare Resurser

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## ✅ Deployment Complete!

När alla steg är klara och appen fungerar på Vercel:

1. ✅ Uppdatera `NEXT_PUBLIC_APP_URL` med din faktiska Vercel URL
2. ✅ Testa alla kritiska flows
3. ✅ Informera teamet om production URL
4. ✅ Sätt upp monitoring och alerts

**Lycka till! 🚀**

