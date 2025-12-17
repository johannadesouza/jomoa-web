■■ THE COMPLETE JOMOA APP – MASTER OVERVIEW (Helhetsbild över den färdiga produkten – web/iOS/Android)

JOMOA består av två upplevelser:

Coach-plattform (web + mobil)

Klient-app (mobil + light web)

Och fyra huvudpelare:

Träningsprogrammering Loggning + beteendedata

Fysiologi & cykelintelligens Coach-insikter & anpassningar

Allt detta ingår i den fullständiga appen:

■ Träningsprogrammering (Coach-first)
1.1 Programbyggare (block → veckor → pass) - Skapa block/mesocyklers längd (3–8 veckor) - Veckostruktur (t.ex. 3 pass/vecka) - Passnamn, fokus, intensitet - Övningar: sets, reps, tempo, RPE, viktmål - Mallar (låsta eller egna) - Importera / duplicera tidigare block

1.2 Progressionslogik - Lineär progression - Stegvis progression - Vågform (periodisering) - Deload-veckor - “Auto-adjust”: sänk/höj volym när klienten visar tydlig trend (senare fas)

1.3 Publicering & versioner - Program som “utkast”, “aktiv”, “arkiverad” - Versionshantering: Coach kan uppdatera block under pågående period

■ Loggning & Utveckling (Klient-first)
2.1 Passlogg Klienten loggar:

sets
reps
vikt
RPE
kommentar
Passet blir sedan: - “Genomfört” - “Delvis” - “Ej genomfört”

2.2 Grafer & trender (Coach)

Träningsfrekvens vecka/månad
Volymtrender (sets/reps/tonnage)
RPE-genomsnitt
Perioder med hopp i belastning
Följsamhet per block
2.3 Weekly Review Klienten får:

automatisk veckoreflektionsskärm (enkla frågor)
summering → coach notis
■ Psykologiska Markörer & Beteendedata
3.1 Dagliga markörer Klient loggar:

Energi (1–5)
Humör (1–5)
Stress (1–5)
Sömnkvalitet (1–5)
Smärta/spänningar (enkelt val)
Tidsåtgång: 10–20 sek.

3.2 Veckoliggande heatmap Coach ser:

energi/humör/sömn över tid
koppling till träningsvolym 
automatiska flaggor ex)
“3 dagar i rad med låg energi + hög RPE”
“Sömnkrasch + sämre prestation”
■ Cykelmodul (valbar per klient)
4.1 Klientfunktioner

Logga mensstart
Automatiska faser (validerade modeller)
Micro-hints:
“Låg energi vanligt i denna fas”
“Stryk 1 set om du känner låg ork”
4.2 Coachfunktioner

Cykel overlay på volym/RPE/energi
Fasharmoniserade graftrender
Insights för justering ex:
“Klient dippar konsekvent 2–3 dagar innan mens”
“Starkaste prestationer i sena follikulärperioden”
■■ Kost & Energi 5.1 Receptmodul 
Snabba recept (5–20 min) 
Filtrering: pre-träning, post-träning, låg energi, proteinfokus 
Portionsguidning (handmodellen, JOMOA-style)
5.2 Energi-check Klienten markerar:

“Låg energi idag”
“Ok energi”
“Hög energi”
Systemet kan visa:

snabb pre-träningssnacksidé
när det är smart att sänka intensitet 
5.3 Coachens view

Veckosammanfattning av:

matlogg (om du vill implementera minimal logg)
energi vs träning
återhämtningsstatus 
■ Coach-plattform (premiumupplevelse) 
(Primärt webb, men fungerar i mobilen också)

6.1 Klienthantering

Lägg till klient
Skicka inbjudan
Aktiv / paus / avslutad klient
Notiscenter: “Här är vad som hänt denna vecka”
6.2 Coach Dashboard Dagens viktigaste datapunkter:

Vem som dippar energi
Vem som missar pass
Vem som presterar starkt
Automatiska “adjustment prompts”
6.3 Insights (AI-assisterat, om du vill)

Risk för överbelastning
Rekommenderad deload
Hormonrelaterade variationer (fysiologisk, icke-medicinsk)
Anpassningsförslag ex:
“Sänk volym 10% denna vecka”
“Höj RPE-target i pass C” 
■ Klientappen (mobil-first)
7.1 Hemskärm

Dagens pass
Energi/humör-logg
Notis: “Coach har uppdaterat blocket”
Snabb access till schema
7.2 Passvy

Tydlig lista med:
övningar
sets/reps/vikt
visuella instruktioner (ev. video)
Logga varje set 7.3 Veckovy
Översikt över träningen
Micro-education: “Denna vecka jobbar vi på …”
7.4 Cykelvy (valbar)

Din fas
Veckans micro-hints 
■ Notiser & Kommunikation 
8.1 Smart Coach Notifications

“Klient X har haft 3 lågenergidagar”
“Klient Y avviker 30% från plan”
“Klient Z har inte tränat på 4 dagar”
8.2 Klientnotiser

“Dagens pass klart”
“Ny träningsvecka upplåst”
“Coach har gjort en anpassning”
“Påminnelse: logga energi” 
■ Fysiologi + beteende + life-patterns (avancerad fas)
När datamängden växer:

9.1 Habit-pattern recognition

sömn-humör-koppling
energi-träningskorrelation
cykelbeteenden
motivationstriggers
9.2 Coachens

AI-insikter (låg nivå, icke medicinskt)

“Den här klienten trivs bäst med 3 pass/vecka”
“De bästa prestationerna sker torsdagar”
“Optimalt blockformat verkar vara 5 veckor”
■ Webbläge (utan app) Webben ska kunna användas av:
Klient

Se schema
Logga pass
Logga markörer
Se sin historik
Coach

Full dashboard
Programbyggare
Insights (Det är samma kodbas – bara desktop-optimerad layout.) 
■■ Backend & obrutna system Supabase:
Auth (coach/klient)
Databas
Edge Functions:

insikter
triggers
auto-analyser 
Analytics:

event tracking (träningsfrekvens, dippmönster)
Backup & exportfunktioner

■ Säkerhet & integritet
All data krypterad
Klienten äger sin egen markördata
Coach får se endast det klienten delar 
■ Planerade moduler som kommer längre fram 
Gruppcoaching 
Community/kommentarer 
Coach-content bibliotek 
Marketplace (program att köpa) 
Wearable-integration (Apple Health, Oura) 
■ Sammanfattning: hela JOMOA-appen består av…

För coach: - Programbyggare - Klienthantering - Dashboard - Insights - Tydliga trender - Anpassningsverktyg För klient: - Pass - Loggning - Markörer - Cykelstöd - Energi & kost - Veckofy För båda: - Kommunikation - Notiser - Web/mobil fl