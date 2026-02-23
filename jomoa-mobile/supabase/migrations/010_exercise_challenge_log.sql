-- JOMOA Mobile – exercise challenge feedback (once per exercise)
-- Replaces per-set RPE with "Hur utmanande var övningen totalt?"

CREATE TABLE IF NOT EXISTS public.exercise_challenge_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_log_id uuid NOT NULL REFERENCES public.workout_sessions_log(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  challenge_level text NOT NULL CHECK (challenge_level IN ('easy', 'ok', 'hard')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_challenge_workout ON public.exercise_challenge_log(workout_session_log_id);
CREATE INDEX IF NOT EXISTS idx_exercise_challenge_exercise ON public.exercise_challenge_log(exercise_id);

-- RLS: client can only access via their workout_sessions_log
ALTER TABLE public.exercise_challenge_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exercise_challenge_all_via_workout" ON public.exercise_challenge_log;
CREATE POLICY "exercise_challenge_all_via_workout" ON public.exercise_challenge_log
  FOR ALL USING (
    workout_session_log_id IN (
      SELECT id FROM public.workout_sessions_log WHERE client_id = public.jomoa_current_client_id()
    )
  );
