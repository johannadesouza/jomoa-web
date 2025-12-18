# JOMOA Coverage Map & Implementation Plan

## 1. COVERAGE KARTA (KRAV → SIDA → UI → DATA → ACTION)

### COACH SIDOR

#### ✅ Coach Dashboard (`/coach/dashboard`)
**Krav från md-filer:**
- Viktigaste datapunkter: Vem som dippar energi, missar pass, presterar starkt
- Automatiska "adjustment prompts"
- Dagens viktigaste datapunkter
- Onboarding-checklista

**Nuvarande status:**
- ✅ Stats cards (aktiva klienter, tränade senaste 7 dagarna, etc.)
- ✅ Clients needing attention-sektion
- ✅ Onboarding-checklista (delvis)
- 🟡 Automatiska adjustment prompts (saknas)
- ❌ "Notiscenter: Här är vad som hänt denna vecka"

**Cards/Sektioner:**
- ✅ StatCard: Totala klienter
- ✅ StatCard: Tränade senaste 7 dagarna
- ✅ StatCard: Klienter utan readiness idag
- ✅ Card: Klienter som behöver uppmärksamhet
- ✅ Card: Onboarding-checklista
- ❌ Card: Notiscenter / Senaste aktivitet
- ❌ Card: Automatiska förslag/insikter

**Actions:**
- ✅ Navigera till klientprofil (från "behöver attention")
- 🟡 Markera onboarding task som klar
- ❌ "Visa alla notiser"
- ❌ "Se anpassningsförslag"

**Data:**
- ✅ `clients` (antal aktiva)
- ✅ `workout_sessions_log` (träningsdata)
- ✅ `readiness_markers` (readiness-data)
- ✅ `onboarding_tasks`, `profile_onboarding_task_status`
- ❌ `notifications` / aktivitetslogg (saknas)
- ❌ Automatiska insights/trender (saknas)

---

#### 🟡 Coach Klienter (`/coach/clients`)
**Krav från md-filer:**
- Lista alla klienter
- Skapa klient
- Skicka inbjudan
- Filtrera på status/taggar
- Sök

**Nuvarande status:**
- ✅ Lista över klienter i table
- ✅ Skapa klient-formulär (delvis)
- ✅ Skicka inbjudan (delvis)
- ❌ Filter/sök (saknas eller basic)
- ❌ Taggar (saknas)
- ❌ Grupper (saknas i listan)

**Cards/Sektioner:**
- ✅ Card: "Skapa klient" / "Skicka inbjudan" (formulär)
- ✅ Table: Klientlista med status, actions
- ❌ Filter-sektion (taggar, status, grupper)
- ❌ Sök-fält

**Actions:**
- ✅ Skapa klient
- ✅ Skicka inbjudan (visar länk)
- ✅ Navigera till klientprofil
- 🟡 Redigera klient (saknas eller delvis)
- ❌ Tagga klient
- ❌ Lägg till i grupp
- ❌ Export/arkiv

**Data:**
- ✅ `clients` (lista)
- ✅ `profiles` (namn)
- ✅ `invites` (skicka inbjudan)
- ❌ `client_tags`, `tags` (saknas eller inte används)
- ❌ `client_groups` (saknas i listan)

---

#### ✅ Coach Klientprofil (`/coach/clients/[id]`)
**Krav från md-filer:**
- Översikt av klientinformation
- Tabs: Översikt, Träning, Kost, Insikter, Check-ins
- Status-cards: Readiness, Cykel, Senaste pass
- Coach-noter (privata)
- Cykeljustering
- Manuell fasjustering

**Nuvarande status:**
- ✅ Tabs: Översikt, Träning, Kost, Insikter, Check-ins
- ✅ Översikt: Klientinfo, senaste pass, cykelsymptom, cykelstatus
- ✅ Cykeljustering (manuell fasjustering)
- 🟡 Träning-tab (placeholder)
- 🟡 Kost-tab (placeholder)
- 🟡 Insikter-tab (placeholder)
- ✅ Check-ins-tab (delvis)

