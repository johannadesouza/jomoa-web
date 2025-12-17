-- Fix RLS policies for clients table
-- This migration fixes potential issues with client access

-- First, drop existing policies
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;
DROP POLICY IF EXISTS "Coaches can view their clients" ON public.clients;

-- Recreate with simpler, more reliable logic

-- Clients can view their own record (simplified)
-- This should work as long as profile_id matches auth.uid()
CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Coaches can view their clients (simplified)
CREATE POLICY "Coaches can view their clients"
ON public.clients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
  AND primary_coach_id = auth.uid()
);

-- Verify RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

