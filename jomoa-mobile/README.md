# JOMOA Mobile App

React Native-app (Expo) för JOMOA – huvudprodukten i monorepon. Träningsprogram, readiness, cykel och insikter.

**Monorepo:** Denna mapp är en del av [jomoa.coach](../) (root). Backend: User DB + Content DB (Supabase).

---

## QA & Testing

- **Seed data:** `supabase/seed.sql` – exempel för cykel, readiness, pass
- **Manual QA:** Se `docs/QA_SEED_GUIDE.md` och `docs/E2E_VERIFICATION.md`
- **Cycle data:** All cykeldata flödar via `CycleContext` – en enda källa

## Tech Stack

- **Expo** – React Native
- **Tamagui** – Design system och styling
- **React Navigation** – Navigation
- **Supabase** – User DB (persondata, auth, träning, cykel) + Content DB (program, övningar, app_copy, artiklar). Se `.env.example`.
- **TypeScript** – Typning

## Design System

Alla komponenter följer theme tokens och delade UI-principer (se nedan).

### Principer

- ✅ Inga hårdkodade värden
- ✅ Använd theme tokens
- ✅ Konsekvent spacing/typography/colors
- ✅ Tillgänglighet (44px tap targets, AA contrast)

### Tre-nivå-hierarki

| Nivå | Komponent | Användning |
|------|-----------|------------|
| 1. Layout | `Screen` | Screen wrapper med safe areas |
| 2. Layout | `Section` | Grupperar relaterat innehåll |
| 3. Content | `Card` | Innehållscontainer |

### UI Components

| Komponent | Fil | Användning |
|-----------|-----|------------|
| `Screen` | `shared/ui/Screen.tsx` | Screen wrapper |
| `Section` | `shared/ui/Section.tsx` | Layout sections |
| `Card` | `shared/ui/Card.tsx` | Content container |
| `AppText` | `shared/ui/AppText.tsx` | Typography |
| `AppButton` | `shared/ui/AppButton.tsx` | Buttons |
| `AppInput` | `shared/ui/AppInput.tsx` | Text inputs |
| `Badge` | `shared/ui/Badge.tsx` | Labels/tags |
| `Divider` | `shared/ui/Divider.tsx` | Visual separator |
| `EmptyState` | `shared/ui/EmptyState.tsx` | Empty content |
| `ErrorState` | `shared/ui/ErrorState.tsx` | Error handling |

### Design Tokens

#### Colors

```ts
// Surfaces
deepPlumBlack: "#141012"  // $background (page)
warmCharcoal: "#1E1A1C"   // $card (containers)
surface3: "#2A2426"       // $backgroundStrong (inputs)

// Text
softLight: "#EDE8E6"      // $color (primary)
mutedWarm: "#8A7F7A"      // $colorSecondary

// Accent
warmTerracotta: "#D96D46" // $accent
accentHover: "#E57D56"    // $accentHover
accentPressed: "#C45D36"  // $accentPress

// Semantic
success: "#4CAF50"
warning: "#FF9800"
error: "#F44336"
info: "#2196F3"
```

#### Spacing Scale

```ts
$1 = 4px    $5 = 20px   $9 = 36px
$2 = 8px    $6 = 24px   $10 = 40px
$3 = 12px   $7 = 28px   $11 = 44px
$4 = 16px   $8 = 32px   $12 = 48px
```

#### Typography

| Variant | Size | Token |
|---------|------|-------|
| H1 | 36px | `$8` |
| H2 | 20px | `$4` |
| H3 | 16px | `$3` |
| Body | 16px | `$3` |
| Small | 14px | `$2` |
| Caption | 12px | `$1` |

#### Radius

| Name | Size | Token |
|------|------|-------|
| Small | 4px | `$1` |
| Medium | 8px | `$2` |
| Card | 12px | `$3` |
| Button | 16px | `$4` |
| Full | 9999px | `$full` |

## Projektstruktur