**Cards/Sektioner:**
- ✅ Card: Klientinformation (status, födelsedatum)
- ✅ Card: Senaste pass (med set-logg)
- ✅ Card: Cykelsymptom (senaste 14 dagarna)
- ✅ Card: Cykelstatus (cykeldag, fas, tillförlitlighet, justering)
- 🟡 Card: Readiness-trend (saknas eller delvis)
- ❌ Card: Coach-noter (privata)
- ❌ Card: Noteringar per pass/kost
- ❌ Card: Taggar
- 🟡 Tab-content: Träning (tom eller placeholder)
- 🟡 Tab-content: Kost (tom eller placeholder)
- 🟡 Tab-content: Insikter (tom eller placeholder)

**Actions:**
- ✅ Justera cykelfas manuellt
- ✅ Återställ cykelfas
- ✅ Navigera till träningssida (från tab)
- ✅ Navigera till kostsida (från tab)
- ✅ Navigera till check-ins-sida (från tab)
- ❌ Redigera klientinfo
- ❌ Lägg till coach-not
- ❌ Tagga klient
- ❌ Pausa/arkivera klient

**Data:**
- ✅ `clients` (klientinfo)
- ✅ `workout_sessions_log`, `workout_set_logs` (träning)
- ✅ `cycle_symptoms`, `cycle_events`, `cycle_phases` (cykel)
- ✅ `readiness_markers` (delvis)
- ❌ `coach_notes` (saknas)
- ❌ `client_tags`, `tags` (saknas)

---

#### 🟡 Coach Klient Träning (`/coach/clients/[id]/workouts`)
**Krav från md-filer:**
- Se klientens träningshistorik
- Se tilldelade program
- Se passlogg (sets, reps, vikt, RPE)
- Grafer & trender (volym, RPE-genomsnitt, följsamhet)
- Perioder med hopp i belastning

**Nuvarande status:**
- ❌ Sida finns inte eller är tom

**Cards/Sektioner:**
- ❌ Card: Aktiva program (lista)
- ❌ Card: Passlogg (tabell med datum, pass, status)
- ❌ ChartCard: Volymtrender (sets/reps/tonnage över tid)
- ❌ ChartCard: RPE-genomsnitt över tid
- ❌ ChartCard: Följsamhet per block/vecka
- ❌ Card: Senaste passdetaljer
- ❌ Card: Perioder med hopp i belastning

**Actions:**
- ❌ Filtrera på datum/program
- ❌ Exportera träningsdata
- ❌ Lägg till coach-not till pass
- ❌ Markera pass som "behöver justering"

**Data:**
- ✅ `client_program_assignments` (tilldelade program)
- ✅ `workout_sessions_log`, `workout_set_logs` (loggdata)
- ✅ `training_programs`, `program_blocks`, `program_weeks`, `program_sessions` (programstruktur)
- ❌ Trends/analyser (behöver beräkning)

---

#### 🟡 Coach Klient Kost (`/coach/clients/[id]/nutrition`)
**Krav från md-filer:**
- Se klientens nutrition-planer
- Se perioder (deficit/maintenance/surplus)
- Se dagliga kcal-mål
- Justera cycle-aware calories
- Se veckosammanfattning (matlogg, energi vs träning, återhämtningsstatus)

**Nuvarande status:**
- ✅ Nutrition plan-sektion (delvis)
- ✅ Perioder (delvis)
- 🟡 Create plan-formulär (delvis)
- ❌ Cycle-aware adjustments (saknas)
- ❌ Veckosammanfattning (saknas)
- ❌ Matlogg (saknas)

**Cards/Sektioner:**
- ✅ Card: Aktiv nutrition plan
- ✅ Card: Perioder (lista med start/slut, target_rate)
- ✅ Card: Skapa ny plan (formulär)
- ✅ Card: Lägg till period (formulär)
- ❌ Card: Dagens kcal-mål (med cycle-aware adjustments)
- ❌ ChartCard: Kcal över tid (veckosammanfattning)
- ❌ Card: Cycle-aware inställningar (on/off, justeringar)
- ❌ Card: Veckosammanfattning (energi vs träning)

**Actions:**
- ✅ Skapa nutrition plan
- ✅ Lägg till period
- 🟡 Inaktivera plan
- ❌ Aktivera/deaktivera cycle-aware calories
- ❌ Justera manuellt kcal för specifik dag
- ❌ Se veckosammanfattning

