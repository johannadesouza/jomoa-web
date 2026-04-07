-- Complete screen: "Nästa steg" cykeltexter (används när wantsCycleTracking)
INSERT INTO public.app_copy (key, locale, profile, value)
VALUES
  ('complete_next_step_cycle', 'sv', 'neutral', 'Logga periodstart under Cykel (eller Inställningar → Menscykel) när nästa period börjar'),
  ('complete_next_step_cycle', 'sv', 'female', 'Logga periodstart under Cykel (eller Inställningar → Menscykel) när nästa period börjar'),
  ('complete_next_step_cycle', 'sv', 'male', 'Logga periodstart under Cykel (eller Inställningar → Menscykel) när nästa period börjar'),
  ('complete_next_step_cycle_no_date', 'sv', 'neutral', 'Du kan logga din senaste period under Cykel när du vill'),
  ('complete_next_step_cycle_no_date', 'sv', 'female', 'Du kan logga din senaste period under Cykel när du vill'),
  ('complete_next_step_cycle_no_date', 'sv', 'male', 'Du kan logga din senaste period under Cykel när du vill')
ON CONFLICT (key, locale, profile) DO NOTHING;
