-- Add comprehensive RLS policies for production readiness
-- This migration adds security policies for all critical tables

-- ============================================
-- CLIENTS TABLE
-- ============================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Coaches can view their clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;
DROP POLICY IF EXISTS "Coaches can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Coaches can update their clients" ON public.clients;

-- Coaches can view their own clients
CREATE POLICY "Coaches can view their clients"
ON public.clients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
    AND (primary_coach_id = auth.uid() OR id IN (
      SELECT profile_id FROM public.clients WHERE primary_coach_id = auth.uid()
    ))
  )
  OR primary_coach_id = auth.uid()
);

-- Clients can view their own record
CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
);

-- Coaches can insert clients
CREATE POLICY "Coaches can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
  AND primary_coach_id = auth.uid()
);

-- Coaches can update their clients
CREATE POLICY "Coaches can update their clients"
ON public.clients FOR UPDATE
TO authenticated
USING (primary_coach_id = auth.uid())
WITH CHECK (primary_coach_id = auth.uid());

-- ============================================
-- TRAINING_PROGRAMS TABLE
-- ============================================
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Coaches can view their programs" ON public.training_programs;
DROP POLICY IF EXISTS "Clients can view assigned programs" ON public.training_programs;
DROP POLICY IF EXISTS "Coaches can insert programs" ON public.training_programs;
DROP POLICY IF EXISTS "Coaches can update their programs" ON public.training_programs;

-- Coaches can view their own programs
CREATE POLICY "Coaches can view their programs"
ON public.training_programs FOR SELECT
TO authenticated
USING (
  created_by_coach_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.client_program_assignments cpa
    JOIN public.clients c ON c.id = cpa.client_id
    WHERE cpa.program_id = training_programs.id
    AND c.primary_coach_id = auth.uid()
  )
);

-- Clients can view programs assigned to them
CREATE POLICY "Clients can view assigned programs"
ON public.training_programs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_program_assignments cpa
    JOIN public.clients c ON c.id = cpa.client_id
    WHERE cpa.program_id = training_programs.id
    AND c.profile_id = auth.uid()
  )
);

-- Coaches can insert programs
CREATE POLICY "Coaches can insert programs"
ON public.training_programs FOR INSERT
TO authenticated
WITH CHECK (
  created_by_coach_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);

-- Coaches can update their programs
CREATE POLICY "Coaches can update their programs"
ON public.training_programs FOR UPDATE
TO authenticated
USING (created_by_coach_id = auth.uid())
WITH CHECK (created_by_coach_id = auth.uid());

-- ============================================
-- WORKOUT_SESSIONS_LOG TABLE
-- ============================================
ALTER TABLE public.workout_sessions_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their workout logs" ON public.workout_sessions_log;
DROP POLICY IF EXISTS "Coaches can view client workout logs" ON public.workout_sessions_log;
DROP POLICY IF EXISTS "Clients can insert workout logs" ON public.workout_sessions_log;
DROP POLICY IF EXISTS "Clients can update their workout logs" ON public.workout_sessions_log;
DROP POLICY IF EXISTS "Coaches can update client workout logs" ON public.workout_sessions_log;

-- Clients can view their own workout logs
CREATE POLICY "Clients can view their workout logs"
ON public.workout_sessions_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = workout_sessions_log.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can view their clients' workout logs
CREATE POLICY "Coaches can view client workout logs"
ON public.workout_sessions_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = workout_sessions_log.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- Clients can insert their own workout logs
CREATE POLICY "Clients can insert workout logs"
ON public.workout_sessions_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = workout_sessions_log.client_id
    AND profile_id = auth.uid()
  )
);

-- Clients can update their own workout logs
CREATE POLICY "Clients can update their workout logs"
ON public.workout_sessions_log FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = workout_sessions_log.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can update their clients' workout logs (for comments)
CREATE POLICY "Coaches can update client workout logs"
ON public.workout_sessions_log FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = workout_sessions_log.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- ============================================
-- DAILY_READINESS TABLE
-- ============================================
ALTER TABLE public.daily_readiness ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their readiness" ON public.daily_readiness;
DROP POLICY IF EXISTS "Coaches can view client readiness" ON public.daily_readiness;
DROP POLICY IF EXISTS "Clients can insert readiness" ON public.daily_readiness;
DROP POLICY IF EXISTS "Clients can update their readiness" ON public.daily_readiness;

-- Clients can view their own readiness
CREATE POLICY "Clients can view their readiness"
ON public.daily_readiness FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = daily_readiness.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can view their clients' readiness
CREATE POLICY "Coaches can view client readiness"
ON public.daily_readiness FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = daily_readiness.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- Clients can insert their own readiness
CREATE POLICY "Clients can insert readiness"
ON public.daily_readiness FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = daily_readiness.client_id
    AND profile_id = auth.uid()
  )
);