```
src/
├── config/               # Supabase clients (user + content)
├── lib/
│   ├── adaptation/      # Adaptation engine (cycle phase, readiness, perimenopause rules)
│   ├── domain/          # Pure domain (program, workout, readinessScore, insightKeys)
│   ├── repos/           # userRepo (assignments, workoutLog, cycle), contentRepo (programs, articles, …)
│   ├── services/        # Business logic (cycleEngineService, insightService, readinessService, …)
│   ├── hooks/           # useDashboard, useCycle, useTrainingAdaptation, useInsights, …
│   ├── utils/           # cycleEngine, cycleUtils, date
│   └── supabase/        # userClient, contentClient
├── features/
│   ├── auth/            # Login, Register
│   ├── dashboard/       # DashboardScreen
│   ├── train/           # Train tab, WorkoutSession, ProgramSelect
│   ├── journey/         # Journey (Insikter), stats, CycleHeroCard, logga
│   ├── learn/            # Learn, ArticleDetail, PhaseDetail
│   ├── cycle/            # CycleScreen, OverdueBanner
│   ├── readiness/      # ReadinessScreen, PerimenopauseSymptomCheckin
│   ├── log/              # Measurements, AddMeasurement
│   ├── settings/        # SettingsScreen, CycleModeSettingsSection
│   └── onboarding/      # Welcome, PathChoice, Goals, Frequency, TrainingDays, CycleSetup, Complete
├── navigation/           # RootNavigator, TabNavigator
└── shared/               # context (Auth, Cycle), theme, ui (Screen, Section, Card, …)
```

## Setup

```bash
npm install
cp .env.example .env
# Fyll i User DB + Content DB (fyra variabler, se nedan)

npm start
# Tryck 'i' för iOS, 'a' för Android, 'w' för web
```

## Miljövariabler

| Variabel | Beskrivning |
|----------|-------------|
| `EXPO_PUBLIC_USER_SUPABASE_URL` | User DB – projekt-URL |
| `EXPO_PUBLIC_USER_SUPABASE_ANON_KEY` | User DB – anon-nyckel |
| `EXPO_PUBLIC_CONTENT_SUPABASE_URL` | Content DB – projekt-URL |
| `EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY` | Content DB – anon-nyckel |

Full lista och valfria variabler: `.env.example`.

## Features

- Authentication (Login/Register)
- Onboarding (PathChoice, Goals, Frequency, Training days, CycleSetup, Kön/Tema, Complete)
- Tabs: Hem (Dashboard), Träna, Insikter (Journey), Lär dig, Inställningar
- Dashboard: hälsning, check-in, dagens pass, cykelkort (om aktiverat), quick actions
- Träna: programval, dagens pass, WorkoutSession med loggning
- Insikter: volym, pass, streak, CycleHeroCard, symptomrelief, logga
- Cycle: periodlogg, symptom, fas, OverdueBanner; inställningar (cycle mode: regular / missing_period / perimenopause)
- Readiness: daglig check-in (sömn, stress, energi, ömhet); perimenopaus-symptom (valfritt)
- Lär dig: artiklar, fasvis kunskap
- Inställningar: profil, Mina program, Menscykel, tema, notifikationer (kommer snart)

## Usage Examples

### Basic Screen

```tsx
import { Screen, Section, Card, AppText, AppButton } from "@/shared/ui";
import { YStack } from "tamagui";

function MyScreen() {
  return (
    <Screen scroll padded>
      <YStack gap="$8">
        <Section title="Min sektion">
          <Card>
            <Card.Header>
              <Card.Title>Titel</Card.Title>
            </Card.Header>
            <Card.Content>
              <AppText variant="body">Innehåll</AppText>
            </Card.Content>
          </Card>
        </Section>

        <AppButton variant="primary" fullWidth onPress={() => {}}>
          Klicka här
        </AppButton>
      </YStack>
    </Screen>
  );
}
```

### Form

```tsx
import { Screen, Card, AppInput, AppButton } from "@/shared/ui";
import { YStack } from "tamagui";

function LoginScreen() {
  return (
    <Screen padded centered>
      <Card>
        <Card.Header>
          <Card.Title>Logga in</Card.Title>
        </Card.Header>
        <Card.Content>
          <YStack gap="$4">
            <AppInput
              label="Email"
              placeholder="din@email.se"
              keyboardType="email-address"
            />
            <AppInput
              label="Lösenord"
              secureTextEntry
            />
            <AppButton variant="primary" fullWidth>
              Logga in
            </AppButton>
          </YStack>
        </Card.Content>
      </Card>
    </Screen>
  );
}
```

## Code Standards

### Regler

- Inga direkta Supabase-anrop i UI
- Domain logic är ren + testad
- Ingen duplicerad logik
- Ingen `any`
- All extern data validerad
- Konstanter extraherade
- Tydlig namngivning
- Loading/error states hanterade

## Known warnings (safe to ignore)

- **Tamagui/Zeego** – “Must call import '@tamagui/native/setup-zeego'” appears because Tamagui can use native menus. This app does not use Tamagui Menu/ContextMenu. Do **not** install `zeego`: it currently conflicts with `@tamagui/native` (zeego wants `@react-native-menu/menu@1.x`, Tamagui wants `>=2.0.0`). Ignore the warning.
- **expo-notifications in Expo Go** – Full notification support requires a development build; the warning in Expo Go is expected.

## License

Privat - Alla rättigheter förbehållna
