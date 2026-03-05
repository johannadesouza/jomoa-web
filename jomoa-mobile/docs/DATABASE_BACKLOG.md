# Databas – backlog och städning

Lista över User-DB-tabeller som används av jomoa-mobile vs kandidater till borttagning eller senare användning. Använd vid migreringar och cleanup.

## Tabeller som används av jomoa-mobile (behåll)

- **clients** – profil, onboarding, presentation_profile, presentation_theme
- **client_program_assignments** – aktiva program
- **client_calendar_entries** – kalenderdagar, pass, session_template_id
- **client_day_notes** – daganteckningar
- **client_goals** – mål (fitness/nutrition/wellness/event)
- **client_favorites** – favoritpass
- **body_measurements** – vikt/mått, photo_url
- **workout_sessions_log**, **set_logs**, **exercise_challenge_log** – pass och set
- **daily_readiness** – check-in (sömn, stress, energi, ömhet)
- **daily_insight_log** – dagens insikt (krävs av insightService)
- **cycle_events** – periodlogg m.m.
- **cycle_symptoms** – symptom
- **cycles**, **cycle_logs**, **cycle_stats**, **user_cycle_settings** – cycle engine
- **strategy_decisions** – sparade beslut (Öka/Behåll/Justera)
- **client_awards** – utmärkelser
- **app_config** – konfigurationsnycklar
- **profiles** – koppling auth → clients

## Tabeller som inte används av mobilappen (kandidater)

| Tabell | Rekommendation |
|--------|----------------|
| checkins, checkin_templates, checkin_questions, checkin_answers | Ta bort om coach/formulär-checkins inte planeras; readiness = daily_readiness |
| calendar_events, event_participants | Ta bort om inte B2B-events planeras |
| nutrition_plans, nutrition_periods, nutrition_targets, meals, meal_items, food_items, daily_meal_assignments | Behåll om Kost-feature byggs snart; annars skjut upp eller ta bort |
| messages | Ta bort (ingår i 005) |
| notifications (tabell), notification_settings | Appen använder expo-notifications + AsyncStorage; ta bort om inte server-push planeras |
| plans, plan_features, subscriptions | Behåll om prenumerationer/betalning byggs snart |
| suggested_tips | Ta bort eller koppla till tips/in-app copy |
| adjustment_history | Se beslut nedan; deprecera om strategy_decisions behålls |
| performance_tests | Ta bort eller behåll för framtida feature |
| client_journal_entries | Ta bort eller behåll för framtida journal |
| client_tags, client_tag_links | Ta bort eller behåll för admin/coach |
| onboarding_tasks, profile_onboarding_task_status | Ta bort om ni inte använder dem (appen har eget onboarding) |
| waitlist_emails | Behåll – används av web |

## client_settings

Finns i schema (time_zone, preferred_units, show_weight_in_app, etc.). Ingen explicit användning i mobil-koden idag. Antingen koppla (enheter, tidszon, vikt) eller dokumentera som reserverad.

## Migration: ta bort oanvända tabeller

Filen **`supabase/user/migrations/005_drop_unused_tables.sql`** tar bort följande tabeller (om de finns):

- checkin_answers, checkins, checkin_questions, checkin_templates
- event_participants, calendar_events
- notifications, notification_settings
- suggested_tips
- messages
- adjustment_history
- performance_tests
- client_journal_entries
- client_tag_links, client_tags
- profile_onboarding_task_status, onboarding_tasks

**Så kör du migrationen:**

1. Mot lokal Supabase (User-DB):  
   `supabase db push` (om du använder Supabase CLI och User-DB är kopplad) eller kör SQL-filen manuellt mot User-DB.
2. Mot hosted Supabase: öppna SQL Editor för **User-projektet**, klistra in innehållet från `005_drop_unused_tables.sql` och kör.

**Säkerhet:** Alla kommandon använder `DROP TABLE IF EXISTS ... CASCADE`. Om en tabell inte finns händer inget. Om din databas bara har skapats från jomoa-mobile-migrationer har du redan inte dessa tabeller – då är migrationen en no-op.

**Medvetet kvar (ej med i 005):** nutrition_plans, nutrition_periods, nutrition_targets, meals, meal_items, food_items, daily_meal_assignments, plans, plan_features, subscriptions och client_settings – behålls tills ni bestämmer er för Kost/betalning eller tar bort dem i en senare migration.

## Körordning vid ny migration

Se [SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md) för tabellordning och RLS.