-- Clients can update their own readiness
CREATE POLICY "Clients can update their readiness"
ON public.daily_readiness FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = daily_readiness.client_id
    AND profile_id = auth.uid()
  )
);

-- ============================================
-- CYCLE_EVENTS TABLE
-- ============================================
ALTER TABLE public.cycle_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their cycle events" ON public.cycle_events;
DROP POLICY IF EXISTS "Coaches can view client cycle events" ON public.cycle_events;
DROP POLICY IF EXISTS "Clients can insert cycle events" ON public.cycle_events;

-- Clients can view their own cycle events
CREATE POLICY "Clients can view their cycle events"
ON public.cycle_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_events.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can view their clients' cycle events
CREATE POLICY "Coaches can view client cycle events"
ON public.cycle_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_events.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- Clients can insert their own cycle events
CREATE POLICY "Clients can insert cycle events"
ON public.cycle_events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_events.client_id
    AND profile_id = auth.uid()
  )
);

-- ============================================
-- CLIENT_PROGRAM_ASSIGNMENTS TABLE
-- ============================================
ALTER TABLE public.client_program_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Coaches can view client assignments" ON public.client_program_assignments;
DROP POLICY IF EXISTS "Clients can view their assignments" ON public.client_program_assignments;
DROP POLICY IF EXISTS "Coaches can insert assignments" ON public.client_program_assignments;
DROP POLICY IF EXISTS "Coaches can update assignments" ON public.client_program_assignments;

-- Coaches can view assignments for their clients
CREATE POLICY "Coaches can view client assignments"
ON public.client_program_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = client_program_assignments.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- Clients can view their own assignments
CREATE POLICY "Clients can view their assignments"
ON public.client_program_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = client_program_assignments.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can insert assignments
CREATE POLICY "Coaches can insert assignments"
ON public.client_program_assignments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = client_program_assignments.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- Coaches can update assignments
CREATE POLICY "Coaches can update assignments"
ON public.client_program_assignments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = client_program_assignments.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- ============================================
-- EXERCISES TABLE
-- ============================================
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view global exercises" ON public.exercises;
DROP POLICY IF EXISTS "Coaches can view their exercises" ON public.exercises;
DROP POLICY IF EXISTS "Coaches can insert exercises" ON public.exercises;
DROP POLICY IF EXISTS "Coaches can update their exercises" ON public.exercises;

-- Everyone can view global exercises
CREATE POLICY "Anyone can view global exercises"
ON public.exercises FOR SELECT
TO authenticated
USING (is_global = true);

-- Coaches can view their own exercises
CREATE POLICY "Coaches can view their exercises"
ON public.exercises FOR SELECT
TO authenticated
USING (
  created_by_profile_id = auth.uid()
  OR is_global = true
);

-- Coaches can insert exercises
CREATE POLICY "Coaches can insert exercises"
ON public.exercises FOR INSERT
TO authenticated
WITH CHECK (
  created_by_profile_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);

-- Coaches can update their exercises
CREATE POLICY "Coaches can update their exercises"
ON public.exercises FOR UPDATE
TO authenticated
USING (created_by_profile_id = auth.uid())
WITH CHECK (created_by_profile_id = auth.uid());

-- ============================================
-- TIPS_LIBRARY TABLE
-- ============================================
ALTER TABLE public.tips_library ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active tips" ON public.tips_library;
DROP POLICY IF EXISTS "Coaches can insert tips" ON public.tips_library;

-- Everyone can view active tips
CREATE POLICY "Anyone can view active tips"
ON public.tips_library FOR SELECT
TO authenticated
USING (is_active = true);

-- Coaches can insert tips
CREATE POLICY "Coaches can insert tips"
ON public.tips_library FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);

-- ============================================
-- ONBOARDING_TASKS TABLE
-- ============================================
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active onboarding tasks" ON public.onboarding_tasks;

-- Everyone can view active onboarding tasks
CREATE POLICY "Anyone can view active onboarding tasks"
ON public.onboarding_tasks FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================
-- PROFILE_ONBOARDING_TASK_STATUS TABLE
-- ============================================
ALTER TABLE public.profile_onboarding_task_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their task status" ON public.profile_onboarding_task_status;
DROP POLICY IF EXISTS "Users can manage their task status" ON public.profile_onboarding_task_status;

-- Users can view their own task status
CREATE POLICY "Users can view their task status"
ON public.profile_onboarding_task_status FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Users can insert/update their own task status
CREATE POLICY "Users can manage their task status"
ON public.profile_onboarding_task_status FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

