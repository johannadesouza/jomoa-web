-- ============================================================================
-- Content DB – RLS policies
--
-- SÄKERHETSPRINCIP:
--   READ:  public (anon + authenticated) – content är öppet
--   WRITE: kräver service_role (admin-appen server-side)
--
-- Klienter med anon key kan ALDRIG skriva till Content DB.
-- Admin-appen använder CONTENT_SERVICE_ROLE_KEY server-side och
-- kringgår därmed RLS för writes. Mobilappen och web/ har aldrig
-- tillgång till service_role-nyckeln.
-- ============================================================================

-- Aktivera RLS på alla content-tabeller
ALTER TABLE public.exercises                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_blocks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_weeks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_templates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips_library              ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- exercises – public read
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "exercises_read_all" ON public.exercises;
CREATE POLICY "exercises_read_all" ON public.exercises
  FOR SELECT TO anon, authenticated USING (true);

-- ─────────────────────────────────────────────
-- training_programs – public read (is_template = true)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "programs_read_all" ON public.training_programs;
CREATE POLICY "programs_read_all" ON public.training_programs
  FOR SELECT TO anon, authenticated USING (true);

-- ─────────────────────────────────────────────
-- program_blocks, program_weeks, program_sessions, session_exercises
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "blocks_read_all" ON public.program_blocks;
CREATE POLICY "blocks_read_all" ON public.program_blocks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "weeks_read_all" ON public.program_weeks;
CREATE POLICY "weeks_read_all" ON public.program_weeks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sessions_read_all" ON public.program_sessions;
CREATE POLICY "sessions_read_all" ON public.program_sessions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "session_exercises_read_all" ON public.session_exercises;
CREATE POLICY "session_exercises_read_all" ON public.session_exercises
  FOR SELECT TO anon, authenticated USING (true);

-- ─────────────────────────────────────────────
-- session_templates + session_template_exercises
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "session_templates_read_all" ON public.session_templates;
CREATE POLICY "session_templates_read_all" ON public.session_templates
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "session_template_exercises_read_all" ON public.session_template_exercises;
CREATE POLICY "session_template_exercises_read_all" ON public.session_template_exercises
  FOR SELECT TO anon, authenticated USING (true);

-- ─────────────────────────────────────────────
-- articles – enbart publicerade för anon/authenticated
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "articles_read_published" ON public.articles;
CREATE POLICY "articles_read_published" ON public.articles
  FOR SELECT TO anon, authenticated USING (status = 'published');

-- ─────────────────────────────────────────────
-- tips_library – public read
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "tips_read_all" ON public.tips_library;
CREATE POLICY "tips_read_all" ON public.tips_library
  FOR SELECT TO anon, authenticated USING (status = 'published');

-- ─────────────────────────────────────────────
-- OBS: Det finns INGA INSERT/UPDATE/DELETE policies för anon/authenticated.
-- Writes sker via service_role (kringgår RLS) – enbart admin-appen server-side.
-- ─────────────────────────────────────────────
