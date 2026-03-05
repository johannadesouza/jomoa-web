-- ============================================================================
-- Content DB – app_copy (profilvarierande apptexter)
-- key + locale + profile (male/female/neutral). Fallback: profil sedan neutral.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_copy (
  key text NOT NULL,
  locale text NOT NULL,
  profile text NOT NULL CHECK (profile IN ('male', 'female', 'neutral')),
  value text NOT NULL,
  PRIMARY KEY (key, locale, profile)
);

CREATE INDEX IF NOT EXISTS idx_app_copy_locale_profile ON public.app_copy(locale, profile);

ALTER TABLE public.app_copy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_copy_read_all"
  ON public.app_copy FOR SELECT TO anon, authenticated USING (true);

-- Seed: welcome_subtitle, dashboard_hero_line, default_insight_title (sv)
INSERT INTO public.app_copy (key, locale, profile, value)
VALUES
  ('welcome_subtitle', 'sv', 'neutral', 'Din personliga träningscoach som anpassar sig efter dig'),
  ('welcome_subtitle', 'sv', 'female', 'Din personliga träningscoach som anpassar sig efter dig och din cykel'),
  ('welcome_subtitle', 'sv', 'male', 'Din personliga träningscoach som anpassar sig efter dig'),
  ('dashboard_hero_line', 'sv', 'neutral', 'Din dag, din träning'),
  ('dashboard_hero_line', 'sv', 'female', 'Din dag, din träning'),
  ('dashboard_hero_line', 'sv', 'male', 'Din dag, din träning'),
  ('default_insight_title', 'sv', 'neutral', 'Dagens träningsrekommendation'),
  ('default_insight_title', 'sv', 'female', 'Dagens träningsrekommendation'),
  ('default_insight_title', 'sv', 'male', 'Dagens träningsrekommendation')
ON CONFLICT (key, locale, profile) DO NOTHING;
