# JOMOA

**Kontinuitetsfokuserad träning** – plan, readiness och små justeringar som skyddar progressionen.

Det här repot är ett **engineer-first** projekt som fokuserar på **`jomoa-mobile`** (Expo/React Native) och dess backend-modell (Supabase User DB + Content DB).

---

## Repo-struktur

```
jomoa.coach/
├── jomoa-mobile/   # Mobile app (React Native/Expo) – huvudprodukt
├── docs/           # Arkitektur, produkt, beslut, arkiv
└── supabase/       # User DB + Content DB migrations
```

## Quickstart (lokalt)

```bash
cd jomoa-mobile
npm install
cp .env.example .env
npm start
```

Öppna via Expo:
- iOS: tryck `i`
- Android: tryck `a`
- Web: tryck `w` (eller `npm run web`)

Mer detaljer: `jomoa-mobile/README.md`.

## Portfolio demo (Expo Web, publik)

- **Demo mode (no-login):** `jomoa-mobile/docs/DEMO_MODE.md`
- **Deploy till Vercel:** `jomoa-mobile/docs/VERCEL_WEB_DEMO.md`

## Arkitektur och data

- **Arkitektur (lager, engines):** `docs/ARCHITECTURE.md`
- **Dataflöden (source of truth):** `jomoa-mobile/docs/DATA_FLOW.md`
- **Schema-referens:** `jomoa-mobile/docs/SCHEMA_REFERENCE.md`

## Backend (Supabase)

Två Supabase-projekt används (se `docs/DECISIONS.md`):

- **User DB** – persondata, auth, clients, readiness, workouts, cycle engine. Migrations: `jomoa-mobile/supabase/migrations/`, `supabase/user/migrations/`.
- **Content DB** – publikt innehåll (program, övningar, app_copy, artiklar). Migrations: `supabase/content/migrations/`.

### Miljövariabler

| App | Variabler |
|-----|-----------|
| jomoa-mobile | `EXPO_PUBLIC_USER_SUPABASE_URL`, `EXPO_PUBLIC_USER_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_CONTENT_SUPABASE_URL`, `EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY` |

## Dokumentation

- **Bidra:** `CONTRIBUTING.md`
- **Agilt/DoD:** `docs/AGILE_PRACTICES.md`
- **Produktöversikt (teknisk):** `docs/PRODUCT_OVERVIEW.md`
- **Beslut:** `docs/DECISIONS.md`
- **E2E-checklista:** `jomoa-mobile/docs/E2E_VERIFICATION.md`

---

## Licens

Privat - Alla rättigheter förbehållna