**Data:**
- ✅ `nutrition_plans` (planer)
- ✅ `nutrition_periods` (perioder)
- ❌ `daily_nutrition_targets` (dagliga mål, saknas eller delvis)
- ❌ `cycle_aware_adjustments` (inställningar, saknas)
- ❌ Matloggdata (saknas)

---

#### 🟡 Coach Klient Insikter (`/coach/clients/[id]/insights`)
**Krav från md-filer:**
- Cykel overlay på volym/RPE/energi
- Fasharmoniserade graftrender
- Insights för justering ("Klient dippar konsekvent 2-3 dagar innan mens")
- Risk för överbelastning
- Rekommenderad deload
- Hormonrelaterade variationer

**Nuvarande status:**
- ❌ Sida finns inte eller är tom

**Cards/Sektioner:**
- ❌ ChartCard: Volym/RPE/energi med cykel-overlay
- ❌ ChartCard: Fasharmoniserade trender (prestation per fas)
- ❌ Card: Automatiska insights/rekommendationer
- ❌ Card: Risk för överbelastning
- ❌ Card: Rekommenderad deload
- ❌ Card: Mönster och korrelationer

**Actions:**
- ❌ Filtrera på tidsperiod
- ❌ Exportera insights
- ❌ Dölj/visa specifika insikter
- ❌ Markera insikt som "aktad på"

**Data:**
- ✅ `workout_sessions_log`, `workout_set_logs` (träningsdata)
- ✅ `cycle_phases`, `cycle_events` (cykeldata)
- ✅ `readiness_markers` (readiness-data)
- ❌ Insights/analyser (behöver beräkning)
- ❌ Trend-data (behöver aggregering)

---

#### ✅ Coach Klient Check-ins (`/coach/clients/[id]/checkins`)
**Krav från md-filer:**
- Se skickade check-ins till klient
- Se svar på check-ins
- Skicka ny check-in

**Nuvarande status:**
- ✅ Lista över check-ins (historik)
- ✅ Visa svar på check-ins
- ✅ Skicka check-in (delvis)

**Cards/Sektioner:**
- ✅ Card: Check-ins historik (lista)
- ✅ Card: Svar (vid val av check-in)
- 🟡 Formulär för att skicka check-in (delvis)

**Actions:**
- ✅ Välj check-in för att se svar
- ✅ Skicka check-in
- ❌ Markera check-in som "behandlad"
- ❌ Skicka påminnelse

**Data:**
- ✅ `checkins` (check-ins)
- ✅ `checkin_answers` (svar)
- ✅ `checkin_templates` (templates)

---

#### 🟡 Coach Skapa Program (`/coach/programs`)
**Krav från md-filer:**
- Lista program
- Skapa nytt program (program → block → vecka → pass → övning)
- Redigera program
- Mallar (låsta eller egna)
- Importera/duplicera
- Versionshantering

**Nuvarande status:**
- ✅ Lista program (delvis)
- ✅ Skapa program (delvis)
- 🟡 Block/vecka/pass-struktur (delvis)
- ❌ Mallar (saknas)
- ❌ Importera/duplicera (saknas)
- ❌ Versionshantering (saknas)

**Cards/Sektioner:**
- ✅ Card: Lista program (med status)
- ✅ Card: Skapa nytt program (formulär)
- 🟡 Programdetaljer (block → vecka → pass)
- ❌ Mallar-sektion
- ❌ Versionshistorik

**Actions:**
- ✅ Skapa program
- ✅ Redigera program
- ✅ Navigera till programdetaljer
- ❌ Duplicera program
- ❌ Importera program
- ❌ Arkivera program
- ❌ Publicera/avpublicera program

**Data:**
- ✅ `training_programs` (program)
- ✅ `program_blocks`, `program_weeks`, `program_sessions` (struktur)
- ✅ `session_exercises` (övningar i pass)
- ❌ `program_templates` (saknas)
- ❌ `program_versions` (saknas)

---

#### 🟡 Coach Program Detaljer (`/coach/programs/[id]`)
**Krav från md-filer:**
- Visa programstruktur (block → vecka → pass)
- Redigera block/vecka/pass
- Lägg till/ta bort övningar
- Tilldela program till klient/grupp
- Cykel-färgkodning (female-first logik)

**Nuvarande status:**
- 🟡 Programdetaljer (delvis)
- 🟡 Block/vecka/pass-redigering (delvis)
- ❌ Tilldelning till klient/grupp (saknas eller delvis)
- ❌ Cykel-färgkodning (saknas)

