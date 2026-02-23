-- JOMOA Mobile – Training schema
-- Körordning: clients → programs → assignments → workout logs → daily → cycle
-- Förutsättning: Supabase Auth (auth.users) är aktiverat

-- ============================================================================
-- 1. clients
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  onboarding_stage text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients(profile_id);

-- ============================================================================
-- 2. training_programs, program_blocks, program_weeks, program_sessions,
--    exercises, session_exercises
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_goal text,
  target_duration_weeks int,
  is_template bool NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.program_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  weeks_count int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  block_id uuid REFERENCES public.program_blocks(id) ON DELETE SET NULL,
  week_number int NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_video_url text,
  primary_muscle_group text,
  equipment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.program_weeks(id) ON DELETE CASCADE,
  name text NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  focus text,
  created_at timestamptz NOT NULL DEFAULT now()
);

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
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. client_program_assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_program_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_client_active ON public.client_program_assignments(client_id) WHERE is_active = true;

-- ============================================================================
-- 4. workout_sessions_log, set_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  program_session_id uuid REFERENCES public.program_sessions(id) ON DELETE SET NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  overall_rpe numeric CHECK (overall_rpe IS NULL OR (overall_rpe >= 1 AND overall_rpe <= 10)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_log_client_date ON public.workout_sessions_log(client_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_log_client_session_date ON public.workout_sessions_log(client_id, program_session_id, date);

CREATE TABLE IF NOT EXISTS public.set_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_log_id uuid NOT NULL REFERENCES public.workout_sessions_log(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number int NOT NULL,
  reps int NOT NULL DEFAULT 0,
  weight numeric,
  rpe numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. daily_readiness, daily_insight_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_hours numeric,
  sleep_quality numeric,
  stress_level numeric,
  energy_level numeric,
  soreness numeric,
  readiness_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);

CREATE TABLE IF NOT EXISTS public.daily_insight_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  phase text,
  insight_title text NOT NULL,
  insight_body text,
  actions jsonb NOT NULL DEFAULT '[]',
  tags jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);

-- ============================================================================
-- 6. cycle_events, cycle_phases, cycle_symptoms
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  event_type text NOT NULL,
  source text NOT NULL DEFAULT 'client',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cycle_events_client_type ON public.cycle_events(client_id, event_type);

CREATE TABLE IF NOT EXISTS public.cycle_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  phase text NOT NULL,
  source text NOT NULL DEFAULT 'calculated',
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cycle_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  cramps_severity int,
  bleeding_level int,
  mood text,
  energy_level int,
  sleep_quality int,
  stress_level int,
  cravings text,
  other_symptoms text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);
