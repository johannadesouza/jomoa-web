# JOMOA – Product overview

## Vad JOMOA är

Ett **kontinuitetsfokuserat träningssystem** – inte motivationsfluff. Strukturerade program, readiness-baserad vägledning (Push / Behåll / Justera) och små justeringar som skyddar progressionen. **Justera istället för att avbryta.**

- **Primärt budskap:** Behåll kontinuitet i träningen via plan, readiness och automatiska justeringar.
- **Sekundärt:** Biologi (cykel, perimenopaus, utebliven mens, preventivmedel) är en **valfri modul** för den som vill ha det.
- **Målgrupp:** Alla som vill ha seriös struktur – kvinnor och män. Cykelspårning kan stängas av helt.
- **Huvudprodukt:** jomoa-mobile (React Native/Expo).
- **Erbjudanden:** B2C (privatpersoner: månad/kvartal/halvår/år) och B2B (företag: årlig platsbaserad licens, anställda får premiumåtkomst).

## Extern yta (landing / info)

Landing/waitlist ingår inte längre i detta repo. Denna fil fokuserar på produkt- och appflöden i `jomoa-mobile`.

## Core flows (app)

1. **Onboarding:** PathChoice → Mål → Frekvens → Träningsdagar → Kön/Tema (presentation_profile, presentation_theme) → CycleSetup (om cykel ska användas) → Complete.
2. **Hem (Dashboard):** Hälsning, check-in, dagens pass, cykelkort (om aktiverat), quick actions (Logga energi, Logga symptom, Vilotimer, Kalender).
3. **Träna:** Programval, dagens pass, WorkoutSession med loggning (set, vikt, RPE).
4. **Insikter (Journey):** Volym, pass, streak, cykelkort (om cykel), symptomrelief, logga-segment.
5. **Cykel (om aktiverat):** Periodlogg, symptom, fas; inställningar för cycle mode (regular / missing_period / perimenopause). OverdueBanner vid försenad period.
6. **Readiness:** Daglig check-in; perimenopaus-symptom (valfritt).
7. **Lär dig:** Artiklar och fasvis kunskap.
8. **Inställningar:** Profil, Mina program, Menscykel (cycle mode), tema, notifikationer (kommer snart).

## Viktiga begrepp

- **presentation_profile / presentation_theme:** Onboarding-val för anpassat innehåll och ton.
- **Cycle mode:** Hur cykeln hanteras – regelbunden, utebliven mens, eller perimenopaus. Valbart.
- **Adaptation engine:** Ger träningsjusteringar (volym, deload, recovery) utifrån fas, readiness och last.
- **Readiness:** Daglig check-in (sömn, energi, stress, ömhet); grund för beslut Push / Behåll / Justera.

## Ingen marknadsföringstext

Detta dokument är teknisk produktöversikt; för copy och varumärke använd appens och webbsidans faktiska texter.
