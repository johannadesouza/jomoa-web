-- ============================================================================
-- FAS 3 CUTOVER: Ta bort content-tabeller från User DB
--
-- Kör detta i USER DB (jfilxiqtecaxbwdsztaz) SQL Editor
-- EFTER att Content DB är verifierad och appen kör mot Content DB.
--
-- Dessa tabeller lever nu i Content DB (fohthpiyrxeyezjjvcva).
-- ============================================================================

-- Ordning viktigt: barn-tabeller före föräldrar (foreign key constraints)
DROP TABLE IF EXISTS public.session_template_exercises CASCADE;
DROP TABLE IF EXISTS public.session_exercises CASCADE;
DROP TABLE IF EXISTS public.session_templates CASCADE;
DROP TABLE IF EXISTS public.program_sessions CASCADE;
DROP TABLE IF EXISTS public.program_weeks CASCADE;
DROP TABLE IF EXISTS public.program_blocks CASCADE;
DROP TABLE IF EXISTS public.training_programs CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.tips_library CASCADE;

-- Gamla cycle_phases (ersatt av den nya rikare versionen i Content DB)
DROP TABLE IF EXISTS public.cycle_phases CASCADE;
