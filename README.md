# JOMOA

**Din strategiska träningscoach** - En digital coachingplattform för aktiva kvinnor som vill nå konkreta träningsmål.

JOMOA kombinerar strukturerad träning, menscykel och livsstilsfaktorer i ett intelligent system som hjälper användaren att **justera istället för att avbryta**.

## 🏗️ Monorepo-struktur

```
jomoa.coach/
├── jomoa-app/      # Web app (Next.js) - Admin/Dashboard
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

### jomoa-app (Web Dashboard)

Next.js web app för administration och analytics.

```bash
cd jomoa-app
npm install
npm run dev
```

**Tech Stack:**
- Next.js 14 (App Router)
- Tailwind CSS
- Supabase

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

Se `jomoa-app/docs/design-standards.md` för komplett dokumentation.

## 🗄️ Backend (Supabase)

Alla appar delar samma Supabase-backend:

- **PostgreSQL** - Databas
- **Auth** - Autentisering
- **Storage** - Filer
- **Realtime** - Live-uppdateringar

### Environment Variables

Varje app behöver:
```
NEXT_PUBLIC_SUPABASE_URL=xxx       # jomoa-app
EXPO_PUBLIC_SUPABASE_URL=xxx       # jomoa-mobile
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

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
   - Kör migrations i `jomoa-app/supabase/migrations/`
   - Kör seed data i `jomoa-app/supabase/seed.sql`

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
| `jomoa-app/docs/architecture.md` | System-arkitektur |
| `jomoa-app/docs/design-standards.md` | UI/UX-regler |
| `jomoa-app/docs/engineering-standards.md` | Kodstandard |
| `jomoa-app/docs/supabase.md` | Backend-setup |
| `jomoa-app/docs/development.md` | Utvecklingsguide |

## 📄 Licens

Privat - Alla rättigheter förbehållna
