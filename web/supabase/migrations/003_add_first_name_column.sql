-- Migration: Add first_name column to waitlist_emails table
-- This adds the first_name column if it doesn't already exist

-- Add first_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'waitlist_emails' 
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.waitlist_emails ADD COLUMN first_name TEXT;
    RAISE NOTICE 'Added first_name column to waitlist_emails table';
  ELSE
    RAISE NOTICE 'first_name column already exists in waitlist_emails table';
  END IF;
END $$;