**Cards/Sektioner:**
- 🟡 Card: Programinfo (namn, beskrivning)
- 🟡 Card: Block-lista
- 🟡 Card: Veckor per block
- 🟡 Card: Pass per vecka
- 🟡 Card: Övningar per pass
- ❌ Card: Tilldelningar (vilka klienter/grupper har programmet)
- ❌ Card: Cykel-färgkodning (visa pass med cykel-färger)

**Actions:**
- 🟡 Redigera block
- 🟡 Lägg till/ta bort vecka
- 🟡 Lägg till/ta bort pass
- 🟡 Lägg till/ta bort övning
- ❌ Tilldela till klient
- ❌ Tilldela till grupp
- ❌ Visa cykel-färgkodning

**Data:**
- ✅ `training_programs`
- ✅ `program_blocks`, `program_weeks`, `program_sessions`
- ✅ `session_exercises`, `exercises`
- ✅ `client_program_assignments`
- ❌ Cykel-data för klienter (behöver koppling)

---

#### 🟡 Coach Övningar (`/coach/exercises`)
**Krav från md-filer:**
- Övningsbank (global JOMOA-bank + egna övningar)
- Filtrera på kategori, muskelgrupper, utrustning
- Lägg till egna övningar
- Video, beskrivning, cues

**Nuvarande status:**
- ✅ Lista övningar (delvis)
- ✅ Lägg till övning (delvis)
- ❌ Filtrering (saknas)
- ❌ Video (saknas eller delvis)
- ❌ Global JOMOA-bank (saknas)

**Cards/Sektioner:**
- ✅ Card: Lista övningar
- ✅ Card: Lägg till övning (formulär)
- ❌ Filter-sektion (kategori, muskelgrupper, utrustning)
- ❌ Card: Övningsdetaljer (video, beskrivning, cues)

**Actions:**
- ✅ Lägg till övning
- ✅ Redigera övning
- ❌ Ta bort övning
- ❌ Filtrera övningar
- ❌ Sök övningar
- ❌ Lägg till video

**Data:**
- ✅ `exercises` (övningar)
- ❌ `exercise_categories` (kategorier, saknas eller delvis)
- ❌ `exercise_videos` (videor, saknas)

---

#### 🟡 Coach Check-ins (`/coach/checkins`)
**Krav från md-filer:**
- Lista alla skickade check-ins
- Skicka check-in till klient
- Se status (väntar/besvarad)

**Nuvarande status:**
- ✅ Lista check-ins (delvis)
- ✅ Skicka check-in (delvis)
- ✅ Status-visning (delvis)

**Cards/Sektioner:**
- ✅ Card: Lista check-ins (med klient, template, status)
- ✅ Card: Skicka check-in (formulär)

**Actions:**
- ✅ Skicka check-in
- ✅ Navigera till klient check-ins
- ❌ Markera som behandlad
- ❌ Skicka påminnelse

**Data:**
- ✅ `checkins`
- ✅ `checkin_templates`
- ✅ `clients`, `profiles`

---

#### 🟡 Coach Check-in Templates (`/coach/checkins/templates`)
**Krav från md-filer:**
- Lista templates
- Skapa/redigera template
- Frågor (scale_1_10, yes_no, text)

**Nuvarande status:**
- ✅ Lista templates (delvis)
- ✅ Skapa template (delvis)
- ✅ Redigera template (delvis)

**Cards/Sektioner:**
- ✅ Card: Lista templates
- ✅ Card: Skapa/redigera template (formulär)
- ✅ Card: Lägg till/redigera frågor

**Actions:**
- ✅ Skapa template
- ✅ Redigera template
- ✅ Lägg till fråga
- ✅ Ta bort fråga
- ❌ Duplicera template

**Data:**
- ✅ `checkin_templates`
- ✅ `checkin_questions`

---

#### 🟡 Coach Grupper (`/coach/groups`)
**Krav från md-filer:**
- Lista grupper
- Skapa grupp
- Lägg till/ta bort klienter
- Tilldela program till grupp

**Nuvarande status:**
- ✅ Lista grupper (delvis)
- ✅ Skapa grupp (delvis)
- 🟡 Lägg till klienter (delvis)
- ❌ Tilldela program till grupp (saknas)

