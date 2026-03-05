-- ============================================================================
-- Content DB – neutral copy för män utan menscykel (inte "Utebliven mens")
-- ============================================================================

INSERT INTO public.app_copy (key, locale, profile, value)
VALUES
  ('cycle_card_no_cycle_title', 'sv', 'male', 'Ingen cykelspårning'),
  ('cycle_card_no_cycle_title', 'sv', 'female', 'Utebliven mens'),
  ('cycle_card_no_cycle_title', 'sv', 'neutral', 'Utebliven mens'),
  ('cycle_card_no_cycle_subtitle', 'sv', 'male', 'Träning baseras på dagsform och mål'),
  ('cycle_card_no_cycle_subtitle', 'sv', 'female', 'Träning baseras på dagsform och historia'),
  ('cycle_card_no_cycle_subtitle', 'sv', 'neutral', 'Träning baseras på dagsform och historia'),

  ('cycle_section_title_no_cycle', 'sv', 'male', 'Välmående'),
  ('cycle_section_title_no_cycle', 'sv', 'female', 'Utebliven mens'),
  ('cycle_section_title_no_cycle', 'sv', 'neutral', 'Utebliven mens'),

  ('cycle_mode_missing_label', 'sv', 'male', 'Ingen cykelspårning'),
  ('cycle_mode_missing_label', 'sv', 'female', 'Utebliven mens'),
  ('cycle_mode_missing_label', 'sv', 'neutral', 'Utebliven mens'),
  ('cycle_mode_missing_desc', 'sv', 'male', 'Inga cykelfaser. Träning och insikter baseras på dagsform och mål.'),
  ('cycle_mode_missing_desc', 'sv', 'female', 'Inga faser visas. Fokus på energibalans och återhämtning.'),
  ('cycle_mode_missing_desc', 'sv', 'neutral', 'Inga faser visas. Fokus på energibalans och återhämtning.')
ON CONFLICT (key, locale, profile) DO UPDATE SET value = EXCLUDED.value;
