# E2E Verification – jomoa-mobile

Manuellt test av hela flödet för att säkerställa att produkten fungerar.

## Förutsättningar

- Supabase-migrationer är körda (se `web/supabase/migrations/` för befintliga migrations)
- `EXPO_PUBLIC_SUPABASE_URL` och `EXPO_PUBLIC_SUPABASE_ANON_KEY` sätts i miljön
- Appen startar med `npx expo start`

---

## 1. Registrering

1. Starta appen
2. Tryck på "Skapa konto" / Register
3. Fyll i: e-post, lösenord, namn
4. Tryck "Skapa konto"

**Förväntat:** Användare skapas, profil + client skapas via trigger, onboarding startar.

---

## 2. Onboarding

1. Välj mål (Goals)
2. Välj frekvens (Frequency)
3. Välj träningsdagar (TrainingDays)
4. Välj om cykelspårning ska användas (CycleSetup)
5. Fyll i periodstart om cykel valdes
6. Tryck "Starta min resa" (Complete)

**Förväntat:** Data sparas till `clients` och `cycle_events`, `onboarding_stage = completed`, navigering till huvudflöde (Main).

---

## 3. Dashboard

1. Kontrollera att hälsning och aktivt program visas
2. Om inget program är valt: gå till Träning → Välj program

**Förväntat:** Dashboard visar hälsning, eventuell insikt/rekommendation, cykel (om aktiverad), dagens pass, veckoöversikt, statistik.

---

## 4. Starta och avsluta pass

1. Gå till Träning
2. Tryck "Starta pass" på ett planerat pass
3. Logga några set (reps, vikt, RPE)
4. Tryck "Avsluta pass" och bekräfta

**Förväntat:** Pass sparas till `workout_sessions_log` och `set_logs`, sammanfattning visas.

---

## 5. Dashboard efter genomfört pass

1. Tryck "Klar" / gå tillbaka till Hem
2. Kontrollera "Dagens pass"

**Förväntat:** Dagens pass visas med badge "Genomfört" och utan "Starta pass"-knapp.

---

## 6. Readiness

1. Gå till Inställningar → "Hur mår du idag?"
2. Fyll i sömn, stress, energi, ömhet
3. Tryck Spara

**Förväntat:** Data sparas till `daily_readiness`, readiness visas på Dashboard (om tabellen finns).

---

## 7. Mina program

1. Gå till Inställningar → "Mina program"
2. Verifiera lista med tillgängliga program
3. Välj ett annat program (om flera finns) och tryck "Byt till detta program"
4. Bekräfta i dialogen

**Förväntat:** Aktivt program uppdateras, Dashboard visar nya pass, navigering tillbaka till Inställningar.

---

## Checklista

- [ ] Registrering skapar profil och client
- [ ] Onboarding sparar till clients + cycle_events
- [ ] Dashboard laddar och visar data
- [ ] Pass kan startas, loggas och avslutas
- [ ] Genomfört pass syns som "Genomfört" på Dashboard
- [ ] Readiness sparas
- [ ] Program kan bytas via Mina program
- [ ] Ingen krasch vid nätverksfel (felhantering aktiverad)
