-- Store user's onboarding choice: cycle_only | training_only | both
-- Used to hide training tab and focus on cycle for cycle_only users.
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS onboarding_path text
  CHECK (onboarding_path IS NULL OR onboarding_path IN ('cycle_only', 'training_only', 'both'));

COMMENT ON COLUMN clients.onboarding_path IS 'Onboarding choice: cycle_only, training_only, or both. Drives UI (e.g. hide Train tab for cycle_only).';
