-- client_day_notes – anteckningar per dag (Övrigt + Träning i kalendern)
-- Stödjer valfri tid för visning i tidsordning

CREATE TABLE IF NOT EXISTS public.client_day_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  category text NOT NULL DEFAULT 'övrigt', -- 'övrigt' | 'träning'
  text text NOT NULL,
  time_of_day time,                         -- valfri tid, t.ex. 19:00
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_day_notes_client_date ON public.client_day_notes(client_id, date);

-- RLS
ALTER TABLE public.client_day_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "day_notes_all_own" ON public.client_day_notes;
CREATE POLICY "day_notes_all_own" ON public.client_day_notes
  FOR ALL USING (client_id = public.jomoa_current_client_id());
