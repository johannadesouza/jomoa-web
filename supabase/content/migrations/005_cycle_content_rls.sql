-- ============================================================================
-- RLS för cykel-content-tabeller
-- Kör i Content DB (fohthpiyrxeyezjjvcva)
-- ============================================================================

ALTER TABLE public.cycle_phases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_training_tips  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_wellness_tips  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_insights   ENABLE ROW LEVEL SECURITY;

-- Publikt läsbart för alla (anon + authenticated)
CREATE POLICY "cycle_phases_read_all"
  ON public.cycle_phases FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "phase_training_tips_read_all"
  ON public.phase_training_tips FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "phase_wellness_tips_read_all"
  ON public.phase_wellness_tips FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "readiness_insights_read_all"
  ON public.readiness_insights FOR SELECT TO anon, authenticated USING (true);
