-- JOMOA Mobile – RLS policies
-- Klienter endast se/ändra egen data
-- Förutsättning: 001_jomoa_training_schema.sql är kördd

-- Helper: current user's client_id (null om ingen match)
CREATE OR REPLACE FUNCTION public.jomoa_current_client_id()
RETURNS uuid AS $$
  SELECT id FROM public.clients WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_insight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_symptoms ENABLE ROW LEVEL SECURITY;

-- clients: user sees/updates/inserts own row
DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
CREATE POLICY "clients_select_own" ON public.clients FOR SELECT USING (profile_id = auth.uid());
DROP POLICY IF EXISTS "clients_insert_own" ON public.clients;
CREATE POLICY "clients_insert_own" ON public.clients FOR INSERT WITH CHECK (profile_id = auth.uid());
DROP POLICY IF EXISTS "clients_update_own" ON public.clients;
CREATE POLICY "clients_update_own" ON public.clients FOR UPDATE USING (profile_id = auth.uid());

-- training_programs, exercises: template programs and exercise catalog – läsning för alla autentiserade
DROP POLICY IF EXISTS "programs_select" ON public.training_programs;
CREATE POLICY "programs_select" ON public.training_programs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "exercises_select" ON public.exercises;
CREATE POLICY "exercises_select" ON public.exercises FOR SELECT TO authenticated USING (true);

-- program_blocks, program_weeks, program_sessions, session_exercises: läsning via program
DROP POLICY IF EXISTS "blocks_select" ON public.program_blocks;
CREATE POLICY "blocks_select" ON public.program_blocks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "weeks_select" ON public.program_weeks;
CREATE POLICY "weeks_select" ON public.program_weeks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sessions_select" ON public.program_sessions;
CREATE POLICY "sessions_select" ON public.program_sessions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "session_exercises_select" ON public.session_exercises;
CREATE POLICY "session_exercises_select" ON public.session_exercises FOR SELECT TO authenticated USING (true);

-- client_program_assignments: client sees only own
DROP POLICY IF EXISTS "assignments_all_own" ON public.client_program_assignments;
CREATE POLICY "assignments_all_own" ON public.client_program_assignments
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- workout_sessions_log: client sees only own
DROP POLICY IF EXISTS "workout_log_all_own" ON public.workout_sessions_log;
CREATE POLICY "workout_log_all_own" ON public.workout_sessions_log
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- set_logs: via workout_session_log
DROP POLICY IF EXISTS "set_logs_all_via_workout" ON public.set_logs;
CREATE POLICY "set_logs_all_via_workout" ON public.set_logs
  FOR ALL USING (
    workout_session_log_id IN (
      SELECT id FROM public.workout_sessions_log WHERE client_id = public.jomoa_current_client_id()
    )
  );

-- daily_readiness: client only
DROP POLICY IF EXISTS "readiness_all_own" ON public.daily_readiness;
CREATE POLICY "readiness_all_own" ON public.daily_readiness
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- daily_insight_log: client only
DROP POLICY IF EXISTS "insight_all_own" ON public.daily_insight_log;
CREATE POLICY "insight_all_own" ON public.daily_insight_log
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- cycle_events, cycle_phases, cycle_symptoms: client only
DROP POLICY IF EXISTS "cycle_events_all_own" ON public.cycle_events;
CREATE POLICY "cycle_events_all_own" ON public.cycle_events
  FOR ALL USING (client_id = public.jomoa_current_client_id());
DROP POLICY IF EXISTS "cycle_phases_all_own" ON public.cycle_phases;
CREATE POLICY "cycle_phases_all_own" ON public.cycle_phases
  FOR ALL USING (client_id = public.jomoa_current_client_id());
DROP POLICY IF EXISTS "cycle_symptoms_all_own" ON public.cycle_symptoms;
CREATE POLICY "cycle_symptoms_all_own" ON public.cycle_symptoms
  FOR ALL USING (client_id = public.jomoa_current_client_id());
