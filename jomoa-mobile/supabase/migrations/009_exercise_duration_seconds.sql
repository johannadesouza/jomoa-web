-- JOMOA Mobile – duration_seconds for time-based exercises
-- Om duration_seconds > 0: tidsbestämd övning (t.ex. 55 sek)
-- Om duration_seconds IS NULL: set/reps-baserad övning (sets_planned, reps_planned)

ALTER TABLE public.session_exercises
  ADD COLUMN IF NOT EXISTS duration_seconds int;

ALTER TABLE public.session_template_exercises
  ADD COLUMN IF NOT EXISTS duration_seconds int;
