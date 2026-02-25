-- ============================================================================
-- Content DB – schema
-- Kör detta i det NYA Supabase-projektet (Content DB).
-- Innehåller INGA persondata-tabeller.
-- ============================================================================

-- ─────────────────────────────────────────────
-- exercises
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_video_url text,
  primary_muscle_group text,
  equipment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_name ON public.exercises(name);

-- ─────────────────────────────────────────────
-- training_programs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_goal text,
  target_duration_weeks int,
  is_template bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- program_blocks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  weeks_count int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_blocks_program ON public.program_blocks(program_id);

-- ─────────────────────────────────────────────
-- program_weeks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  block_id uuid REFERENCES public.program_blocks(id) ON DELETE SET NULL,
  week_number int NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_weeks_program ON public.program_weeks(program_id);

-- ─────────────────────────────────────────────
-- program_sessions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.program_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.program_weeks(id) ON DELETE CASCADE,
  name text NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  focus text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_sessions_week ON public.program_sessions(week_id);

-- ─────────────────────────────────────────────
-- session_exercises
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.program_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  sets_planned int NOT NULL DEFAULT 3,
  reps_planned text NOT NULL DEFAULT '8-12',
  rest_seconds int,
  intensity_type text,
  intensity_value numeric,
  duration_seconds int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON public.session_exercises(session_id);

-- ─────────────────────────────────────────────
-- session_templates (fristående pass)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  focus text NOT NULL,
  description text,
  duration_minutes int,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- session_template_exercises
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_template_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_template_id uuid NOT NULL REFERENCES public.session_templates(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  sets_planned int NOT NULL DEFAULT 3,
  reps_planned text NOT NULL DEFAULT '8-12',
  rest_seconds int,
  duration_seconds int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_template_exercises_template
  ON public.session_template_exercises(session_template_id);

-- ─────────────────────────────────────────────
-- articles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  category text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  locale text NOT NULL DEFAULT 'sv' CHECK (locale IN ('sv', 'en')),
  reading_time_minutes int,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_status_locale ON public.articles(status, locale);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_locale ON public.articles(locale);

-- Trigger: auto-beräkna lästid vid INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.calc_article_reading_time()
RETURNS TRIGGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  IF NEW.content IS NULL OR TRIM(NEW.content) = '' THEN
    RETURN NEW;
  END IF;
  SELECT COALESCE(
    array_length(
      array_remove(regexp_split_to_array(TRIM(NEW.content), E'\\s+'), ''),
      1
    ),
    0
  ) INTO word_count;
  IF word_count IS NULL THEN word_count := 0; END IF;
  NEW.reading_time_minutes := GREATEST(1, CEIL(word_count::NUMERIC / 220.0)::INTEGER);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_calc_reading_time_trigger ON public.articles;
CREATE TRIGGER articles_calc_reading_time_trigger
  BEFORE INSERT OR UPDATE OF content ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.calc_article_reading_time();

-- ─────────────────────────────────────────────
-- tips_library (framtida – placeholder)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tips_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  locale text NOT NULL DEFAULT 'sv',
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
