-- ============================================================================
-- copy_from_user_db.sql – Kopiera content-data från User DB till Content DB
--
-- INSTRUKTIONER:
--   Kör detta skript mot Content DB med psql eller Supabase SQL Editor.
--   Förutsätter att du har direkt DB-åtkomst till User DB via postgres_fdw
--   eller att du kör det i två steg (EXPORT från User DB, IMPORT till Content DB).
--
-- ALTERNATIV A – postgres_fdw (kör mot Content DB):
--   1. Aktivera postgres_fdw extension i Content DB
--   2. Skapa foreign server mot User DB
--   3. Kör INSERT ... SELECT nedan
--
-- ALTERNATIV B – pg_dump / psql (rekommenderas för produktion):
--   1. pg_dump -h user-db-host -t exercises -t training_programs ... > content_data.sql
--   2. psql -h content-db-host < content_data.sql
--
-- Se /scripts/validate_content_migration.ts för verifiering efter körning.
-- ============================================================================

-- ─────────────────────────────────────────────
-- ALTERNATIV A – postgres_fdw
-- Ersätt <USER_DB_HOST>, <USER_DB_NAME>, <USER_DB_PASSWORD> med rätt värden.
-- ─────────────────────────────────────────────

-- CREATE EXTENSION IF NOT EXISTS postgres_fdw;
--
-- DROP SERVER IF EXISTS user_db CASCADE;
-- CREATE SERVER user_db
--   FOREIGN DATA WRAPPER postgres_fdw
--   OPTIONS (host '<USER_DB_HOST>', dbname '<USER_DB_NAME>', port '5432');
--
-- CREATE USER MAPPING FOR CURRENT_USER
--   SERVER user_db
--   OPTIONS (user 'postgres', password '<USER_DB_PASSWORD>');
--
-- IMPORT FOREIGN SCHEMA public
--   LIMIT TO (exercises, training_programs, program_blocks, program_weeks,
--             program_sessions, session_exercises, session_templates,
--             session_template_exercises, articles)
--   FROM SERVER user_db INTO public_fdw;

-- ─────────────────────────────────────────────
-- KOPIERING – kör i ordning (FK-beroenden)
-- ─────────────────────────────────────────────

-- 1. exercises (inga beroenden)
INSERT INTO public.exercises
  (id, name, default_video_url, primary_muscle_group, equipment, created_at)
SELECT
  id, name, default_video_url, primary_muscle_group, equipment, created_at
FROM public_fdw.exercises
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  default_video_url = EXCLUDED.default_video_url,
  primary_muscle_group = EXCLUDED.primary_muscle_group,
  equipment = EXCLUDED.equipment;

-- 2. training_programs
INSERT INTO public.training_programs
  (id, name, description, target_goal, target_duration_weeks, is_template, created_at)
SELECT
  id, name, description, target_goal, target_duration_weeks,
  COALESCE(is_template, true), created_at
FROM public_fdw.training_programs
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_goal = EXCLUDED.target_goal,
  target_duration_weeks = EXCLUDED.target_duration_weeks,
  is_template = EXCLUDED.is_template;

-- 3. program_blocks (beror på training_programs)
INSERT INTO public.program_blocks
  (id, program_id, name, order_index, weeks_count, created_at)
SELECT
  id, program_id, name, order_index, weeks_count, created_at
FROM public_fdw.program_blocks
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index,
  weeks_count = EXCLUDED.weeks_count;

-- 4. program_weeks (beror på training_programs + program_blocks)
INSERT INTO public.program_weeks
  (id, program_id, block_id, week_number, name, created_at)
SELECT
  id, program_id, block_id, week_number, name, created_at
FROM public_fdw.program_weeks
ON CONFLICT (id) DO UPDATE SET
  week_number = EXCLUDED.week_number,
  name = EXCLUDED.name;

-- 5. program_sessions (beror på training_programs + program_weeks)
INSERT INTO public.program_sessions
  (id, program_id, week_id, name, day_of_week, focus, created_at)
SELECT
  id, program_id, week_id, name, day_of_week, focus, created_at
FROM public_fdw.program_sessions
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  day_of_week = EXCLUDED.day_of_week,
  focus = EXCLUDED.focus;

-- 6. session_exercises (beror på program_sessions + exercises)
INSERT INTO public.session_exercises
  (id, session_id, exercise_id, order_index, sets_planned, reps_planned,
   rest_seconds, intensity_type, intensity_value, duration_seconds, created_at)
SELECT
  id, session_id, exercise_id, order_index, sets_planned, reps_planned,
  rest_seconds, intensity_type, intensity_value, duration_seconds, created_at
FROM public_fdw.session_exercises
ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  sets_planned = EXCLUDED.sets_planned,
  reps_planned = EXCLUDED.reps_planned,
  rest_seconds = EXCLUDED.rest_seconds,
  intensity_type = EXCLUDED.intensity_type,
  intensity_value = EXCLUDED.intensity_value,
  duration_seconds = EXCLUDED.duration_seconds;

-- 7. session_templates (inga externa beroenden)
INSERT INTO public.session_templates
  (id, name, focus, description, duration_minutes, created_at)
SELECT
  id, name, focus, description, duration_minutes, created_at
FROM public_fdw.session_templates
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes;

-- 8. session_template_exercises (beror på session_templates + exercises)
INSERT INTO public.session_template_exercises
  (id, session_template_id, exercise_id, order_index, sets_planned, reps_planned,
   rest_seconds, duration_seconds, created_at)
SELECT
  id, session_template_id, exercise_id, order_index, sets_planned, reps_planned,
  rest_seconds, duration_seconds, created_at
FROM public_fdw.session_template_exercises
ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  sets_planned = EXCLUDED.sets_planned,
  reps_planned = EXCLUDED.reps_planned,
  rest_seconds = EXCLUDED.rest_seconds,
  duration_seconds = EXCLUDED.duration_seconds;

-- 9. articles (från web-appen, om tabellen finns i User DB)
INSERT INTO public.articles
  (id, title, slug, content, excerpt, category, status, locale,
   reading_time_minutes, published_at, created_at, updated_at)
SELECT
  id, title, slug, content, excerpt, category, status, locale,
  reading_time_minutes, published_at, created_at, updated_at
FROM public_fdw.articles
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  locale = EXCLUDED.locale,
  reading_time_minutes = EXCLUDED.reading_time_minutes,
  published_at = EXCLUDED.published_at,
  updated_at = EXCLUDED.updated_at;

-- ─────────────────────────────────────────────
-- Cleanup FDW (valfritt, kör efter verifiering)
-- ─────────────────────────────────────────────
-- DROP SCHEMA IF EXISTS public_fdw CASCADE;
-- DROP SERVER IF EXISTS user_db CASCADE;
