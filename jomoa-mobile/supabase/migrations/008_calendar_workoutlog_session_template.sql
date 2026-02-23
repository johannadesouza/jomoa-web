-- JOMOA Mobile – session_template_id i calendar + workout_log
-- Körordning: efter 007
-- Tillåter att lägga till och logga fristående pass (session_templates)

ALTER TABLE public.client_calendar_entries
  ADD COLUMN IF NOT EXISTS session_template_id uuid REFERENCES public.session_templates(id) ON DELETE SET NULL;

ALTER TABLE public.workout_sessions_log
  ADD COLUMN IF NOT EXISTS session_template_id uuid REFERENCES public.session_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_client_calendar_session_template
  ON public.client_calendar_entries(session_template_id);

CREATE INDEX IF NOT EXISTS idx_workout_log_session_template
  ON public.workout_sessions_log(session_template_id);
