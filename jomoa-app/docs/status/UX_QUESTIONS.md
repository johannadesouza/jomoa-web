# UX/Design-frågor för att leverera högkvalitativ UI/UX

Innan jag fortsätter med implementationen enligt master_overview.md och functions.md behöver jag dina beslut på följande områden:

## 1. Grafer/Charting-bibliotek

**Kontext:** functions.md nämner många grafer (volymtrender, RPE-genomsnitt, readiness-trends, cykel-overlay, etc.)

**Fråga:** Vilket charting-bibliotek ska jag använda?
- **Alternativ A:** Recharts (React-native, bra för SVG-baserade grafer)
- **Alternativ B:** Chart.js med react-chartjs-2 (populär, många chart-typer)
- **Alternativ C:** Victory (flexibelt, bra för interaktiva grafer)
- **Alternativ D:** Bara placeholders nu, välj bibliotek senare

**Rekommendation:** Recharts (enkel, bra dokumentation, passar React)

---

## 2. Cycle-aware färgkodning

**Kontext:** master_overview.md nämner att pass/vecka ska visas med fas-färger (menstruation/follicular/ovulation/luteal).

**Frågor:**
- **Färger:** Vilka färger för vilka faser? (t.ex. menstruation = rosa, follicular = blå, ovulation = gul, luteal = lila)
- **Intensitet:** Ska färgerna vara subtila bakgrunder (t.ex. `bg-pink-50`) eller mer framträdande?
- **Placering:** Ska färgerna visas som:
  - Bakgrund på pass-cards?
  - Färgad border?
  - Liten färgad indikator/dot?
  - Färgkodad kalender-view?

**Rekommendation:** Subtila bakgrunder (t.ex. `bg-pink-50`, `bg-blue-50`, etc.) + liten färgad dot som indikator

---

## 3. Wizard/Stepper för Program-skapande

**Kontext:** functions.md beskriver Program → Block → Vecka → Pass → Övning-struktur

**Fråga:** Hur ska wizard/stepper för "Skapa program" se ut?
- **Alternativ A:** Stepper-komponent (1. Block → 2. Veckor → 3. Pass → 4. Övningar) med progress-bar
- **Alternativ B:** Sekvens av cards (ett card i taget, "Nästa"-knapp)
- **Alternativ C:** Allt på en sida med accordions/collapsible sections
- **Alternativ D:** Tabs (Block-tab, Veckor-tab, Pass-tab, Övningar-tab)

**Rekommendation:** Alternativ A (Stepper) för bättre UX på stora formulär

---

## 4. Notifications-system

**Kontext:** master_overview.md nämner "Notiscenter: Här är vad som hänt denna vecka" och olika notiser

**Fråga:** Ska jag bygga ett fullt notis-system nu eller placeholders?
- **Alternativ A:** Full implementation (notis-tabell i DB, notification component, markera som läst/oläst)
- **Alternativ B:** Placeholders (visa exempel-notiser i UI, koppla till DB senare)
- **Alternativ C:** Bara visa antal notiser i topbar, full implementation senare

**Rekommendation:** Alternativ B (placeholders för nu, full implementation kan prioriteras senare)

---

## 5. Kalender-vy

**Kontext:** functions.md nämner "Kalender" för både coach och client (vecka/månad med planerade pass, cykel-färger)

**Fråga:** Vilken kalender-komponent ska jag använda?
- **Alternativ A:** react-big-calendar (populär, mycket funktionalitet)
- **Alternativ B:** @fullcalendar/react (flexibel, bra dokumentation)
- **Alternativ C:** Custom kalender-komponent (byggd från scratch)
- **Alternativ D:** Bara lista/veckovy för nu, kalender senare

**Rekommendation:** Alternativ D för nu (lista/veckovy är enklare), kalender kan läggas till senare

---

## 6. Tips-bibliotek visning

**Kontext:** functions.md nämner "Dagens tips" baserat på cykelfas och regelbaserade rekommendationer

**Fråga:** Hur ska tips visas?
- **Alternativ A:** Card på dashboard med expand/collapse
- **Alternativ B:** Modal/drawer när man klickar på "Se tips"
- **Alternativ C:** Sidebar-panel (på desktop)
- **Alternativ D:** En dedikerad "Tips"-sida

**Rekommendation:** Alternativ A (card på dashboard) + Alternativ D (dedikerad sida för att se alla tips)

---

## 7. Performance-tester & Kroppsmått

**Kontext:** functions.md nämner "Performance-tester" (1RM, kondition) och "Kroppsmått" (vikt, midja, höft, lår)

**Fråga:** Var ska dessa visas?
- **Alternativ A:** Egen "Mätningar"-sida/tab
- **Alternativ B:** I "Insikter"-sidan
- **Alternativ C:** I klientprofil (coach-vy)
- **Alternativ D:** Placeholder för nu, implementera senare

**Rekommendation:** Alternativ A (egen "Mätningar"-tab i klientprofil för coach, egen sida för client)

---

## 8. Journal & Coach-noter

**Kontext:** functions.md nämner att klient kan skriva "dagboksinlägg" och coach kan skriva "interna anteckningar"

**Fråga:** Hur ska dessa visas?
- **Alternativ A:** Egen "Journal"-tab/sida
- **Alternativ B:** I klientprofil som cards
- **Alternativ C:** Timeline/feed-liknande vy
- **Alternativ D:** Placeholder för nu, implementera senare

**Rekommendation:** Alternativ B (cards i klientprofil) för coach-noter, Alternativ A (egen sida) för client-journal

---

## 9. Meddelanden/kommunikation

**Kontext:** functions.md nämner "Inbyggt meddelandeflöde coach ↔ klient"

**Fråga:** Ska jag bygga meddelandefunktionalitet nu eller placeholders?
- **Alternativ A:** Full implementation (meddelandetabell, chat-liknande interface)
- **Alternativ B:** Placeholders (visa "Meddelanden kommer snart")
- **Alternativ C:** Bara visa "Kontakta coach"-länk som öppnar email

**Rekommendation:** Alternativ B (placeholders för nu, kan prioriteras senare)

---

## 10. Readiness-logging UX

**Kontext:** functions.md nämner daglig readiness (sömn, energi, stress, muskelömhet, 0-10 scale)

**Fråga:** Hur ska readiness-logging UX se ut?
- **Alternativ A:** Snabb widget på dashboard (klicka → modal med slider)
- **Alternativ B:** Egen "Readiness"-sida med formulär
- **Alternativ C:** Bottom sheet/drawer på mobile, modal på desktop
- **Alternativ D:** Befintlig implementation är OK, bara förbättra styling

**Rekommendation:** Alternativ C (bottom sheet/drawer) för bästa mobile-upplevelse

---

## Sammanfattning av mina rekommendationer

1. **Grafer:** Recharts (eller placeholders för nu)
2. **Cycle-färger:** Subtila bakgrunder + färgad dot
3. **Wizard:** Stepper-komponent med progress-bar
4. **Notifications:** Placeholders för nu
5. **Kalender:** Lista/veckovy för nu, kalender senare
6. **Tips:** Card på dashboard + dedikerad sida
7. **Mätningar:** Egen tab/sida
8. **Journal:** Cards i klientprofil (coach) + egen sida (client)
9. **Meddelanden:** Placeholders för nu
10. **Readiness:** Bottom sheet/drawer för mobile

**Vill du följa dessa rekommendationer eller har du andra preferenser?**

