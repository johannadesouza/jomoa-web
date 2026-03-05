-- ============================================================================
-- User DB migration: lägg till photo_url på body_measurements
-- Kör i USER DB (jfilxiqtecaxbwdsztaz) SQL Editor
-- ============================================================================

ALTER TABLE public.body_measurements
  ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.body_measurements.photo_url IS
  'Public URL till progress-foto i Supabase Storage (bucket: progress-photos). NULL = inget foto loggat.';
