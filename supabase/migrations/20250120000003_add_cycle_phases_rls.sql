-- ============================================
-- CYCLE_PHASES TABLE RLS POLICIES
-- ============================================
ALTER TABLE public.cycle_phases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their cycle phases" ON public.cycle_phases;
DROP POLICY IF EXISTS "Coaches can view client cycle phases" ON public.cycle_phases;

-- Clients can view their own cycle phases
CREATE POLICY "Clients can view their cycle phases"
ON public.cycle_phases FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_phases.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can view their clients' cycle phases
CREATE POLICY "Coaches can view client cycle phases"
ON public.cycle_phases FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_phases.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- ============================================
-- CYCLE_SYMPTOMS TABLE RLS POLICIES
-- ============================================
ALTER TABLE public.cycle_symptoms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their cycle symptoms" ON public.cycle_symptoms;
DROP POLICY IF EXISTS "Coaches can view client cycle symptoms" ON public.cycle_symptoms;
DROP POLICY IF EXISTS "Clients can insert their cycle symptoms" ON public.cycle_symptoms;
DROP POLICY IF EXISTS "Clients can update their cycle symptoms" ON public.cycle_symptoms;

-- Clients can view their own cycle symptoms
CREATE POLICY "Clients can view their cycle symptoms"
ON public.cycle_symptoms FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_symptoms.client_id
    AND profile_id = auth.uid()
  )
);

-- Coaches can view their clients' cycle symptoms
CREATE POLICY "Coaches can view client cycle symptoms"
ON public.cycle_symptoms FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_symptoms.client_id
    AND primary_coach_id = auth.uid()
  )
);

-- Clients can insert their own cycle symptoms
CREATE POLICY "Clients can insert their cycle symptoms"
ON public.cycle_symptoms FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_symptoms.client_id
    AND profile_id = auth.uid()
  )
);

-- Clients can update their own cycle symptoms
CREATE POLICY "Clients can update their cycle symptoms"
ON public.cycle_symptoms FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_symptoms.client_id
    AND profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = cycle_symptoms.client_id
    AND profile_id = auth.uid()
  )
);

