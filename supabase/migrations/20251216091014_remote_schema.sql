


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."calendar_event_type_enum" AS ENUM (
    'coaching_session',
    'checkin',
    'note',
    'other'
);


ALTER TYPE "public"."calendar_event_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."checkin_question_type_enum" AS ENUM (
    'scale_1_10',
    'yes_no',
    'text'
);


ALTER TYPE "public"."checkin_question_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."client_status_enum" AS ENUM (
    'active',
    'paused',
    'archived'
);


ALTER TYPE "public"."client_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."cycle_event_type_enum" AS ENUM (
    'period_start',
    'period_end',
    'ovulation_estimate',
    'ovulation_confirmed'
);


ALTER TYPE "public"."cycle_event_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."cycle_phase_enum" AS ENUM (
    'menstruation',
    'follicular',
    'ovulation',
    'luteal',
    'unknown'
);


ALTER TYPE "public"."cycle_phase_enum" OWNER TO "postgres";


CREATE TYPE "public"."cycle_source_enum" AS ENUM (
    'client',
    'coach',
    'system'
);


ALTER TYPE "public"."cycle_source_enum" OWNER TO "postgres";


CREATE TYPE "public"."gender_enum" AS ENUM (
    'female',
    'male',
    'other',
    'unspecified'
);


ALTER TYPE "public"."gender_enum" OWNER TO "postgres";


CREATE TYPE "public"."intensity_type_enum" AS ENUM (
    'none',
    'rpe',
    'percent'
);


ALTER TYPE "public"."intensity_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."nutrition_goal_enum" AS ENUM (
    'fat_loss',
    'muscle_gain',
    'recomp',
    'maintenance'
);


ALTER TYPE "public"."nutrition_goal_enum" OWNER TO "postgres";


CREATE TYPE "public"."nutrition_period_type_enum" AS ENUM (
    'deficit',
    'maintenance',
    'surplus'
);


ALTER TYPE "public"."nutrition_period_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."onboarding_stage_enum" AS ENUM (
    'not_started',
    'started',
    'completed'
);


ALTER TYPE "public"."onboarding_stage_enum" OWNER TO "postgres";


CREATE TYPE "public"."org_member_role_enum" AS ENUM (
    'owner',
    'coach',
    'assistant'
);


ALTER TYPE "public"."org_member_role_enum" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status_enum" AS ENUM (
    'trial',
    'active',
    'past_due',
    'cancelled'
);


ALTER TYPE "public"."subscription_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."tip_category_enum" AS ENUM (
    'training',
    'nutrition',
    'cycle',
    'mindset'
);


ALTER TYPE "public"."tip_category_enum" OWNER TO "postgres";


CREATE TYPE "public"."tip_context_enum" AS ENUM (
    'low_energy',
    'high_stress',
    'cravings',
    'general'
);


ALTER TYPE "public"."tip_context_enum" OWNER TO "postgres";


CREATE TYPE "public"."training_goal_enum" AS ENUM (
    'strength',
    'hypertrophy',
    'endurance',
    'performance',
    'fat_loss',
    'general_fitness'
);