**Cards/Sektioner:**
- ✅ Card: Lista grupper
- ✅ Card: Skapa grupp (formulär)
- 🟡 Card: Gruppdetaljer (klienter)
- ❌ Card: Tilldelade program

**Actions:**
- ✅ Skapa grupp
- ✅ Redigera grupp
- ✅ Lägg till klient i grupp
- ✅ Ta bort klient från grupp
- ❌ Tilldela program till grupp

**Data:**
- ✅ `client_groups`
- ✅ `client_group_members`
- ❌ `group_program_assignments` (saknas eller delvis)

---

#### 🟡 Coach Insikter (`/coach/insights`)
**Krav från md-filer:**
- Övergripande insights för alla klienter
- Trends över alla klienter
- Automatiska förslag

**Nuvarande status:**
- ❌ Sida finns inte eller är tom

**Cards/Sektioner:**
- ❌ Card: Övergripande trends
- ❌ ChartCard: Genomsnittlig följsamhet
- ❌ Card: Klienter som behöver uppmärksamhet (sammanfattning)
- ❌ Card: Automatiska förslag/insikter

**Actions:**
- ❌ Filtrera på tidsperiod
- ❌ Exportera insights

**Data:**
- ✅ Aggregerad data från `clients`, `workout_sessions_log`, `readiness_markers`
- ❌ Insights/trends (behöver beräkning)

---

#### ❌ Coach Inställningar (`/coach/settings`)
**Krav från md-filer:**
- Profilinställningar (namn, språk)
- Notisinställningar
- Plan/abonnemang (Lite/Pro/Elite)

**Nuvarande status:**
- ❌ Sida finns inte

**Cards/Sektioner:**
- ❌ Card: Profil (namn, email, språk)
- ❌ Card: Notisinställningar
- ❌ Card: Plan/abonnemang
- ❌ Card: Konto (lösenord, logout)

**Actions:**
- ❌ Uppdatera profil
- ❌ Uppdatera notisinställningar
- ❌ Ändra plan

**Data:**
- ✅ `profiles` (profil)
- ❌ `notification_settings` (saknas)
- ❌ `subscription_plans` (saknas)

---

### CLIENT SIDOR

#### ✅ Client Dashboard (`/client/dashboard`)
**Krav från md-filer:**
- Dagens pass
- Energi/humör-logg
- Notis: "Coach har uppdaterat blocket"
- Snabb access till schema
- Dagens tips baserat på cykelfas
- Nästa pass, Readiness, Cykel

**Nuvarande status:**
- ✅ Hero card: Dagens fokus
- ✅ Status-cards: Nästa pass, Readiness, Cykel
- ✅ Aktivt program
- ✅ Dagens tips (cykelfas-baserat)
- 🟡 Energi/humör-logg (delvis)
- ❌ Notiser om uppdateringar (saknas)

**Cards/Sektioner:**
- ✅ Card: Hero (Dagens fokus)
- ✅ StatCard: Nästa pass
- ✅ StatCard: Readiness
- ✅ StatCard: Cykelstatus
- ✅ Card: Aktivt program
- ✅ Card: Dagens tips
- 🟡 Card: Energi/humör-logg (delvis)
- ❌ Card: Notiser/uppdateringar

**Actions:**
- ✅ Logga readiness
- ✅ Logga cykelsymptom
- ✅ Navigera till pass
- ✅ Navigera till träningssida
- 🟡 Logga energi/humör (delvis)
- ❌ Se alla notiser

**Data:**
- ✅ `client_program_assignments`, `program_sessions` (nästa pass)
- ✅ `readiness_markers` (readiness)
- ✅ `cycle_phases`, `cycle_events` (cykel)
- ✅ `tips_library` (dagens tips)
- 🟡 `readiness_markers` för energi/humör (delvis)

---

#### ✅ Client Träning (`/client/workouts`)
**Krav från md-filer:**
- Programöversikt (card)
- Veckovy (cards per vecka)
- Passdetalj (card med övningar)
- Loggning (formulär i modal/drawer)
- Sets, reps, vikt, RPE, kommentar
- Passstatus: planerat/genomfört/delvis/ej genomfört

**Nuvarande status:**
- ✅ Programöversikt
- ✅ Lista pass
- ✅ Starta/slutföra pass
- 🟡 Passdetaljer (delvis)
- ❌ Loggning av sets/reps/vikt (saknas eller delvis)
- ❌ RPE-logging (saknas)

