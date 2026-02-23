-- JOMOA Mobile – session_templates (fristående pass, ej kopplade till program)
-- Körordning: efter 006
-- Används för "Utforska pass efter stil" – pass användare kan lägga till och köra själva

-- ============================================================================
-- session_templates – fristående pass att utforska per stil
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  focus text NOT NULL,
  description text,
  duration_minutes int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_template_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_template_id uuid NOT NULL REFERENCES public.session_templates(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  sets_planned int NOT NULL DEFAULT 3,
  reps_planned text NOT NULL DEFAULT '8-12',
  rest_seconds int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_template_exercises_template
  ON public.session_template_exercises(session_template_id);

-- RLS – läsning för alla autentiserade
ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_template_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_templates_select" ON public.session_templates;
CREATE POLICY "session_templates_select" ON public.session_templates
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "session_template_exercises_select" ON public.session_template_exercises;
CREATE POLICY "session_template_exercises_select" ON public.session_template_exercises
  FOR SELECT TO authenticated USING (true);
