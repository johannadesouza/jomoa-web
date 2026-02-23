# JOMOA

**Din strategiska träningscoach** - En digital coachingplattform för aktiva kvinnor som vill nå konkreta träningsmål.

JOMOA kombinerar strukturerad träning, menscykel och livsstilsfaktorer i ett intelligent system som hjälper användaren att **justera istället för att avbryta**.

## 🏗️ Monorepo-struktur

```
jomoa.coach/
├── jomoa-mobile/   # Mobile app (React Native/Expo) - Huvudprodukt
├── web/            # Landing page & marketing site
└── README.md       # Du är här
```

## 📱 Appar

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

### web (Landing Page)

Marketing och waitlist-sida.

```bash
cd web
npm install
npm run dev
```

## 🎨 Design System

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

## 🧩 Moduler

| Modul | Beskrivning |
|-------|-------------|
| **Training** | Strukturerade program, loggning, progression |
| **Cycle** | Menslogg, fasdetektering, fas-overlay |
| **Readiness** | Daglig check-in (energi, sömn, stress) |
| **Adjustment Engine** | Intelligent träningsjustering |
| **Insights** | Progress-grafer, mönsteranalys |
| **Education** | Tips kopplade till användardata |

## 🚀 Kom igång

1. **Klona repot**
   ```bash
   git clone <repository-url>
   cd jomoa.coach
   ```

2. **Sätt upp Supabase**
   - Skapa ett Supabase-projekt
   - Kör migrations i `web/supabase/migrations/` (landing/waitlist)
   - Lägg till schema för jomoa-mobile enligt projektets dokumentation

3. **Starta mobilappen**
   ```bash
   cd jomoa-mobile
   npm install
   npm start
   # Tryck 'i' för iOS simulator
   ```

## 📚 Dokumentation

| Fil | Beskrivning |
|-----|-------------|
| `jomoa-mobile/README.md` | Mobile app, design system, setup |
| `jomoa-mobile/docs/E2E_VERIFICATION.md` | Manuell E2E-testchecklista |
| `BRANDING_GUIDE_V1.md` | Varumärke, färger, typografi |

## 📄 Licens

Privat - Alla rättigheter förbehållna
