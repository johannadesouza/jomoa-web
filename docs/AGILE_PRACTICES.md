# Agila rutiner – JOMOA

Kort översikt över hur vi håller projektet lätt att iterera på: beslut, kvalitet, feedback och dokumentation.

## Beslutslogg och arkitektur

- **`docs/DECISIONS.md`** – Tekniska beslut (två DB:ar, cycle engine, adaptation, presentation). Uppdatera vid nya val som påverkar hela stacken.
- **`docs/ARCHITECTURE.md`** – Data layers, cycle engine, readiness, terminologi. Referens för nya utvecklare och vid refaktorering.

När du inför något nytt (t.ex. ny integration eller datamodell), dokumentera **vad** och **varför** i DECISIONS eller i en kort kommentar i koden.

## Kodkvalitet och feedback

| Vad | Var | När |
|-----|-----|-----|
| **Enhetstester** | `jomoa-mobile` – `npm run test` | Domain, adaptation, services. Kör lokalt och i CI. |
| **Lint** | `web`, `admin` – `npm run lint` | Innan commit/PR. |
| **Build** | `web` – `npm run build` | Verifierar att landningssidan bygger. |
| **Manuell E2E** | `jomoa-mobile/docs/E2E_VERIFICATION.md` | Före release / större ändringar. |

**Regel:** Ingen affärslogik i UI – domain och adaptation ska vara rena och testbara. Se `jomoa-mobile/README.md` → Code Standards.

## Backlog och planering

- **`docs/DOCS_INVENTORY_AND_PLAN.md`** – Doc-inventering, kod-vs-dokumentation, städplan.
- **`jomoa-mobile/docs/DATABASE_BACKLOG.md`** – Databas- och schema-uppgifter.
- **`docs/archive/AGILITY_AUDIT.md`** – Historisk agility-audit; många refaktorer är genomförda (se Implementation status).

Backlog kan hanteras i issues (GitHub/GitLab) eller i dessa filer – viktigt är att större uppgifter är nedbrutna och att "nästa steg" är tydliga.

## Definition of Done (för en ändring)

- [ ] Koden följer befintliga mönster (domain/repos/services, inga Supabase-anrop i UI).
- [ ] Nya beslut som påverkar arkitekturen är noterade i DECISIONS eller i kod.
- [ ] Relevanta tester körda (`jomoa-mobile`: `npm run test`); inga röda tester ignorerade utan motivering.
- [ ] Lint/build körda där det finns (web: `npm run lint` / `npm run build`).
- [ ] README/docs uppdaterade om något användar-/utvecklarflöde har ändrats.

## CI (kontinuerlig integration)

Om `.github/workflows/` används körs automatiskt:

- **jomoa-mobile:** `npm ci` + `npm run test`
- **web:** `npm ci` + `npm run build` (och eventuellt lint)

Det ger snabb feedback på varv och minskar risken att trasig kod mergas.

## Korta iterationer

- **Liten PR > stor.** Dela upp större features i logiska steg som kan mergas och deployas.
- **Testa tidigt.** Kör appen (mobile + web) lokalt och använd E2E-checklistan vid behov.
- **Uppdatera docs när något blir fel.** DOCS_INVENTORY och DECISIONS ska reflektera verkligheten.

---

Se även **CONTRIBUTING.md** (root) för PR-flöde och checklista.