**Cards/Sektioner:**
- ✅ Card: Aktiva program
- ✅ Card: Passlista (med status)
- 🟡 Card: Passdetaljer (övningar, sets/reps/vikt)
- ❌ Card: Loggningsformulär (sets, reps, vikt, RPE)
- ❌ Card: Veckovy (cards per vecka)

**Actions:**
- ✅ Starta pass
- ✅ Slutför pass
- 🟡 Logga set (delvis)
- ❌ Logga reps/vikt/RPE
- ❌ Markera pass som delvis genomfört
- ❌ Lägg till kommentar

**Data:**
- ✅ `client_program_assignments`
- ✅ `program_sessions`, `session_exercises`
- ✅ `workout_sessions_log`
- ✅ `workout_set_logs` (delvis)
- ❌ RPE-logging (saknas)

---

#### 🟡 Client Kost (`/client/nutrition`)
**Krav från md-filer:**
- Dagsvy/veckovy (cards)
- Dagens kalorimål
- Macro cards
- Cycle-aware calories (visas automatiskt)
- Tips baserat på cykelfas
- Måltidskort (framtid)

**Nuvarande status:**
- ✅ Dagens kcal-mål (delvis)
- 🟡 Macro cards (delvis)
- ❌ Veckovy (saknas)
- ❌ Cycle-aware visning (saknas)
- ❌ Tips baserat på cykelfas (saknas)

**Cards/Sektioner:**
- ✅ Card: Dagens kcal-mål
- 🟡 Card: Makronutrienter (delvis)
- ❌ Card: Veckovy (kcal per dag)
- ❌ Card: Cycle-aware justeringar (visa anpassningar)
- ❌ Card: Tips baserat på cykelfas
- ❌ Card: Måltidsförslag (framtid)

**Actions:**
- 🟡 Se detaljerad nutrition plan (delvis)
- ❌ Se veckovy
- ❌ Se cycle-aware adjustments

**Data:**
- ✅ `nutrition_plans`, `nutrition_periods`
- ❌ `daily_nutrition_targets` (saknas eller delvis)
- ❌ `cycle_aware_adjustments` (saknas)

---

#### 🟡 Client Insikter (`/client/insights`)
**Krav från md-filer:**
- Grafer (progress, adherence)
- Cykler (om relevant)
- Trends i cards
- Träningsfrekvens vecka/månad
- Volymtrender

**Nuvarande status:**
- ❌ Sida finns men är tom eller placeholder

**Cards/Sektioner:**
- ❌ ChartCard: Träningsfrekvens (vecka/månad)
- ❌ ChartCard: Volymtrender (sets/reps/tonnage)
- ❌ ChartCard: RPE-genomsnitt
- ❌ ChartCard: Följsamhet per block/vecka
- ❌ ChartCard: Cykel med träningsdata
- ❌ Card: Trends och mönster

**Actions:**
- ❌ Filtrera på tidsperiod
- ❌ Exportera data

**Data:**
- ✅ `workout_sessions_log`, `workout_set_logs`
- ✅ `cycle_phases`, `cycle_events`
- ✅ `readiness_markers`
- ❌ Trends/grafer (behöver beräkning)

---

#### ✅ Client Inställningar (`/client/settings`)
**Krav från md-filer:**
- Profil (namn)
- Tidszon
- Enheter (kg/cm vs lbs/inch)
- Visa/dölj kalorier
- Visa/dölj vikt
- Kommunikationspreferens
- Notisinställningar

**Nuvarande status:**
- ✅ Profil (namn, email)
- ✅ Logout
- ❌ Tidszon (saknas)
- ❌ Enheter (saknas)
- ❌ Visa/dölj kalorier (saknas)
- ❌ Visa/dölj vikt (saknas)
- ❌ Kommunikationspreferens (saknas)
- ❌ Notisinställningar (saknas)

**Cards/Sektioner:**
- ✅ Card: Profil (namn, email)
- ✅ Card: Konto (logout)
- ❌ Card: Preferenser (tidszon, enheter)
- ❌ Card: Privathet (visa/dölj kalorier, vikt)
- ❌ Card: Notisinställningar
- ❌ Card: Kommunikation

