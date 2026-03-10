# JOMOA Web – landningssida och väntelista

Next.js-app för [jomoa.coach](https://jomoa.coach): landningssida (B2C/B2B), väntelista och kontakt.

**Monorepo:** Denna mapp är en del av [jomoa.coach](../) (root).

---

## Tech Stack

- **Next.js** – App Router, React
- **Content DB** (Supabase) – publikt innehåll
- **Mailchimp** (valfritt) – väntelista

## Kom igång

```bash
npm install
cp .env.example .env.local
# Fyll i NEXT_PUBLIC_CONTENT_SUPABASE_URL och NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Miljövariabler

| Variabel | Krävs | Beskrivning |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONTENT_SUPABASE_URL` | Ja | Content DB – projekt-URL |
| `NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY` | Ja | Content DB – anon-nyckel |
| `MAILCHIMP_*` | Nej | Väntelista (se `docs/ENVIRONMENT_VARIABLES.md`) |

Full lista: `.env.example`.

## Deploy (Vercel)

1. Koppla repot till Vercel.
2. Sätt samma env-variabler som i `.env.example`.
3. Deploy – Vercel använder `build` från `package.json`.
