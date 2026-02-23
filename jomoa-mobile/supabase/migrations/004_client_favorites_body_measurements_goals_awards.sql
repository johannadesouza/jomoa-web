-- JOMOA Mobile – Favoritpass, mätningar, mål, utmärkelser
-- Körordning: efter 001, 002, 003
-- Förutsättning: jomoa_current_client_id() finns från 002

-- ============================================================================
-- 1. client_favorites – favoritpass (heart-ikon)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  program_session_id uuid NOT NULL REFERENCES public.program_sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, program_session_id)
);

CREATE INDEX IF NOT EXISTS idx_client_favorites_client ON public.client_favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_client_favorites_session ON public.client_favorites(program_session_id);

-- ============================================================================
-- 2. body_measurements – mätningslogg (midja, lår, bröst, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  measurements jsonb NOT NULL DEFAULT '{}',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);

-- measurements: { "waist": 72, "hip": 95, "thigh": 55, "chest": 88, "weight": 68, ... }
CREATE INDEX IF NOT EXISTS idx_body_measurements_client_date ON public.body_measurements(client_id, date);

-- ============================================================================
-- 3. client_goals – mål (träning, nutrition, event, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  description text,
  target_value text,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_goals_client ON public.client_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_client_goals_active ON public.client_goals(client_id) WHERE is_active = true;

-- ============================================================================
-- 4. client_awards – badges/utmärkelser (streak, antal pass, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  award_type text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(client_id, award_type)
);

-- award_type: streak_7, streak_14, sessions_10, first_workout, etc.
CREATE INDEX IF NOT EXISTS idx_client_awards_client ON public.client_awards(client_id);