ALTER TYPE "public"."training_goal_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'coach',
    'client',
    'admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calc_article_reading_time"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Only calculate if content is not NULL and not empty
  IF NEW.content IS NULL OR TRIM(NEW.content) = '' THEN
    -- Don't update reading_time_minutes if content is empty
    RETURN NEW;
  END IF;

  -- Count words by splitting on whitespace (spaces, tabs, newlines)
  -- This approach splits on any sequence of whitespace characters,
  -- filters out empty strings, and counts the resulting words
  -- This works well with markdown and plain text
  SELECT COALESCE(
    array_length(
      array_remove(
        regexp_split_to_array(
          TRIM(NEW.content),
          E'\\s+'
        ),
        ''
      ),
      1
    ),
    0
  ) INTO word_count;

  -- If word_count is NULL (shouldn't happen, but safety check), set to 0
  IF word_count IS NULL THEN
    word_count := 0;
  END IF;

  -- Calculate reading time: ceil(words / 220.0)
  -- Minimum 1 minute if there's any content
  NEW.reading_time_minutes := GREATEST(1, CEIL(word_count::NUMERIC / 220.0)::INTEGER);

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calc_article_reading_time"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calc_article_reading_time"() IS 'Automatically calculates reading_time_minutes based on word count in content field. Assumes 220 words per minute reading speed.';



CREATE OR REPLACE FUNCTION "public"."handle_invite_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_invite_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'coach',  -- du kan ändra till 'client' om de flesta signups ska vara klienter
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_waitlist_emails_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_waitlist_emails_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."use_invite"("invite_token" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  _coach_id uuid;
  _profile_id uuid := auth.uid();
begin
  -- Get coach_id
  select coach_id into _coach_id
  from client_invites
  where token = invite_token
    and used_by_profile_id is null
    and expires_at > now();

  if _coach_id is null then
    raise exception 'Invalid or expired invite token';
  end if;

  -- Mark invite as used
  update client_invites
  set used_by_profile_id = _profile_id,
      used_at = now()
  where token = invite_token;

  -- Update profile
  update public.profiles
  set coach_id = _coach_id,
      role = 'client',
      status = 'onboarding'
  where id = _profile_id;
end;
$$;


ALTER FUNCTION "public"."use_invite"("invite_token" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text",
    "content" "text" NOT NULL,
    "cover_image_url" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "reading_time_minutes" integer,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "articles_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"])))
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."body_measurements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "weight_kg" numeric,
    "waist_cm" numeric,
    "hip_cm" numeric,
    "thigh_cm" numeric,
    "body_fat_percent" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."body_measurements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "coach_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_datetime" timestamp with time zone NOT NULL,
    "end_datetime" timestamp with time zone NOT NULL,
    "event_type" "public"."calendar_event_type_enum" DEFAULT 'other'::"public"."calendar_event_type_enum" NOT NULL,
    "is_online" boolean DEFAULT false NOT NULL,
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkin_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "checkin_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "numeric_value" numeric,
    "text_value" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."checkin_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkin_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" "public"."checkin_question_type_enum" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."checkin_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkin_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "coach_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."checkin_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "template_id" "uuid" NOT NULL,
    "created_by_coach_id" "uuid",
    "due_date" "date",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."checkins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_group_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "left_at" timestamp with time zone
);


ALTER TABLE "public"."client_group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by_coach_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_journal_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "title" "text",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_journal_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_program_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "program_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_program_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "time_zone" "text" DEFAULT 'Europe/Stockholm'::"text",
    "preferred_units" "text" DEFAULT 'metric'::"text",
    "show_calories_exact" boolean DEFAULT true NOT NULL,
    "show_weight_in_app" boolean DEFAULT true NOT NULL,
    "communication_preference" "text" DEFAULT 'in_app'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tag_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_tag_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "primary_coach_id" "uuid",
    "organization_id" "uuid",
    "date_of_birth" "date",
    "gender" "public"."gender_enum" DEFAULT 'female'::"public"."gender_enum" NOT NULL,
    "status" "public"."client_status_enum" DEFAULT 'active'::"public"."client_status_enum" NOT NULL,
    "notes" "text",
    "onboarding_stage" "public"."onboarding_stage_enum" DEFAULT 'not_started'::"public"."onboarding_stage_enum" NOT NULL,
    "onboarding_completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coach_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "coach_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "note" "text" NOT NULL,
    "note_type" "text" DEFAULT 'general'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."coach_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cycle_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "event_type" "public"."cycle_event_type_enum" NOT NULL,
    "source" "public"."cycle_source_enum" DEFAULT 'client'::"public"."cycle_source_enum" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cycle_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cycle_phases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "phase" "public"."cycle_phase_enum" DEFAULT 'unknown'::"public"."cycle_phase_enum" NOT NULL,
    "source" "public"."cycle_source_enum" DEFAULT 'system'::"public"."cycle_source_enum" NOT NULL,
    "confidence" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cycle_phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cycle_symptoms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "cramps_severity" integer,
    "bleeding_level" integer,
    "mood" "text",
    "energy_level" integer,
    "sleep_quality" integer,
    "stress_level" integer,
    "cravings" "text",
    "other_symptoms" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cycle_symptoms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_meal_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "meal_id" "uuid" NOT NULL,
    "meal_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."daily_meal_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_readiness" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "sleep_hours" numeric,
    "sleep_quality" integer,
    "stress_level" integer,
    "energy_level" integer,
    "soreness" integer,
    "readiness_score" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."daily_readiness" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL
);


