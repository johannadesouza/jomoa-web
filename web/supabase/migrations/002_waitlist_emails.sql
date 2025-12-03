-- Migration: Create waitlist_emails table if it doesn't exist
-- This ensures the table has the correct structure for the waitlist form

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.waitlist_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_emails_email ON public.waitlist_emails(email);

-- Enable Row Level Security
ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public inserts" ON public.waitlist_emails;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.waitlist_emails;

-- Create policy to allow public inserts (for waitlist form)
-- This allows anyone to add themselves to the waitlist
CREATE POLICY "Allow public inserts" ON public.waitlist_emails
  FOR INSERT
  WITH CHECK (true);

-- Optional: Create policy to allow reads (if you want to show waitlist count, etc.)
-- Uncomment if needed:
-- CREATE POLICY "Allow public reads" ON public.waitlist_emails
--   FOR SELECT
--   USING (true);

-- Add comment to table
COMMENT ON TABLE public.waitlist_emails IS 'Stores email addresses from the waitlist form';

