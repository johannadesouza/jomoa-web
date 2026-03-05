-- ============================================================
-- 003_cycle_engine.sql – Dynamic cycle engine tables
-- Run in User DB (jfilxiqtecaxbwdsztaz)
-- ============================================================

-- ── cycle_logs ───────────────────────────────────────────────
-- One row per logged period start. De-duplicated by (client_id, start_date).
CREATE TABLE IF NOT EXISTS cycle_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, start_date)
);

ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycle_logs: owner only"
  ON cycle_logs FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- ── cycles ───────────────────────────────────────────────────
-- One row per cycle period. Opened when period is logged, closed when
-- the next period is logged. status: active | closed | delayed | irregular
CREATE TABLE IF NOT EXISTS cycles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  end_date     DATE,               -- NULL while active
  length_days  INT,                -- NULL while active
  status       TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','closed','delayed','irregular','unknown')),
  computed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cycles_client_active
  ON cycles (client_id, status) WHERE status = 'active';

ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycles: owner only"
  ON cycles FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- ── cycle_stats ───────────────────────────────────────────────
-- One row per user; updated after each new period log.
CREATE TABLE IF NOT EXISTS cycle_stats (
  client_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rolling_avg_days        FLOAT,
  rolling_std_dev_days    FLOAT NOT NULL DEFAULT 0,
  last_cycle_length_days  INT,
  last_period_start_date  DATE,
  last_updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cycle_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycle_stats: owner only"
  ON cycle_stats FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- ── user_cycle_settings ───────────────────────────────────────
-- Mode and threshold preferences per user.
CREATE TABLE IF NOT EXISTS user_cycle_settings (
  client_id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mode                           TEXT NOT NULL DEFAULT 'regular'
                                   CHECK (mode IN ('regular','missing_period','perimenopause')),
  missing_period_threshold_days  INT NOT NULL DEFAULT 60,
  overdue_soft_days              INT NOT NULL DEFAULT 3,
  overdue_hard_days              INT NOT NULL DEFAULT 7,
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_cycle_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cycle_settings: owner only"
  ON user_cycle_settings FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- ── perimenopause symptom columns (added to cycle_symptoms) ──
-- Adds bool symptom flags used in perimenopause mode.
-- Uses IF NOT EXISTS pattern for idempotency.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cycle_symptoms' AND column_name = 'hot_flashes'
  ) THEN
    ALTER TABLE cycle_symptoms ADD COLUMN hot_flashes BOOLEAN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cycle_symptoms' AND column_name = 'sleep_disruption'
  ) THEN
    ALTER TABLE cycle_symptoms ADD COLUMN sleep_disruption BOOLEAN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cycle_symptoms' AND column_name = 'joint_stiffness'
  ) THEN
    ALTER TABLE cycle_symptoms ADD COLUMN joint_stiffness BOOLEAN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cycle_symptoms' AND column_name = 'energy_crash'
  ) THEN
    ALTER TABLE cycle_symptoms ADD COLUMN energy_crash BOOLEAN;
  END IF;
END $$;