**Actions:**
- ✅ Uppdatera profil
- ✅ Logout
- ❌ Uppdatera preferenser
- ❌ Uppdatera privathetsinställningar
- ❌ Uppdatera notisinställningar

**Data:**
- ✅ `profiles` (profil)
- ❌ `client_settings` (preferenser, saknas)

---

#### 🟡 Client Check-ins (`/client/checkins/[id]`)
**Krav från md-filer:**
- Se check-in
- Besvara frågor (scale_1_10, yes_no, text)
- Skicka svar

**Nuvarande status:**
- ✅ Visa check-in (delvis)
- ✅ Besvara frågor (delvis)
- ✅ Skicka svar (delvis)

**Cards/Sektioner:**
- ✅ Card: Check-in info (template, förfallodatum)
- ✅ Card: Frågor och svar (formulär)
- ❌ Card: Tidigare svar (historik)

**Actions:**
- ✅ Besvara frågor
- ✅ Skicka svar
- ❌ Spara utkast
- ❌ Se historik

**Data:**
- ✅ `checkins`
- ✅ `checkin_questions`
- ✅ `checkin_answers`

---

## 2. NAVIGATION & IA

### COACH NAVIGATION
**Nuvarande:**
- ✅ Desktop: Sidebar (CoachSidebar)
- ✅ Mobile: Topbar med drawer (CoachTopbar)
- ✅ Route guards (layout.tsx)
- ✅ Aktiv state i menyn

**Sidor:**
- ✅ Dashboard
- ✅ Klienter
- ✅ Skapa program
- ✅ Skapa kostschema (saknas - behöver länk eller navigering)
- ✅ Insikter
- ✅ Inställningar (saknas i menyn)

**Problem:**
- ❌ "Skapa kostschema" saknas (finns på klient-nivå, inte global)
- ❌ "Inställningar" saknas i menyn
- ❌ "Check-ins" saknas i menyn
- ❌ "Övningar" saknas i menyn
- ❌ "Grupper" saknas i menyn

---

### CLIENT NAVIGATION
**Nuvarande:**
- ✅ Desktop: Sidebar (ClientBottomNav)
- ✅ Mobile: Bottom nav (ClientBottomNav)
- ✅ Route guards (layout.tsx)
- ✅ Aktiv state i menyn

**Sidor:**
- ✅ Dashboard
- ✅ Träning
- ✅ Kost
- ✅ Insikter
- ✅ Inställningar

**Problem:**
- 🟡 Check-ins (finns men inte i menyn - behöver access)

---

## 3. UX-FÖRSLAG PER HUVUDOMRÅDE

### TRÄNING (Coach & Client)

**Coach: Skapa Program**
- **Vy 1: Programlista** → **Vy 2: Programdetaljer (wizard)** → **Vy 3: Block/Vecka/Pass-redigering**
- Wizard-steg: 1) Programinfo, 2) Lägg till block, 3) Lägg till veckor, 4) Lägg till pass, 5) Lägg till övningar
- Snabba actions: "Duplicera program", "Tilldela till klient", "Publicera"
- Cykel-färgkodning: Visa pass med färger baserat på klientens cykel (om tilldelad)

**Coach: Klient Träning**
- **Vy 1: Översikt** (tabs: Historik, Program, Insights) → **Vy 2: Passdetaljer** → **Vy 3: Redigera logg**
- Cards: Aktiva program, Senaste pass, Volymtrender, RPE-genomsnitt, Följsamhet
- Snabba actions: "Se alla pass", "Exportera data", "Lägg till coach-not"

**Client: Träning**
- **Vy 1: Programöversikt** → **Vy 2: Veckovy** → **Vy 3: Passdetaljer** → **Vy 4: Loggningsformulär**
- Cards: Aktiva program, Denna vecka, Nästa pass
- Snabba actions: "Starta pass", "Logga set", "Slutför pass"
- Loggningsformulär: Modal/drawer med sets/reps/vikt/RPE

---

### KOST (Coach & Client)

**Coach: Klient Kost**
- **Vy 1: Översikt** (tabs: Planer, Perioder, Mål, Insights) → **Vy 2: Skapa/redigera plan** → **Vy 3: Lägg till period**
- Cards: Aktiv plan, Perioder, Dagens mål, Cycle-aware inställningar, Veckosammanfattning
- Snabba actions: "Skapa ny plan", "Aktivera cycle-aware", "Justera dagligt mål"

