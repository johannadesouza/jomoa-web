-- ============================================================
-- 004_app_config.sql – Remote config / feature flags (User DB)
-- Läsbar för anon så att appen kan hämta vid start utan inloggning.
-- ============================================================

CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value_json JSONB NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE app_config IS 'Global app config and feature flags. Read by app at startup.';

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Låt alla läsa (anon + authenticated) – skriv endast via service role / admin
CREATE POLICY "app_config_read_all"
  ON app_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed (valfritt). readiness_weights och tip_frequency för experimentation.
INSERT INTO app_config (key, value_json)
VALUES ('feature_flags', '{"show_morning_routine": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
-- Exempel: andra vikter för readiness (sleep 30%, energy 25%, stress 25%, soreness 20%)
-- INSERT INTO app_config (key, value_json) VALUES ('readiness_weights', '{"sleep_quality":30,"energy_level":25,"stress_level":25,"soreness":20}'::jsonb) ON CONFLICT (key) DO NOTHING;
-- Exempel: tip_frequency (antal dagar mellan tips) – använd via useFeatureFlags()["tip_frequency"]
-- INSERT INTO app_config (key, value_json) VALUES ('tip_frequency', '3'::jsonb) ON CONFLICT (key) DO NOTHING;
