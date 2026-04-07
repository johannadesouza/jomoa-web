# Demo Mode (Portfolio / Expo Web)

Det här läget är gjort för att du ska kunna deploya en **publik web-demo** av `jomoa-mobile` där besökare kan klicka runt utan att skapa konto.

## Vad Demo Mode gör

- Bypassar Supabase Auth i mobilappen.
- Sätter en seedad `client` direkt i `AuthContext` (onboarding är markerad som `"completed"`).
- Gör det enkelt att visa personalisering i UI genom att välja en **persona**.

## Aktivera

Sätt följande env-variabler i din deploy (eller lokalt i `.env`):

- `EXPO_PUBLIC_DEMO_MODE=true`
- `EXPO_PUBLIC_DEMO_PERSONA=strength_3x` (eller någon av nedan)

## Personas

- `strength_3x`: “full” onboarding-path, mål styrka, frekvens 3, M/W/F
- `cycle_only`: sätter `client.onboarding_path="cycle_only"` (tabs ändras)
- `perimenopause`: sätter `client.peri_menopause=true` + `irregular_cycle=true`

## Deploy (web)

Expo web kan köras lokalt via:

```bash
cd jomoa-mobile
npm install
cp .env.example .env
npm run web
```

För en publik demo rekommenderas att du deployar en web-build och länkar från portfolion.

## Säkerhet / data

- `EXPO_PUBLIC_*`-variabler blir publika i en web-build.
- Använd **separata demo-projekt** i Supabase för User/Content DB om du behöver riktiga content-data i demot.
- Lägg aldrig in production-nycklar eller production-URLs i en publik demo.

