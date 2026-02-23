-- JOMOA Mobile – client_calendar_entries
-- Användarplanering per dag: valt pass (override), anteckningar
-- Körordning: efter 001, 002, 003, 004, 005

-- ============================================================================
-- client_calendar_entries – pass per dag, anteckningar
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_calendar_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  program_session_id uuid REFERENCES public.program_sessions(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);

CREATE INDEX IF NOT EXISTS idx_client_calendar_entries_client_date
  ON public.client_calendar_entries(client_id, date);

-- RLS
ALTER TABLE public.client_calendar_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_calendar_entries_all_own" ON public.client_calendar_entries;
CREATE POLICY "client_calendar_entries_all_own" ON public.client_calendar_entries
  FOR ALL USING (client_id = public.jomoa_current_client_id());
