-- ============================================================================
-- Content DB – onboarding & symtom (training_goals, symptom_options,
-- symptom_relief_tips, onboarding_copy)
-- Mobilappen läser; admin redigerar via service role.
-- ============================================================================

-- ─────────────────────────────────────────────
-- training_goals (id = clients.primary_goal)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.training_goals (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text,
  icon text,
  program_target_goal text,
  order_index int NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- symptom_options (mood, cravings, bleeding)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.symptom_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type text NOT NULL,
  option_id text NOT NULL,
  label text NOT NULL,
  value int,
  order_index int NOT NULL DEFAULT 0,
  UNIQUE(option_type, option_id)
);

CREATE INDEX IF NOT EXISTS idx_symptom_options_type ON public.symptom_options(option_type);

-- ─────────────────────────────────────────────
-- symptom_relief_tips
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.symptom_relief_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  headline text NOT NULL,
  tips text[] NOT NULL DEFAULT '{}',
  order_index int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_symptom_relief_symptom ON public.symptom_relief_tips(symptom_id);

-- ─────────────────────────────────────────────
-- onboarding_copy (nyckel–värde per screen)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onboarding_copy (
  id text PRIMARY KEY,
  screen text NOT NULL,
  field_key text NOT NULL,
  value_sv text NOT NULL,
  value_en text,
  UNIQUE(screen, field_key)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_copy_screen ON public.onboarding_copy(screen);

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
ALTER TABLE public.training_goals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_options       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_relief_tips   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_copy       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_goals_read_all"
  ON public.training_goals FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "symptom_options_read_all"
  ON public.symptom_options FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "symptom_relief_tips_read_all"
  ON public.symptom_relief_tips FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "onboarding_copy_read_all"
  ON public.onboarding_copy FOR SELECT TO anon, authenticated USING (true);

-- ─────────────────────────────────────────────
-- Seed: training_goals
-- ─────────────────────────────────────────────
INSERT INTO public.training_goals (id, label, description, icon, program_target_goal, order_index)
VALUES
  ('muscle_growth', 'Bygga muskler', 'Öka muskelmassa och forma kroppen', '💪', 'hypertrophy', 0),
  ('strength', 'Bli starkare', 'Öka styrka och kraft', '🏋️', 'strength', 1),
  ('fat_loss', 'Gå ner i vikt', 'Bränna fett och bli smalare', '🔥', 'general_fitness', 2),
  ('performance', 'Bättre prestation', 'Förbättra uthållighet och kondition', '⚡', 'endurance', 3),
  ('maintenance', 'Hålla formen', 'Behålla nuvarande nivå', '✨', 'general_fitness', 4)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: symptom_options (mood, cravings, bleeding)
-- ─────────────────────────────────────────────
INSERT INTO public.symptom_options (option_type, option_id, label, value, order_index)
VALUES
  ('mood', 'bra', 'Bra', NULL, 0),
  ('mood', 'nere', 'Nere', NULL, 1),
  ('mood', 'irriterad', 'Irriterad', NULL, 2),
  ('mood', 'kanslig', 'Känslig', NULL, 3),
  ('mood', 'lugn', 'Lugn', NULL, 4),
  ('mood', 'osaker', 'Osäker', NULL, 5),
  ('cravings', 'sotsaker', 'Sötsaker', NULL, 0),
  ('cravings', 'salt', 'Salt', NULL, 1),
  ('cravings', 'kolhydrater', 'Kolhydrater', NULL, 2),
  ('cravings', 'ingen', 'Ingen', NULL, 3),
  ('bleeding', '1', 'Ingen/spotting', 1, 0),
  ('bleeding', '2', 'Lätt', 2, 1),
  ('bleeding', '3', 'Medium', 3, 2),
  ('bleeding', '4', 'Ordentlig', 4, 3),
  ('bleeding', '5', 'Riktigt stark', 5, 4)
ON CONFLICT (option_type, option_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: symptom_relief_tips
-- ─────────────────────────────────────────────
INSERT INTO public.symptom_relief_tips (symptom_id, label, icon, headline, tips, order_index)
VALUES
  ('trötthet', 'Trötthet', '😴', 'Tips vid trötthet', ARRAY[
    'Kort promenad eller lätt stretching kan ge ny energi.',
    'Regelbundna mellanmål med protein och komplexa kolhydrater.',
    'Magnesium och B-vitaminer kan stödja energinivån.',
    'Prioritera sömn – även kort power nap kan hjälpa.',
    'Koffein först efter frukost, inte på tom mage.'
  ], 0),
  ('uppblåsthet', 'Uppblåsthet', '🫧', 'Tips vid uppblåsthet', ARRAY[
    'Minska saltintag och processad mat.',
    'Magnesium kan hjälpa mot vätskeansamling.',
    'Drick tillräckligt med vatten.',
    'Lätt stretching och promenad stimulerar matsmältningen.',
    'Undvik kolsyrade drycker under perioder med uppblåsthet.'
  ], 0),
  ('energi', 'Energi: Låg', '😩', 'Tips vid låg energi', ARRAY[
    'Promenad, stretching eller regelbundna mellanmål kan hjälpa.',
    'Proteinrik frukost och balanserade mellanmål.',
    'Järnrik kost vid blödning – stödjer energin.',
    'Anpassa träningen – lättare pass eller extra vila.',
    'Prioritera sömn och stresshantering.'
  ], 0),
  ('sömn', 'Sömn', '🌙', 'Tips för bättre sömn', ARRAY[
    'Prioritera regelbunden sovrutin.',
    'Magnesium kan stödja sömnkvaliteten.',
    'Undvik koffein efter lunch.',
    'Skärmfri tid minst 30 min före läggdags.',
    'Lätt stretching eller andningsövningar innan sänggåendet.'
  ], 0)
ON CONFLICT (symptom_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: onboarding_copy (PathChoice, Goals, Frequency, CycleSetup)
-- ─────────────────────────────────────────────
INSERT INTO public.onboarding_copy (id, screen, field_key, value_sv, value_en)
VALUES
  ('path_choice_title', 'path_choice', 'title', 'Vad vill du använda JOMOA till?', 'What do you want to use JOMOA for?'),
  ('path_choice_cycle_only', 'path_choice', 'cycle_only_label', 'Endast cykel', 'Cycle only'),
  ('path_choice_training_only', 'path_choice', 'training_only_label', 'Endast träning', 'Training only'),
  ('path_choice_both', 'path_choice', 'both_label', 'Både cykel och träning', 'Both cycle and training'),
  ('goals_title', 'goals', 'title', 'Vad är ditt mål?', 'What is your goal?'),
  ('goals_subtitle', 'goals', 'subtitle', 'Välj det som passar dig bäst', 'Choose what fits you best'),
  ('frequency_title', 'frequency', 'title', 'Hur ofta vill du träna?', 'How often do you want to train?'),
  ('cycle_setup_title', 'cycle_setup', 'title', 'Cykelinställningar', 'Cycle settings'),
  ('complete_title', 'complete', 'title', 'Du är klar!', 'You are done!'),
  ('complete_subtitle', 'complete', 'subtitle', 'Du kommer till Hem', 'You will go to Home'),
  ('complete_checkin_copy', 'complete', 'checkin_copy', 'Varje dag kan du snabbt logga hur du mår – sömn, energi, stress – så anpassar vi träning och tips.', 'Every day you can quickly log how you feel – sleep, energy, stress – and we adapt training and tips.')
ON CONFLICT (id) DO NOTHING;
