-- JOMOA Mobile – RLS för client_favorites, body_measurements, client_goals, client_awards
-- Förutsättning: 004_client_favorites_body_measurements_goals_awards.sql är kördd
-- Säkerställ att jomoa_current_client_id finns (definieras i 002, men skapas här om saknas)

CREATE OR REPLACE FUNCTION public.jomoa_current_client_id()
RETURNS uuid AS $$
  SELECT id FROM public.clients WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE public.client_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_awards ENABLE ROW LEVEL SECURITY;

-- client_favorites: client sees only own
DROP POLICY IF EXISTS "client_favorites_all_own" ON public.client_favorites;
CREATE POLICY "client_favorites_all_own" ON public.client_favorites
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- body_measurements: client sees only own
DROP POLICY IF EXISTS "body_measurements_all_own" ON public.body_measurements;
CREATE POLICY "body_measurements_all_own" ON public.body_measurements
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- client_goals: client sees only own
DROP POLICY IF EXISTS "client_goals_all_own" ON public.client_goals;
CREATE POLICY "client_goals_all_own" ON public.client_goals
  FOR ALL USING (client_id = public.jomoa_current_client_id());

-- client_awards: client sees only own
DROP POLICY IF EXISTS "client_awards_all_own" ON public.client_awards;
CREATE POLICY "client_awards_all_own" ON public.client_awards
  FOR ALL USING (client_id = public.jomoa_current_client_id());