ALTER TABLE "public"."event_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."exercise_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercise_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "url" "text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."exercise_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category_id" "uuid",
    "primary_muscle_group" "text",
    "equipment" "text",
    "default_video_url" "text",
    "default_image_url" "text",
    "description" "text",
    "created_by_profile_id" "uuid",
    "is_global" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."food_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "brand" "text",
    "kcal_per_100g" numeric NOT NULL,
    "protein_per_100g" numeric NOT NULL,
    "carbs_per_100g" numeric NOT NULL,
    "fat_per_100g" numeric NOT NULL,
    "created_by_profile_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."food_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_program_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "program_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."group_program_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "invited_by_profile_id" "uuid" NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'client'::"public"."user_role_enum" NOT NULL,
    "organization_id" "uuid",
    "client_id" "uuid",
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meal_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "meal_id" "uuid" NOT NULL,
    "food_item_id" "uuid" NOT NULL,
    "amount_grams" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."meal_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by_coach_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."meals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_profile_id" "uuid" NOT NULL,
    "receiver_profile_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "notify_new_message" boolean DEFAULT true NOT NULL,
    "notify_new_program" boolean DEFAULT true NOT NULL,
    "notify_checkin_due" boolean DEFAULT true NOT NULL,
    "notify_nutrition_change" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nutrition_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nutrition_plan_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "period_type" "public"."nutrition_period_type_enum" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "target_rate_kg_per_week" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."nutrition_periods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nutrition_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "goal" "public"."nutrition_goal_enum" DEFAULT 'maintenance'::"public"."nutrition_goal_enum" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "created_by_coach_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."nutrition_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nutrition_targets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nutrition_plan_id" "uuid" NOT NULL,
    "period_id" "uuid",
    "date" "date" NOT NULL,
    "target_kcal" integer NOT NULL,
    "target_protein_g" integer,
    "target_carbs_g" integer,
    "target_fat_g" integer,
    "is_auto_adjusted_from_cycle" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."nutrition_targets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "target_role" "public"."user_role_enum" NOT NULL,
    "key" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "order_index" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."onboarding_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "role_in_org" "public"."org_member_role_enum" DEFAULT 'coach'::"public"."org_member_role_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "test_type" "text" NOT NULL,
    "value" numeric NOT NULL,
    "unit" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."performance_tests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plan_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "feature_key" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."plan_features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "max_clients" integer,
    "price_month_eur" numeric(10,2),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_onboarding_task_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "task_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_onboarding_task_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'client'::"public"."user_role_enum" NOT NULL,
    "full_name" "text",
    "language" "text" DEFAULT 'sv'::"text",
    "onboarding_stage" "public"."onboarding_stage_enum" DEFAULT 'not_started'::"public"."onboarding_stage_enum" NOT NULL,
    "onboarding_completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program_blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "weeks_count" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."program_blocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_id" "uuid" NOT NULL,
    "week_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "day_of_week" integer NOT NULL,
    "focus" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."program_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program_weeks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_id" "uuid" NOT NULL,
    "block_id" "uuid",
    "week_number" integer NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."program_weeks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "sets_planned" integer,
    "reps_planned" integer,
    "tempo" "text",
    "rest_seconds" integer,
    "intensity_type" "public"."intensity_type_enum" DEFAULT 'none'::"public"."intensity_type_enum" NOT NULL,
    "intensity_value" numeric,
    "notes" "text"
);


