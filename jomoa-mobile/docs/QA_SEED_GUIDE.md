# QA & Seed Data Guide

## Testkonto

För manuell QA, skapa ett testkonto via Supabase Auth eller appens registrering:

- **Email:** `qa@jomoa.test` (eller egen)
- **Lösenord:** Spara i .env.local (ej i repo)

## Seed-scenarier

Seed-filen `supabase/seed.sql` innehåller exempeldata för:

1. **Normal cykel** – 28 dagar, regelbunden mens
2. **Oregelbunden cykel** – `clients.irregular_cycle = true`
3. **Utebliven mens** – `clients.no_period = true`
4. **Peri-menopaus** – `clients.peri_menopause = true`
5. **Tung vecka** – loggade pass + låg readiness

### Köra seeds

```bash
# I jomoa-mobile/
cd supabase
supabase db reset   # Återställ DB + kör migrations + seed (om seed.sql finns)
# Eller:
psql $DATABASE_URL -f seed.sql
```

### Seed-struktur (referens)

- `cycle_events` – period_start för valda datum
- `clients` – cycle_length, irregular_cycle, no_period, peri_menopause
- `workout_sessions_log` – loggade pass med set_logs
- `readiness_check_ins` – energi, sömn, stress
- Program, sessions, övningar – via befintlig schema

## QA-flows (manual checklista)

Se `docs/WIRING_UX_AUDIT.md` sektion 6.

## QA Mode (framtida)

En `QA_MODE` env-flagga kan:

- Hoppa över onboarding
- Välja scenario (normal/oregelbunden/etc.)
- Snabbt byta testanvändare

Implementeras när behov finns.