**Client: Kost**
- **Vy 1: Dagsvy** → **Vy 2: Veckovy** → **Vy 3: Detaljerad plan**
- Cards: Dagens mål, Makronutrienter, Tips (cykelfas), Veckosammanfattning
- Snabba actions: "Se veckovy", "Se detaljerad plan"

---

### INSIKTER (Coach & Client)

**Coach: Klient Insikter**
- **Vy 1: Översikt** (tabs: Träning, Cykel, Readiness, Korrelationer) → **Vy 2: Detaljerad graf**
- Cards: Volymtrender med cykel-overlay, RPE-genomsnitt, Följsamhet, Automatiska insights, Risk för överbelastning
- Snabba actions: "Se alla insights", "Exportera data", "Markera insikt som aktad på"

**Client: Insikter**
- **Vy 1: Översikt** (tabs: Träning, Cykel, Progress) → **Vy 2: Detaljerad graf**
- Cards: Träningsfrekvens, Volymtrender, RPE-genomsnitt, Följsamhet, Cykel med träningsdata
- Snabba actions: "Se detaljerad graf", "Exportera data"

---

## 4. IMPLEMENTATIONSPLAN (PRIORITERAD)

### MUST-HAVE (För att allt ska kännas komplett)

#### Nivå 1: Navigation & Grundlayout
1. ✅ Uppdatera Coach navigation (lägg till: Check-ins, Övningar, Grupper, Inställningar)
2. 🟡 Uppdatera Client navigation (lägg till: Check-ins access)
3. ✅ Route guards (redan implementerat)
4. ✅ Desktop/mobile layout (redan implementerat)

#### Nivå 2: Fyll tomma sidor med Cards
1. ❌ Coach Klient Träning (`/coach/clients/[id]/workouts`) - Cards: Aktiva program, Passlogg, Grafer
2. ❌ Coach Klient Insikter (`/coach/clients/[id]/insights`) - Cards: Grafer med cykel-overlay, Insights
3. ❌ Coach Insikter (`/coach/insights`) - Cards: Övergripande trends, Sammanfattning
4. ❌ Coach Inställningar (`/coach/settings`) - Cards: Profil, Notiser, Plan
5. 🟡 Client Insikter (`/client/insights`) - Cards: Grafer, Trends
6. 🟡 Client Kost (`/client/nutrition`) - Förbättra: Veckovy, Cycle-aware visning

#### Nivå 3: Komplettera befintliga sidor
1. 🟡 Coach Klientprofil - Lägg till: Coach-noter, Taggar, Redigera klientinfo
2. 🟡 Coach Kost - Lägg till: Cycle-aware adjustments, Veckosammanfattning
3. 🟡 Client Träning - Lägg till: Loggningsformulär (sets/reps/vikt/RPE), Veckovy
4. 🟡 Client Kost - Lägg till: Veckovy, Cycle-aware visning, Tips
5. 🟡 Client Inställningar - Lägg till: Preferenser, Privathet, Notiser

#### Nivå 4: Empty/Loading/Error states
1. ❌ Lägg till EmptyState på alla sidor där data saknas
2. ❌ Lägg till LoadingState på alla sidor med datafetching
3. ❌ Lägg till ErrorState med tydliga felmeddelanden

---

### SHOULD-HAVE (Förbättrad UX)

1. Wizard för "Skapa program" (block → vecka → pass → övning)
2. Templates för program (duplicera, importera)
3. Cycle-aware färgkodning i programbyggaren
4. Bulk actions (t.ex. markera flera check-ins som behandlade)
5. Sök/filter på fler sidor (klienter, övningar, program)
6. Export-funktioner (träningsdata, insights)

---

### NICE-TO-HAVE (Polish)

1. Microcopy (hjälptexter, tooltips)
2. Animationer (transitions, loading states)
3. Keyboard navigation (tab order, shortcuts)
4. Accessibility improvements (ARIA labels, screen reader support)

---

## 5. NÄSTA STEG - IMPLEMENTERING

Börjar med MUST-HAVE nivå 1-2:
1. Uppdatera navigation
2. Fyll tomma sidor med Cards
3. Lägg till Empty/Loading/Error states

