# Deploy: Expo Web demo on Vercel

Den här guiden deployar en **publik web-demo** av `jomoa-mobile` på Vercel.

Målet är en demo som:

- är klickbar i browsern
- inte kräver konto (Demo Mode)
- inte använder production-nycklar

## 1) Förbered env (Demo Mode)

På Vercel ska du sätta:

- `EXPO_PUBLIC_DEMO_MODE=true`
- `EXPO_PUBLIC_DEMO_PERSONA=strength_3x` (eller `cycle_only` / `perimenopause`)

Om demot ska kunna visa riktigt content (program, artiklar, copy) behöver du även sätta Content DB-variablerna (mot ett **demo Content DB**):

- `EXPO_PUBLIC_CONTENT_SUPABASE_URL`
- `EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY`

> Viktigt: `EXPO_PUBLIC_*` blir publikt i web-build. Använd aldrig production-projekt/nycklar i en publik demo.

## 2) Vercel project setup

Skapa ett nytt projekt i Vercel och peka det på detta repo.

### Root directory

Sätt **Root Directory** till:

- `jomoa-mobile`

### Build & Output

Expo web kan byggas på olika sätt beroende på setup. Det enklaste stabila för Vercel är att köra Expo:s web-export och servera en statisk output.

Rekommenderat:

- **Build Command**: `npm ci && npx expo export -p web`
- **Output Directory**: `dist`

Om ni byter output i Expo config, uppdatera output directory därefter.

## 3) Deploy

Deploya. När demot är live:

- testa att navigation fungerar
- testa att Demo Mode tar dig förbi login och direkt till appens tabs
- byt `EXPO_PUBLIC_DEMO_PERSONA` och verifiera att UI ändras (t.ex. `cycle_only` påverkar tabs)

## 4) Troubleshooting

### Blank page / routing issues

- Verifiera att Vercel faktiskt serverar `dist/` som statiska filer.
- Om du ser 404 på refresh kan du behöva en SPA rewrite. (Vercel hanterar ofta detta automatiskt för statiska exports, men varierar.)

### App försöker prata med User DB

I Demo Mode bypassas auth och feature flags-fetch. Om något ändå kräver User DB, hitta anropet och gör det demo-säkert (mock, fallback, eller disable).

