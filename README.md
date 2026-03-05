# JOMOA

**Kontinuitetsfokuserad träning för alla** – Plan + readiness + små justeringar som skyddar progressionen.

JOMOA är ett träningssystem (inte en mensapp): strukturerade program, readiness-baserad vägledning (Push / Behåll / Justera) och valfri biologi-modul (cykel, perimenopaus m.m.). För privatpersoner (B2C) och företag (B2B). **Justera istället för att avbryta.**

## Monorepo-struktur

```
jomoa.coach/
├── jomoa-mobile/   # Mobile app (React Native/Expo) – huvudprodukt
├── web/            # Landing page & waitlist
├── docs/           # Arkitektur, produkt, beslut, arkiv
└── supabase/       # User DB + Content DB migrations
```

## Appar

### jomoa-mobile (Huvudprodukt)

React Native app byggd med Expo och Tamagui.

```bash
cd jomoa-mobile
npm install
npm start
```

**Tech Stack:**
- Expo (React Native)
- Tamagui (Design System)
- React Navigation
- Supabase (Backend)

**Se `jomoa-mobile/README.md` för fullständig dokumentation.**

### web (Landing)

Landningssida med segment För privatpersoner (B2C) och För företag (B2B); väntelista, demo/kontakt.

```bash
cd web
npm install
npm run dev
```

## Design system

Alla appar följer JOMOA Design Standards:

| Token | Värde |
|-------|-------|
| **Background** | Deep Plum Black `#141012` |
| **Cards** | Warm Charcoal `#1E1A1C` |
| **Accent** | Warm Terracotta `#D96D46` |
| **Text** | Soft Light `#EDE8E6` |
| **Muted** | Muted Warm `#8A7F7A` |

Se `jomoa-mobile/README.md` för design tokens och komponenter.

## 🗄️ Backend (Supabase)

Alla appar delar samma Supabase-backend:

- **PostgreSQL** - Databas
- **Auth** - Autentisering
- **Storage** - Filer
- **Realtime** - Live-uppdateringar

### Environment Variables

| App | Variabler |
|-----|-----------|
| jomoa-mobile | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| web | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

## Moduler

| Modul | Beskrivning |
|-------|-------------|
| **Training** | Strukturerade program, loggning, progression |
| **Cycle** | Cykelspårning (valfritt), fasdetektering, cycle engine (cycles, user_cycle_settings) |
| **Readiness** | Daglig check-in (energi, sömn, stress) |
| **Adjustment Engine** | Intelligent träningsjustering |
| **Insights** | Progress-grafer, mönsteranalys |
| **Education** | Tips kopplade till användardata |

## Kom igång

1. **Klona repot**
   ```bash
   git clone <repository-url>
   cd jomoa.coach
   ```

2. **Sätt upp Supabase**
   - User DB: migrations i `jomoa-mobile/supabase/migrations/` och `supabase/user/migrations/`
   - Content DB: migrations i `supabase/content/migrations/`
   - Web/waitlist: egna tabeller enligt web-projektet

3. **Starta mobilappen**
   ```bash
   cd jomoa-mobile
   npm install
   npm start
   # Tryck 'i' för iOS simulator
   ```

## Dokumentation

| Fil | Beskrivning |
|-----|-------------|
| `jomoa-mobile/README.md` | Mobile app, design system, setup |
| `docs/ARCHITECTURE.md` | Systemarkitektur, dataflöden |
| `docs/PRODUCT_OVERVIEW.md` | Produkt, användarflöden |
| `docs/DECISIONS.md` | Viktiga tekniska beslut |
| `jomoa-mobile/docs/E2E_VERIFICATION.md` | Manuell E2E-testchecklista |

## 📄 Licens

Privat - Alla rättigheter förbehållna
