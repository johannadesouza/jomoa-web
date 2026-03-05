-- ============================================================================
-- Content DB – goal_type_options (resans mål: fitness, nutrition, wellness, event)
-- Mobilappen läser; admin redigerar. AddGoalModal använder istället för goalOptions.ts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.goal_type_options (
  goal_type   text NOT NULL,
  option_id   text NOT NULL,
  label       text NOT NULL,
  icon_name   text,
  order_index int NOT NULL DEFAULT 0,
  PRIMARY KEY (goal_type, option_id)
);

CREATE INDEX IF NOT EXISTS idx_goal_type_options_goal_type ON public.goal_type_options(goal_type);

ALTER TABLE public.goal_type_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goal_type_options_read_all"
  ON public.goal_type_options FOR SELECT TO anon, authenticated USING (true);

-- Seed från nuvarande goalOptions.ts (kan ändras i admin)
INSERT INTO public.goal_type_options (goal_type, option_id, label, icon_name, order_index) VALUES
  ('fitness', 'general_fitness', 'Förbättra allmän fitness', 'body-outline', 1),
  ('fitness', 'strength', 'Bli starkare', 'barbell-outline', 2),
  ('fitness', 'muscle', 'Bygga muskler', 'fitness-outline', 3),
  ('fitness', 'lean_up', 'Gå ner i vikt', 'trending-down-outline', 4),
  ('fitness', 'mental_wellbeing', 'Bättre psykisk hälsa', 'heart-outline', 5),
  ('nutrition', 'lose_weight', 'Gå ner i vikt', 'trending-down-outline', 1),
  ('nutrition', 'maintain', 'Behåll vikt', 'remove-outline', 2),
  ('nutrition', 'gain_weight', 'Gå upp i vikt', 'trending-up-outline', 3),
  ('wellness', 'habits', 'Bättre vanor och rutiner', 'checkmark-circle-outline', 1),
  ('wellness', 'confidence', 'Mer självförtroende', 'happy-outline', 2),
  ('wellness', 'transformation', 'Fysisk förändring', 'body-outline', 3),
  ('wellness', 'nutrition', 'Bättre kost', 'nutrition-outline', 4),
  ('wellness', 'variety', 'Mer variation i träning', 'flash-outline', 5),
  ('wellness', 'strength_fitness', 'Styrka och kondition', 'barbell-outline', 6),
  ('wellness', 'mental', 'Bättre psykisk hälsa', 'happy-outline', 7),
  ('wellness', 'energy', 'Mer energi', 'flash-outline', 8),
  ('event', 'holiday', 'Semester', 'umbrella-outline', 1),
  ('event', 'wedding', 'Bröllop', 'heart-outline', 2),
  ('event', 'birthday', 'Födelsedag', 'gift-outline', 3),
  ('event', 'summer', 'Sommar', 'sunny-outline', 4)
ON CONFLICT (goal_type, option_id) DO NOTHING;
