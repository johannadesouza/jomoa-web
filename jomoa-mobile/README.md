# JOMOA Mobile App

React Native mobile app för JOMOA - din strategiska träningscoach.

## QA & Testing

- **Seed data:** `supabase/seed.sql` – exempel för cykel, readiness, pass
- **Manual QA:** Se `docs/QA_SEED_GUIDE.md` och `docs/WIRING_UX_AUDIT.md` (sektion 6)
- **Cycle data:** All cykeldata flödar via `CycleContext` – en enda källa

## Tech Stack

- **Expo** - React Native framework
- **Tamagui** - Design system & styling
- **React Navigation** - Navigation
- **Supabase** - Backend (delat med web app)
- **TypeScript** - Type safety

## Design System

Alla komponenter följer **design-standards.md** och **engineering-standards.md**.

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
├── config/               # App configuration
│   └── supabase.ts      # Supabase client
├── lib/                  # Data layer
│   ├── services/        # Supabase services
│   │   ├── programService.ts
│   │   ├── workoutService.ts
│   │   └── workoutLogService.ts
│   └── hooks/           # Data hooks
│       ├── useWorkouts.ts
│       ├── useDashboard.ts
│       ├── usePrograms.ts
│       └── useInsights.ts
├── features/             # Feature modules
│   ├── auth/            # Login, registration
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── index.ts
│   ├── dashboard/       # Main dashboard
│   │   ├── DashboardScreen.tsx
│   │   └── index.ts
│   ├── workouts/        # Training sessions
│   │   ├── WorkoutsScreen.tsx
│   │   ├── WorkoutSessionScreen.tsx
│   │   └── index.ts
│   ├── programs/        # Program selection
│   │   ├── ProgramSelectScreen.tsx
│   │   └── index.ts
│   ├── insights/        # Analytics
│   │   ├── InsightsScreen.tsx
│   │   └── index.ts
│   └── settings/        # Settings
│       ├── SettingsScreen.tsx
│       └── index.ts
├── navigation/           # Navigation setup
│   ├── RootNavigator.tsx
│   └── TabNavigator.tsx
└── shared/
    ├── context/         # React contexts
    │   ├── AuthContext.tsx
    │   └── index.ts
    ├── theme/           # Tamagui config
    │   ├── tamagui.config.ts
    │   └── index.ts
    ├── types/           # TypeScript types
    │   ├── client.ts
    │   └── onboarding.ts
    └── ui/              # Base UI components
        ├── Screen.tsx
        ├── Section.tsx
        ├── Card.tsx
        ├── AppText.tsx
        ├── AppButton.tsx
        ├── AppInput.tsx
        ├── Badge.tsx
        ├── Divider.tsx
        ├── EmptyState.tsx
        ├── ErrorState.tsx
        └── index.ts
```

## Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your Supabase credentials

# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

### Implemented

- ✅ Authentication (Login/Register)
- ✅ Onboarding (Welcome, Goals, Frequency, Training days, Complete)
- ✅ Tab Navigation (Dashboard, Workouts, Insights, Settings)
- ✅ Dashboard with program overview, weekly stats, streak
- ✅ Workouts list and Workout session logging (sparar till DB)
- ✅ Program selection (modal)
- ✅ Insights with real data (volym, pass, RPE, streak)
- ✅ Settings with logout

### Coming Soon

- 📋 Cycle tracking
- 📋 Push notifications
- 📋 Offline support

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

## License

Privat - Alla rättigheter förbehållna
