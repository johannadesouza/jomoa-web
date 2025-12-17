JOMOA – Funktionsspecifikation
(MASTER)
JOMOA = en plattform för coacher som tränar kvinnor, där träning, kost, menscykel
och återhämtning hänger ihop.
0. Översikt & målbild
Målgrupp:
• Coacher/PTs (online eller på gym) som jobbar med kvinnor.
• Kvinnor som vill träna smart utifrån menscykel, energi, stress och mål
(viktnedgång, uppgång, performance).
Kärnprinciper:
• Kvinnan i centrum: plattformen är byggd runt kvinnlig fysiologi (menscykel,
hormoner, energi, readiness).
• Cykel, energi och stress ska påverka:
o träningsplaneringen
o kost/energi
o feedback/tips
• Coachen ska få:
o struktur (program, kost, kalender)
o insikter (mönster över cykler)
o verktyg för att coacha tryggt och evidensnära.
1. Roller & identitet
1.1 Roller
• Coach
o Skapar och hanterar klienter.
o Bygger träningsprogram.
o Planerar kost och energi.
o Följer menscykel, readiness, mätningar.
o Kommunicerar med klienter.
• Klient
o Följer plan.
o Loggar mens, symptom, träning, energi m.m.
o Ser dagens pass, dagens energi/kost-mål och tips.
• Admin
o Hanterar planer/abonnemang.
o Har övergripande åtkomst (kan vara du själv i början).
2. Core & identitet (systemets grund)
2.1 Profiler (users)
Varje inloggningsbar användare har en profil med:
• Namn.
• Roll (coach / klient / admin).
• Språk (sv/eng – kan vara enkelt i början).
• Onboarding-status (inte påbörjad / påbörjad / klar).
Funktioner:
• Skapa coach-användare.
• Skapa klient som:
o antingen får eget login
o eller bara finns som “intern” klient utan eget konto (coach loggar åt
henne).
• Ändra roll (t.ex. göra någon till coach).
2.2 Organisationer (gym / verksamheter)
• En coach kan skapa en organisation (t ex “Jomoa Coaching”, “Gymmet AB”).
• Organisationen kan ha:
o flera coacher
o många klienter
• Organisationen ägs av en owner-coach.
Funktioner:
• Skapa organisation.
• Lägga till coacher i organisationen.
• Koppla klienter till organisationen.
2.3 Planer & abonnemang (Lite / Pro / Elite)
Detta är mer v1.0 än MVP, men behöver finnas i planen:
• Definiera planer:
o t.ex. Lite, Pro, Elite
• Per plan:
o max antal klienter
o vilka funktioner som är aktiva (t.ex. avancerad statistik, gruppcoaching,
webshop i framtiden).
• Koppla plan till coach / org.
• Senare: Stripe-betalning & uppsägning.
2.4 Inställningar & notiser
• För profil (coach/klient):
o Språk.
o Notisinställningar (nytt meddelande, ny check-in, ändrad plan).
• För klient (specifikt):
o Tidszon.
o Enheter (kg/cm vs lbs/inch).
o Visa/dölj exakta kalorier (t.ex. bara visa “låg/medel/hög energi”).
o Visa/dölj vikt i appen (viktigt vid ätstörningshistorik).
o Föredraget sätt att kontaktas (in-app/mail).
2.5 Onboardingstöd & invites
• Invites:
o Coach kan bjuda in klient via mail-länk.
o Länken kopplar klient till rätt coach/organisation.
• Onboarding-uppgifter (intern logik):
o För coach:
▪ “Skapa din första klient”
▪ “Skapa ditt första träningsprogram”
▪ “Skapa din första nutritionplan”
o För klient:
▪ “Fyll i mål”
▪ “Fyll i träningsvana”
▪ “Logga din senaste mens”
• Systemet kan bocka av dessa (checklista i UI senare).
3. Klienthantering
3.1 Klientprofil
För varje klient vill vi kunna lagra:
• Grundinfo:
o namn (eller alias)
o födelsedatum (om det behövs)
o kön (default: kvinna)
• Status:
o aktiv / pausad / arkiverad.
• Ansvarig coach (primary coach).
• Tillhörande organisation.
• Fritext-noteringar (kort “om klienten”).
Funktioner:
• Skapa klient.
• Byta ansvarig coach.
• Pausa/arkivera klient.
3.2 Klientinställningar
Specifika inställningar per klient:
• tidszon
• visa/dölj kalorier
• visa/dölj vikt i app
• kommunikationspreferens.
3.3 Taggar & segmentering
• Coachen kan skapa taggar, t.ex:
o “Klimakteriet”
o “PCOS”
o “Postpartum”
o “Fettreduktion”
o “High-stress jobb”
o “Hypotrofi”
• Taggar kan kopplas till klienter.
Funktioner:
• Skapa tagg.
• Tagga klient.
• Filtrera klientlista på taggar.
3.4 Klientgrupper
• Skapa grupper, t.ex:
o “Hyrox vårgrupp”
o “Online Bootcamp februari”
• Lägga in klienter i grupper.
• Tilldela program till hela gruppen.
3.5 Journal & coach-noter
• Klientjournal:
o Klienten kan skriva “dagboksinlägg” (hur hon mår, tankar, upplevelser).
• Coach-noter (privata):
o Coach kan skriva interna anteckningar kopplade till klienten:
▪ generella noter
▪ pass-specifika
▪ näringsrelaterade
▪ psykosociala.
4. Träningsmodul (ingen WOD, fokus styrka/kondition)
4.1 Övningsbank
• Innehåll per övning:
o namn
o kategori (t.ex. underkropp, överkropp, rörlighet)
o muskelgrupper
o utrustning (kroppsvikt, hantel, skivstång, maskin, etc.)
o beskrivning / cues
o video (minst 1)
• Global JOMOA-bank + coachens egna övningar (sparas hos specifik coach eller
org.)
4.2 Träningsplanerare – struktur
Planeraren är uppbyggd som:
Program → Block → Vecka → Pass → Övning
• Program – t.ex. “Basstyrka 8 veckor”.
• Block – t.ex. “Base”, “Build”, “Peak”.
• Vecka – v1, v2, v3 … med pass.
• Pass – t.ex. “Underkropp A”, “Överkropp B”.
• Per övning i pass:
o antal set
o reps
o tempo
o vila (sekunder)
o intensitetstyp (RPE / % av 1RM / ingen)
o intensitetsvärde (t.ex. RPE 7, 75%)
o coach-notering (t.ex. cues).
4.3 Tilldelning av program
• Tilldela program:
o till en specifik klient
o till en hel grupp
• Ange startdatum.
• Kunna avsluta/pausa program.
4.4 Loggning av träning
• Coachen lägger planerade pass.
• Klienten (eller coach) loggar:
o vilket pass som gjordes
o per set:
▪ reps
▪ vikt
▪ RPE
▪ ev. tid/distans för konditionsövningar
o övergripande:
▪ känsla före/efter
▪ noteringar.
• Passstatus: planerat / genomfört / skippat.
4.5 Female-first logik i träningsmodulen
• Pass/vecka/pass visas med fas-färg (menstruation/follicular/ovulation/luteal).
• Planeraren kan:
o visa var tung styrka hamnar i cykeln.
o ge förslag:
▪ t.ex. “du planerar tungt pass i lutealfas, vill du sänka volymen 10
%?”
▪ eller “du är i follicular – bra fas för tunga lyft”.
(MVP = enklare, regelbaserade indikatorer. v1.0 = fler regler och mer automatiskt.)
5. Kost & energy periodization
5.1 Strateginivå (mål & perioder)
• Coach sätter övergripande mål:
o viktnedgång
o viktuppgång
o recomposition
o vikthållning.
• Coach bygger perioder:
o underskott (deficit)
o underhåll (maintenance)
o överskott (surplus)
o varje period har start- och slutdatum och ev. önskad hastighet i kg/vecka.
5.2 Vecko- och dagnivå (energi)
• Veckosnitt:
o t.ex. 1 900 kcal i snitt v.1–4.
• Per dag:
o t.ex. lite högre på träningsdagar, lägre på vilodagar.
5.3 Cycle-aware calories (kopplat till menscykel)
Systemet kan föreslå:
• lite högre kcal i lutealfasen för att:
o hantera cravings bättre
o minska risk för “allt eller inget”-ätande.
• ev. mer aggressivt underskott i faser där klienten har mer energi.
Coach kan:
• godkänna
• justera
• stänga av automatiska’anpassningar.
Viktigt:
• systemet markerar normal vätskeuppgång runt luteal/menstruation så varken
coach eller klient tolkar det som “misslyckande”.
5.4 Klientens kost-vy (dagnivå)
Klient ser:
• dagens kalorimål
• ev. grov makroindelning (t.ex. “prioritera protein och grönsaker” istället för
siffror, om du vill hålla det enkelt)
• 1–3 korta meddelanden:
o t.ex. “Du är i lutealfas – planera ett rejält mellanmål i eftermiddag.”
o eller “Tung styrka idag – se till att äta ett ordentligt mål före/efter passet.”
5.5 Mat & recept (framtid/v1+)
• Livsmedelsdatabas.
• Måltidsplaner (frukost/lunch/middag).
• Receptbank.
• Tilldelning av måltider per dag.
Detta är inte kritiskt för första MVP, men ska vara med i v1.0-planen som potentiell
modul.
6. Menscykelmodul (hjärtat)
6.1 Händelser
• Klient/coach kan logga:
o mensstart
o menstruationens längd (indirekt genom flera händelser)
o ev. uppskattad eller bekräftad ovulation.
6.2 Symptom & upplevelse
Per dag kan loggas:
• smärta (t.ex. kramper)
• blödningens nivå
• energi
• humör
• cravings
• stress
• sömnkvalitet
• andra symptom (fri text).
6.3 Fasdetektering
Systemet:
• räknar ut vilken fas klienten sannolikt är i:
o menstruation
o follicular
o ovulation
o luteal
• sätter en confidence-nivå.
• tillåter coach/klient att justera fas manuellt vid behov.
MVP-versionen:
• enkel logik baserat på senaste mens + antagen cykellängd.
• möjlighet att “laga” automatiska faser med manuella justeringar.
6.4 Cykeln i hela systemet
Menscykeln syns:
• på kalendern (färgkoder per dag).
• i träningsplaneraren (pass som ligger i olika faser).
• i nutritionplanen (energi per dag överlagras med fas).
• i readinessgrafer (visa mönster per fas).
• i coachens dashboard (snabb överblick: vilka klienter är i vilken fas).
6.5 Cykel → beslut
Cykelmodulen påverkar:
• Träning:
o förslag om volym/intensitet per fas.
• Kost:
o cycle-aware calories.
• Tips:
o fas-specifika råd (träning, kost, mindset).
• Analys:
o se mönster: vilka faser klienten tränar bäst/sämst.
7. Readiness & mätningar
7.1 Daglig readiness
Klient (eller coach) kan logga:
• sömntimmar
• sömnkvalitet (0–10)
• energi (0–10)
• stress (0–10)
• muskelömhet (0–10)
• sammanvägd readiness-score (kan räknas automatiskt).
7.2 Kroppsmått & vikt
• vikt
• midja, höft, lår
• ev. kroppsfettprocent
Coach kan:
• se grafer över tid
• jämföra mot planerad viktkurva (vid viktmål).
7.3 Performance-tester
• t.ex. 1RM knäböj, marklyft, bänk.
• kondition: 5 km tid, 3 km, Cooper, etc.
Målet är:
• kunna se utveckling över tid
• och koppla prestation till cykel (t.ex. “du peakar ofta i mitten av follicular”).
8. Kalender
8.1 Klientkalender
Klientens vy:
• vecka/månad med:
o planerade pass
o ev. coach-möten
o aktuellt fas-status
o dagligt kalorimål (om aktiverat)
• färgkodningen visar fas.
8.2 Coachkalender
Coachens vy:
• kan se:
o sina klienters pass (översikt)
o check-ins
o bokade coaching-sessioner.
• kan skapa kalenderhändelser:
o “Check-in måndag”
o “Coachsamtal torsdag kl. 19”
o “Gruppcall”.
9. Kommunikation & uppföljning
9.1 Meddelanden
• Inbyggt meddelandeflöde coach ↔ klient.
• Meddelanden kopplas gärna till klienten.
• Läs/oläst-status.
9.2 Check-ins (formulär)
• Coachen kan skapa mallar för check-ins (t.ex. veckovis):
o “Hur har sömnen varit (1–10)?”
o “Hur är energin?”
o “Har du haft mens den här veckan?” etc.
• Check-ins:
o skickas ut (eller bara markeras som “ska fyllas i”)
o klient svarar i app
o coach ser svar och historik.
9.3 Journal & coach-noter (igen men som uppföljningsverktyg)
• Klientjournalen kan användas som mer kvalitativ data:
o upplevelse, känslor, hinder.
• Coach-noter ger kontext vid:
o programändringar
o samtal kring hormoner/cykel.
10. Tips & kunskap (”smart” engine)
10.1 Tips-bibliotek
Tips lagras med:
• titel
• text
• kategori:
o träning
o kost
o cykel
o mindset
• ev. fas (om tipset är fas-specifikt)
• kontext:
o low energy
o high stress
o cravings
o general.
10.2 Regelbaserade rekommendationer (ingen ML i början)
Systemet kan t.ex.:
• se att klienten:
o är i lutealfas
o rapporterar låg energi
o ligger i energiunderskott
• då plockas tips:
o kategori “kost”/“mindset”
o fas = luteal
o kontext = low_energy / cravings.
Tips visas:
• för klient: “Dagens tips”
• för coach: “Förslag till samtal/justering den här veckan”.
11. Onboarding – flöden
11.1 Coach-onboarding
Första gången en coach loggar in:
1. Skapa organisation (eller hoppa över i MVP).
2. Skapa första klient.
3. Skapa första träningsprogram.
4. Skapa första nutritionplan (basversion).
5. Se/cliffnotes om cykelmodulen.
Kan stödjas av:
• onboarding-checklista
• tipsruta.
11.2 Klient-onboarding
När klient bjuds in:
1. Acceptera inbjudan / skapa konto.
2. Fyll i:
a. mål (vikt / performance / hälsa)
b. träningsvana
c. ev. mens-info (frivilligt men uppmuntrat).
3. Första check-in (onboarding-formulär).
4. Får sitt första program + ev. kostplan.
12. Analytics & insights
12.1 Cykelrelaterade insikter
• Visa för coach:
o när klienten tenderar att prestera bäst (fas-mönster).
o när energi ofta är låg.
o när stress toppar.
• Långsiktiga mönster:
o “du har låg energi nästan varje lutealfas – kanske justera träning/kost
här”.
12.2 Träningsrelaterade insikter
• Pass-compliance (hur mycket klienten faktiskt gör).
• Styrkeutveckling (per lyft/övning).
• Koppling mellan volym/intensitet ↔ readiness.
12.3 Nutritionrelaterade insikter
• Hur väl klienten följer energiplanen över tid (när data finns).
• Samband mellan:
o energiunderskott
o symptom
o menscykel.
13. Scope: MVP, Beta, v1.0 (sammanfattning)
13.1 MVP (första användbara testversionen)
Minst:
• Profiler (coach + klient).
• Minst en organisation (eller enkel “coach utan org”).
• Skapa klient.
• Menslogg (mensstart).
• Enkel fasdetektering.
• Enkel övningsbank.
• Enkel träningsplanerare (vecka/pass/övning).
• Tilldelning av program till klient.
• Klient kan se pass och logga enkelt (eller coach loggar åt klient).
• Nutrition:
o minst kcal per dag/vecka
o ev. enkel koppling till fas (t.ex. manuellt).
• Enkel readiness (energi, sömn, stress).
• Enkel kalendervy för klient.
• Enkel coach-dashboard med lista på klienter + fas + nästa pass.
• Några tips baserat på fas.
13.2 Beta (under våren)
• Full programbyggare (block/vecka/pass).
• Fler ready-parameter (mätningar, loggning).
• Fler cykel-funktioner (symptom, tydligare fas)
• Nutrition:
o energi-periodisering över tid
o bättre integration med cykel.
• Gruppcoaching (klientgrupper).
• Enklare check-in-flöde.
13.3 v1.0 (slutet av våren)
• Allt ovan stabilt.
• Taggar & segmentering.
• Journal & coach-noter i användbart skick.
• Färgkodning och female-first UI genomgående.
• Planer (Lite/Pro/Elite) åtminstone backend-mässigt.
• Onboarding-flöden hyfsat polerade.
• Första omgång analytics & insights.
Viktigt: det här dokumentet är nu “källan”