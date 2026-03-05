-- Presentation profile (kön) och tema – för inkluderande onboarding och anpassat innehåll.
-- presentation_profile: visuell/copy-anpassning (man/kvinna/annat).
-- presentation_theme: personlighetston (bold/soft/neutral).

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS presentation_profile text NOT NULL DEFAULT 'female'
    CHECK (presentation_profile IN ('male', 'female', 'neutral')),
  ADD COLUMN IF NOT EXISTS presentation_theme text NOT NULL DEFAULT 'neutral'
    CHECK (presentation_theme IN ('bold', 'soft', 'neutral'));

COMMENT ON COLUMN public.clients.presentation_profile IS 'Kön/presentation för anpassat innehåll och media (male/female/neutral).';
COMMENT ON COLUMN public.clients.presentation_theme IS 'Tema för ton och visuell stil (bold/soft/neutral).';
