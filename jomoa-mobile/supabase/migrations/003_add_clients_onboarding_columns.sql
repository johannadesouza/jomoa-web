-- Add onboarding & cycle columns to clients
-- Required for CompleteScreen to save onboarding data

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS primary_goal text,
  ADD COLUMN IF NOT EXISTS training_frequency int,
  ADD COLUMN IF NOT EXISTS training_days int[],
  ADD COLUMN IF NOT EXISTS cycle_length int,
  ADD COLUMN IF NOT EXISTS irregular_cycle bool,
  ADD COLUMN IF NOT EXISTS no_period bool,
  ADD COLUMN IF NOT EXISTS peri_menopause bool;
