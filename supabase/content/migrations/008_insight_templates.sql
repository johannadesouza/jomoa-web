-- ============================================================================
-- Content DB – insight_templates (daglig insight-titel, body, actions)
-- insightService använder getInsightTemplateKey() och hämtar copy här med fallback till kod.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.insight_templates (
  template_key text PRIMARY KEY,
  title        text NOT NULL,
  body         text NOT NULL,
  actions      text[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_insight_templates_key ON public.insight_templates(template_key);

ALTER TABLE public.insight_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insight_templates_read_all"
  ON public.insight_templates FOR SELECT TO anon, authenticated USING (true);

-- Seed med nuvarande texter från insightService (kan ändras i admin)
INSERT INTO public.insight_templates (template_key, title, body, actions) VALUES
  ('menstruation_low', 'Vila och lätt rörelse',
   'Din cykel indikerar mensfas. Fokusera på rörelse som känns bra – promenad, stretching eller lätt styrka. Din readiness är låg – överväg lättare pass eller extra vila.',
   ARRAY['Lyssna på kroppen – justera efter symtom', 'Minska volym med 10–20%', 'Överväg stretching eller promenad']),
  ('menstruation_default', 'Försiktig träning i mensfas',
   'Din cykel indikerar mensfas. Fokusera på rörelse som känns bra – promenad, stretching eller lätt styrka.',
   ARRAY['Lyssna på kroppen – justera efter symtom']),
  ('follicular_high', 'Bra dag för intensiv träning',
   'Follikulär fas ger ofta mer energi. Bra tillfälle för tyngre lyft eller högre intensitet. Bra readiness – du kan pusha lite mer idag.',
   ARRAY['Öka intensiteten lite', 'Prova en ny övning']),
  ('follicular_medium', 'Bra dag för intensiv träning',
   'Follikulär fas ger ofta mer energi. Bra tillfälle för tyngre lyft eller högre intensitet.',
   ARRAY['Följ din vanliga plan']),
  ('follicular_low', 'Bra dag för intensiv träning',
   'Follikulär fas ger ofta mer energi. Din readiness är låg – överväg lättare pass eller extra vila.',
   ARRAY['Minska volym med 10–20%', 'Överväg stretching eller promenad']),
  ('ovulation_high', 'Peak energi – utmana dig',
   'Kring ovulation är energin ofta hög. Utmana dig med hög intensitet eller nya övningar. Bra readiness – du kan pusha lite mer idag.',
   ARRAY['Öka intensiteten lite', 'Prova en ny övning']),
  ('ovulation_medium', 'Peak energi – utmana dig',
   'Kring ovulation är energin ofta hög. Utmana dig med hög intensitet eller nya övningar.',
   ARRAY['Följ din vanliga plan']),
  ('ovulation_low', 'Peak energi – utmana dig',
   'Kring ovulation är energin ofta hög. Din readiness är låg – överväg lättare pass eller extra vila.',
   ARRAY['Minska volym med 10–20%', 'Överväg stretching eller promenad']),
  ('luteal_low', 'Lugnare pass – lyssna på kroppen',
   'I lutealfas kan energin variera. Justera volym och intensitet efter hur du mår. Din readiness är låg – överväg lättare pass eller extra vila.',
   ARRAY['Lyssna på kroppen', 'Behåll teknikfokus', 'Minska volym med 10–20%']),
  ('luteal_default', 'Stabil träning i lutealfas',
   'I lutealfas kan energin variera. Justera volym och intensitet efter hur du mår.',
   ARRAY['Lyssna på kroppen', 'Behåll teknikfokus']),
  ('no_phase_low', 'Prioritera återhämtning idag',
   'Din readiness är låg – överväg lättare pass eller extra vila.',
   ARRAY['Minska volym med 10–20%', 'Överväg stretching eller promenad']),
  ('no_phase_high', 'Redo för ett starkt pass',
   'Bra readiness – du kan pusha lite mer idag.',
   ARRAY['Öka intensiteten lite', 'Prova en ny övning']),
  ('default', 'Dagens träningsrekommendation',
   'Logga readiness för personliga rekommendationer.',
   ARRAY['Följ din vanliga plan'])
ON CONFLICT (template_key) DO NOTHING;
