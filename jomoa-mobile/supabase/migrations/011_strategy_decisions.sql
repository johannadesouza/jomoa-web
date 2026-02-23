-- JOMOA Mobile – strategy decisions (user accept/reject of suggested adjustments)
-- For learning: system adjusts future suggestions based on acceptance rate

CREATE TABLE IF NOT EXISTS public.strategy_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  is_standalone boolean NOT NULL DEFAULT false,
  suggested_volume_modifier numeric NOT NULL,
  accepted boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strategy_decisions_client ON public.strategy_decisions(client_id);
CREATE INDEX IF NOT EXISTS idx_strategy_decisions_created ON public.strategy_decisions(created_at DESC);

ALTER TABLE public.strategy_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "strategy_decisions_all_own" ON public.strategy_decisions;
CREATE POLICY "strategy_decisions_all_own" ON public.strategy_decisions
  FOR ALL USING (client_id = public.jomoa_current_client_id());
