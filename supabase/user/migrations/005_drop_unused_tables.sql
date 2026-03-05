-- ============================================================
-- 005_drop_unused_tables.sql – Ta bort tabeller som inte
-- används av jomoa-mobile (enligt docs/DATABASE_BACKLOG.md).
-- Kör mot User-DB.
-- ============================================================
-- OBS: Om din User-DB inte har dessa tabeller (t.ex. skapad enbart
-- från jomoa-mobile/supabase/migrations/) kommer DROP IF EXISTS
-- att göra ingenting – migrationen är säker att köra.
-- ============================================================

-- Checkin-stack (readiness = daily_readiness i appen)
DROP TABLE IF EXISTS public.checkin_answers CASCADE;
DROP TABLE IF EXISTS public.checkins CASCADE;
DROP TABLE IF EXISTS public.checkin_questions CASCADE;
DROP TABLE IF EXISTS public.checkin_templates CASCADE;

-- Kalender-events (B2B) – används inte i appen
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;

-- Notiser – appen använder expo-notifications + AsyncStorage
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notification_settings CASCADE;

-- Tips som inte kopplats till appen
DROP TABLE IF EXISTS public.suggested_tips CASCADE;

-- Meddelanden coach↔klient – används inte i appen
DROP TABLE IF EXISTS public.messages CASCADE;

-- Beslut: strategy_decisions används; adjustment_history används inte
DROP TABLE IF EXISTS public.adjustment_history CASCADE;

-- Övriga oanvända
DROP TABLE IF EXISTS public.performance_tests CASCADE;
DROP TABLE IF EXISTS public.client_journal_entries CASCADE;
DROP TABLE IF EXISTS public.client_tag_links CASCADE;
DROP TABLE IF EXISTS public.client_tags CASCADE;
DROP TABLE IF EXISTS public.profile_onboarding_task_status CASCADE;
DROP TABLE IF EXISTS public.onboarding_tasks CASCADE;
