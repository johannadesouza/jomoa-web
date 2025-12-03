-- Migration: Fix RLS policies for waitlist_emails table
-- This ensures that public inserts are allowed for the waitlist form

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow public inserts" ON public.waitlist_emails;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.waitlist_emails;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.waitlist_emails;

-- Create a policy that allows anyone to insert into waitlist_emails
-- This is needed for the public waitlist form
CREATE POLICY "Enable insert for all users" ON public.waitlist_emails
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Alternative: If you want to be more restrictive, you can use this instead:
-- CREATE POLICY "Enable insert for authenticated users" ON public.waitlist_emails
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'waitlist_emails';

