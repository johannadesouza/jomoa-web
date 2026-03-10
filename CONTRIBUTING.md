# Bidra till JOMOA

Tack för att du vill bidra. Här är några riktlinjer så att ändringar blir enkla att granska och merga.

## Innan du skickar en PR

1. **Kör tester (jomoa-mobile)**  
   ```bash
   cd jomoa-mobile && npm run test
   ```
2. **Kör build (web)**  
   ```bash
   cd web && npm run build
   ```
3. **Lint**  
   Kör `npm run lint` i de projekt där det finns (t.ex. web, admin).

Om något faller, åtgärda det eller beskriv i PR:en varför det är acceptabelt (t.ex. temporär skip).

## PR:en

- Beskriv **vad** som ändras och **varför**.
- Om du inför ny arkitektur eller nya beslut, uppdatera **`docs/DECISIONS.md`** eller lägg en kommentar i koden.
- Använd gärna PR-mallen (checklistan) som visas när du öppnar en ny pull request.

## Kod och arkitektur

- **Domain och affärslogik** ska vara ren och testbar; ingen Supabase eller UI i domain/adaptation.
- **Inga direkta Supabase-anrop i UI** – använd repos och services.
- Nya features: följ befintlig struktur (repos, services, hooks, features). Se `jomoa-mobile/README.md` och `docs/ARCHITECTURE.md`.

## Mer om process

- **Agila rutiner:** `docs/AGILE_PRACTICES.md` – Definition of Done, CI, backlog, beslutslogg.
- **Dokumentation:** `docs/DOCS_INVENTORY_AND_PLAN.md` – vilka docs som finns och när de uppdateras.