ALTER TABLE "public"."session_exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."set_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_session_log_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "set_number" integer NOT NULL,
    "reps" integer,
    "weight" numeric,
    "rpe" numeric,
    "distance" numeric,
    "time_seconds" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."set_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "coach_profile_id" "uuid",
    "plan_id" "uuid" NOT NULL,
    "status" "public"."subscription_status_enum" DEFAULT 'trial'::"public"."subscription_status_enum" NOT NULL,
    "trial_ends_at" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "subscriptions_check" CHECK (((("organization_id" IS NOT NULL) AND ("coach_profile_id" IS NULL)) OR (("organization_id" IS NULL) AND ("coach_profile_id" IS NOT NULL))))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suggested_tips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "tip_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "source" "text" DEFAULT 'system'::"text" NOT NULL,
    "status" "text" DEFAULT 'shown'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."suggested_tips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tips_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "category" "public"."tip_category_enum" NOT NULL,
    "phase" "public"."cycle_phase_enum",
    "context" "public"."tip_context_enum",
    "created_by_profile_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tips_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by_coach_id" "uuid" NOT NULL,
    "target_goal" "public"."training_goal_enum" DEFAULT 'general_fitness'::"public"."training_goal_enum",
    "target_duration_weeks" integer,
    "is_template" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."training_programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist_emails" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "locale" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "first_name" "text",
    CONSTRAINT "waitlist_emails_locale_check" CHECK (("locale" = ANY (ARRAY['en'::"text", 'sv'::"text"])))
);


ALTER TABLE "public"."waitlist_emails" OWNER TO "postgres";


COMMENT ON TABLE "public"."waitlist_emails" IS 'Stores email addresses from the waitlist form';



CREATE TABLE IF NOT EXISTS "public"."workout_sessions_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "program_session_id" "uuid",
    "date" "date" NOT NULL,
    "status" "text" DEFAULT 'planned'::"text" NOT NULL,
    "overall_rpe" numeric,
    "mood_before" "text",
    "mood_after" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workout_sessions_log" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."body_measurements"
    ADD CONSTRAINT "body_measurements_client_id_date_key" UNIQUE ("client_id", "date");



ALTER TABLE ONLY "public"."body_measurements"
    ADD CONSTRAINT "body_measurements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkin_answers"
    ADD CONSTRAINT "checkin_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkin_questions"
    ADD CONSTRAINT "checkin_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkin_templates"
    ADD CONSTRAINT "checkin_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_group_members"
    ADD CONSTRAINT "client_group_members_group_id_client_id_key" UNIQUE ("group_id", "client_id");



ALTER TABLE ONLY "public"."client_group_members"
    ADD CONSTRAINT "client_group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_groups"
    ADD CONSTRAINT "client_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_journal_entries"
    ADD CONSTRAINT "client_journal_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_program_assignments"
    ADD CONSTRAINT "client_program_assignments_client_id_program_id_start_date_key" UNIQUE ("client_id", "program_id", "start_date");



ALTER TABLE ONLY "public"."client_program_assignments"
    ADD CONSTRAINT "client_program_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_settings"
    ADD CONSTRAINT "client_settings_client_id_key" UNIQUE ("client_id");



ALTER TABLE ONLY "public"."client_settings"
    ADD CONSTRAINT "client_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tag_links"
    ADD CONSTRAINT "client_tag_links_client_id_tag_id_key" UNIQUE ("client_id", "tag_id");



ALTER TABLE ONLY "public"."client_tag_links"
    ADD CONSTRAINT "client_tag_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tags"
    ADD CONSTRAINT "client_tags_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."client_tags"
    ADD CONSTRAINT "client_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coach_notes"
    ADD CONSTRAINT "coach_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cycle_events"
    ADD CONSTRAINT "cycle_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cycle_phases"
    ADD CONSTRAINT "cycle_phases_client_id_date_key" UNIQUE ("client_id", "date");



ALTER TABLE ONLY "public"."cycle_phases"
    ADD CONSTRAINT "cycle_phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cycle_symptoms"
    ADD CONSTRAINT "cycle_symptoms_client_id_date_key" UNIQUE ("client_id", "date");



ALTER TABLE ONLY "public"."cycle_symptoms"
    ADD CONSTRAINT "cycle_symptoms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_meal_assignments"
    ADD CONSTRAINT "daily_meal_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_readiness"
    ADD CONSTRAINT "daily_readiness_client_id_date_key" UNIQUE ("client_id", "date");



ALTER TABLE ONLY "public"."daily_readiness"
    ADD CONSTRAINT "daily_readiness_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_participants"
    ADD CONSTRAINT "event_participants_event_id_client_id_key" UNIQUE ("event_id", "client_id");



