-- Säkerställ att body_measurements har alla kolumner som appen förväntar sig
-- Behövs om tabellen skapades utan dem eller om schema cache varit inaktuell (PGRST204)

ALTER TABLE public.body_measurements
  ADD COLUMN IF NOT EXISTS measurements jsonb NOT NULL DEFAULT '{}';

ALTER TABLE public.body_measurements
  ADD COLUMN IF NOT EXISTS note text;

ALTER TABLE public.body_measurements
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- UNIQUE(client_id, date) krävs för upsert onConflict (42P10)
CREATE UNIQUE INDEX IF NOT EXISTS body_measurements_client_id_date_key
  ON public.body_measurements (client_id, date);