ALTER TABLE ONLY "public"."event_participants"
    ADD CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_categories"
    ADD CONSTRAINT "exercise_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."exercise_categories"
    ADD CONSTRAINT "exercise_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_media"
    ADD CONSTRAINT "exercise_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."food_items"
    ADD CONSTRAINT "food_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_program_assignments"
    ADD CONSTRAINT "group_program_assignments_group_id_program_id_start_date_key" UNIQUE ("group_id", "program_id", "start_date");



ALTER TABLE ONLY "public"."group_program_assignments"
    ADD CONSTRAINT "group_program_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."meal_items"
    ADD CONSTRAINT "meal_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meals"
    ADD CONSTRAINT "meals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_settings"
    ADD CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_settings"
    ADD CONSTRAINT "notification_settings_profile_id_key" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."nutrition_periods"
    ADD CONSTRAINT "nutrition_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nutrition_plans"
    ADD CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nutrition_targets"
    ADD CONSTRAINT "nutrition_targets_nutrition_plan_id_date_key" UNIQUE ("nutrition_plan_id", "date");



ALTER TABLE ONLY "public"."nutrition_targets"
    ADD CONSTRAINT "nutrition_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_tasks"
    ADD CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_tasks"
    ADD CONSTRAINT "onboarding_tasks_target_role_key_key" UNIQUE ("target_role", "key");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_profile_id_key" UNIQUE ("organization_id", "profile_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."performance_tests"
    ADD CONSTRAINT "performance_tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_features"
    ADD CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_features"
    ADD CONSTRAINT "plan_features_plan_id_feature_key_key" UNIQUE ("plan_id", "feature_key");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_onboarding_task_status"
    ADD CONSTRAINT "profile_onboarding_task_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_onboarding_task_status"
    ADD CONSTRAINT "profile_onboarding_task_status_profile_id_task_id_key" UNIQUE ("profile_id", "task_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_blocks"
    ADD CONSTRAINT "program_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_sessions"
    ADD CONSTRAINT "program_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_weeks"
    ADD CONSTRAINT "program_weeks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_weeks"
    ADD CONSTRAINT "program_weeks_program_id_week_number_key" UNIQUE ("program_id", "week_number");



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."set_logs"
    ADD CONSTRAINT "set_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggested_tips"
    ADD CONSTRAINT "suggested_tips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tips_library"
    ADD CONSTRAINT "tips_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_programs"
    ADD CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist_emails"
    ADD CONSTRAINT "waitlist_emails_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."waitlist_emails"
    ADD CONSTRAINT "waitlist_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workout_sessions_log"
    ADD CONSTRAINT "workout_sessions_log_pkey" PRIMARY KEY ("id");



CREATE INDEX "articles_published_idx" ON "public"."articles" USING "btree" ("status", "published_at" DESC);



CREATE INDEX "idx_waitlist_emails_created_at" ON "public"."waitlist_emails" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_waitlist_emails_email" ON "public"."waitlist_emails" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "articles_calc_reading_time_trigger" BEFORE INSERT OR UPDATE OF "content" ON "public"."articles" FOR EACH ROW EXECUTE FUNCTION "public"."calc_article_reading_time"();



CREATE OR REPLACE TRIGGER "update_waitlist_emails_updated_at" BEFORE UPDATE ON "public"."waitlist_emails" FOR EACH ROW EXECUTE FUNCTION "public"."update_waitlist_emails_updated_at"();



ALTER TABLE ONLY "public"."body_measurements"
    ADD CONSTRAINT "body_measurements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkin_answers"
    ADD CONSTRAINT "checkin_answers_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "public"."checkins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkin_answers"
    ADD CONSTRAINT "checkin_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."checkin_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkin_questions"
    ADD CONSTRAINT "checkin_questions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."checkin_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkin_templates"
    ADD CONSTRAINT "checkin_templates_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."checkin_templates"
    ADD CONSTRAINT "checkin_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_created_by_coach_id_fkey" FOREIGN KEY ("created_by_coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."checkins"
    ADD CONSTRAINT "checkins_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."checkin_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_group_members"
    ADD CONSTRAINT "client_group_members_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_group_members"
    ADD CONSTRAINT "client_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."client_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_groups"
    ADD CONSTRAINT "client_groups_created_by_coach_id_fkey" FOREIGN KEY ("created_by_coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_groups"
    ADD CONSTRAINT "client_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_journal_entries"
    ADD CONSTRAINT "client_journal_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_program_assignments"
    ADD CONSTRAINT "client_program_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_program_assignments"
    ADD CONSTRAINT "client_program_assignments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."client_settings"
    ADD CONSTRAINT "client_settings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tag_links"
    ADD CONSTRAINT "client_tag_links_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tag_links"
    ADD CONSTRAINT "client_tag_links_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."client_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tags"
    ADD CONSTRAINT "client_tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_primary_coach_id_fkey" FOREIGN KEY ("primary_coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."coach_notes"
    ADD CONSTRAINT "coach_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coach_notes"
    ADD CONSTRAINT "coach_notes_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cycle_events"
    ADD CONSTRAINT "cycle_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cycle_phases"
    ADD CONSTRAINT "cycle_phases_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cycle_symptoms"
    ADD CONSTRAINT "cycle_symptoms_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_meal_assignments"
    ADD CONSTRAINT "daily_meal_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_meal_assignments"
    ADD CONSTRAINT "daily_meal_assignments_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_readiness"
    ADD CONSTRAINT "daily_readiness_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_participants"
    ADD CONSTRAINT "event_participants_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_participants"
    ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercise_media"
    ADD CONSTRAINT "exercise_media_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."exercise_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_created_by_profile_id_fkey" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."food_items"
    ADD CONSTRAINT "food_items_created_by_profile_id_fkey" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."group_program_assignments"
    ADD CONSTRAINT "group_program_assignments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."client_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_program_assignments"
    ADD CONSTRAINT "group_program_assignments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_invited_by_profile_id_fkey" FOREIGN KEY ("invited_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invites"
    ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meal_items"
    ADD CONSTRAINT "meal_items_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "public"."food_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."meal_items"
    ADD CONSTRAINT "meal_items_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."meals"
    ADD CONSTRAINT "meals_created_by_coach_id_fkey" FOREIGN KEY ("created_by_coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_receiver_profile_id_fkey" FOREIGN KEY ("receiver_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_profile_id_fkey" FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_settings"
    ADD CONSTRAINT "notification_settings_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nutrition_periods"
    ADD CONSTRAINT "nutrition_periods_nutrition_plan_id_fkey" FOREIGN KEY ("nutrition_plan_id") REFERENCES "public"."nutrition_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nutrition_plans"
    ADD CONSTRAINT "nutrition_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nutrition_plans"
    ADD CONSTRAINT "nutrition_plans_created_by_coach_id_fkey" FOREIGN KEY ("created_by_coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."nutrition_targets"
    ADD CONSTRAINT "nutrition_targets_nutrition_plan_id_fkey" FOREIGN KEY ("nutrition_plan_id") REFERENCES "public"."nutrition_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nutrition_targets"
    ADD CONSTRAINT "nutrition_targets_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."nutrition_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."performance_tests"
    ADD CONSTRAINT "performance_tests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plan_features"
    ADD CONSTRAINT "plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_onboarding_task_status"
    ADD CONSTRAINT "profile_onboarding_task_status_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_onboarding_task_status"
    ADD CONSTRAINT "profile_onboarding_task_status_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."onboarding_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_blocks"
    ADD CONSTRAINT "program_blocks_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_sessions"
    ADD CONSTRAINT "program_sessions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_sessions"
    ADD CONSTRAINT "program_sessions_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "public"."program_weeks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_weeks"
    ADD CONSTRAINT "program_weeks_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "public"."program_blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_weeks"
    ADD CONSTRAINT "program_weeks_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."session_exercises"
    ADD CONSTRAINT "session_exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."program_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."set_logs"
    ADD CONSTRAINT "set_logs_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."set_logs"
    ADD CONSTRAINT "set_logs_workout_session_log_id_fkey" FOREIGN KEY ("workout_session_log_id") REFERENCES "public"."workout_sessions_log"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_coach_profile_id_fkey" FOREIGN KEY ("coach_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."suggested_tips"
    ADD CONSTRAINT "suggested_tips_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suggested_tips"
    ADD CONSTRAINT "suggested_tips_tip_id_fkey" FOREIGN KEY ("tip_id") REFERENCES "public"."tips_library"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tips_library"
    ADD CONSTRAINT "tips_library_created_by_profile_id_fkey" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."training_programs"
    ADD CONSTRAINT "training_programs_created_by_coach_id_fkey" FOREIGN KEY ("created_by_coach_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workout_sessions_log"
    ADD CONSTRAINT "workout_sessions_log_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_sessions_log"
    ADD CONSTRAINT "workout_sessions_log_program_session_id_fkey" FOREIGN KEY ("program_session_id") REFERENCES "public"."program_sessions"("id") ON DELETE SET NULL;



CREATE POLICY "Anyone can insert waitlist emails" ON "public"."waitlist_emails" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can read waitlist emails" ON "public"."waitlist_emails" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for all users" ON "public"."waitlist_emails" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public can view published articles" ON "public"."articles" FOR SELECT USING (("status" = 'published'::"text"));



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waitlist_emails" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calc_article_reading_time"() TO "anon";
GRANT ALL ON FUNCTION "public"."calc_article_reading_time"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calc_article_reading_time"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_invite_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_invite_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_invite_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_waitlist_emails_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_waitlist_emails_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_waitlist_emails_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."use_invite"("invite_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."use_invite"("invite_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."use_invite"("invite_token" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON TABLE "public"."body_measurements" TO "anon";
GRANT ALL ON TABLE "public"."body_measurements" TO "authenticated";
GRANT ALL ON TABLE "public"."body_measurements" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."checkin_answers" TO "anon";
GRANT ALL ON TABLE "public"."checkin_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."checkin_answers" TO "service_role";



GRANT ALL ON TABLE "public"."checkin_questions" TO "anon";
GRANT ALL ON TABLE "public"."checkin_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."checkin_questions" TO "service_role";



GRANT ALL ON TABLE "public"."checkin_templates" TO "anon";
GRANT ALL ON TABLE "public"."checkin_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."checkin_templates" TO "service_role";



GRANT ALL ON TABLE "public"."checkins" TO "anon";
GRANT ALL ON TABLE "public"."checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."checkins" TO "service_role";



GRANT ALL ON TABLE "public"."client_group_members" TO "anon";
GRANT ALL ON TABLE "public"."client_group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."client_group_members" TO "service_role";



GRANT ALL ON TABLE "public"."client_groups" TO "anon";
GRANT ALL ON TABLE "public"."client_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."client_groups" TO "service_role";



GRANT ALL ON TABLE "public"."client_journal_entries" TO "anon";
GRANT ALL ON TABLE "public"."client_journal_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."client_journal_entries" TO "service_role";



GRANT ALL ON TABLE "public"."client_program_assignments" TO "anon";
GRANT ALL ON TABLE "public"."client_program_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."client_program_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."client_settings" TO "anon";
GRANT ALL ON TABLE "public"."client_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."client_settings" TO "service_role";



GRANT ALL ON TABLE "public"."client_tag_links" TO "anon";
GRANT ALL ON TABLE "public"."client_tag_links" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tag_links" TO "service_role";



GRANT ALL ON TABLE "public"."client_tags" TO "anon";
GRANT ALL ON TABLE "public"."client_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tags" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."coach_notes" TO "anon";
GRANT ALL ON TABLE "public"."coach_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."coach_notes" TO "service_role";



GRANT ALL ON TABLE "public"."cycle_events" TO "anon";
GRANT ALL ON TABLE "public"."cycle_events" TO "authenticated";
GRANT ALL ON TABLE "public"."cycle_events" TO "service_role";



GRANT ALL ON TABLE "public"."cycle_phases" TO "anon";
GRANT ALL ON TABLE "public"."cycle_phases" TO "authenticated";
GRANT ALL ON TABLE "public"."cycle_phases" TO "service_role";



GRANT ALL ON TABLE "public"."cycle_symptoms" TO "anon";
GRANT ALL ON TABLE "public"."cycle_symptoms" TO "authenticated";
GRANT ALL ON TABLE "public"."cycle_symptoms" TO "service_role";



GRANT ALL ON TABLE "public"."daily_meal_assignments" TO "anon";
GRANT ALL ON TABLE "public"."daily_meal_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_meal_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."daily_readiness" TO "anon";
GRANT ALL ON TABLE "public"."daily_readiness" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_readiness" TO "service_role";



GRANT ALL ON TABLE "public"."event_participants" TO "anon";
GRANT ALL ON TABLE "public"."event_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."event_participants" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_categories" TO "anon";
GRANT ALL ON TABLE "public"."exercise_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_categories" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_media" TO "anon";
GRANT ALL ON TABLE "public"."exercise_media" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_media" TO "service_role";



GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";



GRANT ALL ON TABLE "public"."food_items" TO "anon";
GRANT ALL ON TABLE "public"."food_items" TO "authenticated";
GRANT ALL ON TABLE "public"."food_items" TO "service_role";



GRANT ALL ON TABLE "public"."group_program_assignments" TO "anon";
GRANT ALL ON TABLE "public"."group_program_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."group_program_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."invites" TO "anon";
GRANT ALL ON TABLE "public"."invites" TO "authenticated";
GRANT ALL ON TABLE "public"."invites" TO "service_role";



GRANT ALL ON TABLE "public"."meal_items" TO "anon";
GRANT ALL ON TABLE "public"."meal_items" TO "authenticated";
GRANT ALL ON TABLE "public"."meal_items" TO "service_role";



GRANT ALL ON TABLE "public"."meals" TO "anon";
GRANT ALL ON TABLE "public"."meals" TO "authenticated";
GRANT ALL ON TABLE "public"."meals" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notification_settings" TO "anon";
GRANT ALL ON TABLE "public"."notification_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_settings" TO "service_role";



GRANT ALL ON TABLE "public"."nutrition_periods" TO "anon";
GRANT ALL ON TABLE "public"."nutrition_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."nutrition_periods" TO "service_role";



GRANT ALL ON TABLE "public"."nutrition_plans" TO "anon";
GRANT ALL ON TABLE "public"."nutrition_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."nutrition_plans" TO "service_role";



GRANT ALL ON TABLE "public"."nutrition_targets" TO "anon";
GRANT ALL ON TABLE "public"."nutrition_targets" TO "authenticated";
GRANT ALL ON TABLE "public"."nutrition_targets" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_tasks" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."performance_tests" TO "anon";
GRANT ALL ON TABLE "public"."performance_tests" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_tests" TO "service_role";



GRANT ALL ON TABLE "public"."plan_features" TO "anon";
GRANT ALL ON TABLE "public"."plan_features" TO "authenticated";
GRANT ALL ON TABLE "public"."plan_features" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."profile_onboarding_task_status" TO "anon";
GRANT ALL ON TABLE "public"."profile_onboarding_task_status" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_onboarding_task_status" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."program_blocks" TO "anon";
GRANT ALL ON TABLE "public"."program_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."program_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."program_sessions" TO "anon";
GRANT ALL ON TABLE "public"."program_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."program_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."program_weeks" TO "anon";
GRANT ALL ON TABLE "public"."program_weeks" TO "authenticated";
GRANT ALL ON TABLE "public"."program_weeks" TO "service_role";



GRANT ALL ON TABLE "public"."session_exercises" TO "anon";
GRANT ALL ON TABLE "public"."session_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."session_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."set_logs" TO "anon";
GRANT ALL ON TABLE "public"."set_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."set_logs" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."suggested_tips" TO "anon";
GRANT ALL ON TABLE "public"."suggested_tips" TO "authenticated";
GRANT ALL ON TABLE "public"."suggested_tips" TO "service_role";



GRANT ALL ON TABLE "public"."tips_library" TO "anon";
GRANT ALL ON TABLE "public"."tips_library" TO "authenticated";
GRANT ALL ON TABLE "public"."tips_library" TO "service_role";



GRANT ALL ON TABLE "public"."training_programs" TO "anon";
GRANT ALL ON TABLE "public"."training_programs" TO "authenticated";
GRANT ALL ON TABLE "public"."training_programs" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist_emails" TO "anon";
GRANT ALL ON TABLE "public"."waitlist_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist_emails" TO "service_role";



GRANT ALL ON TABLE "public"."workout_sessions_log" TO "anon";
GRANT ALL ON TABLE "public"."workout_sessions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sessions_log" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


