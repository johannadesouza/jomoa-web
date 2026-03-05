-- ============================================================================
-- Content DB – fler app_copy för dashboard och cykel (profilmedveten copy, steg 6)
-- ============================================================================

INSERT INTO public.app_copy (key, locale, profile, value)
VALUES
  ('insights_section_title', 'sv', 'neutral', 'Insikter'),
  ('insights_section_title', 'sv', 'female', 'Insikter'),
  ('insights_section_title', 'sv', 'male', 'Insikter'),

  ('cycle_card_perimenopause_title', 'sv', 'neutral', 'Peri-/menopaus'),
  ('cycle_card_perimenopause_title', 'sv', 'female', 'Peri-/menopaus'),
  ('cycle_card_perimenopause_title', 'sv', 'male', 'Peri-/menopaus'),
  ('cycle_card_perimenopause_subtitle', 'sv', 'neutral', 'Logga symtom för anpassad träning'),
  ('cycle_card_perimenopause_subtitle', 'sv', 'female', 'Logga symtom för anpassad träning'),
  ('cycle_card_perimenopause_subtitle', 'sv', 'male', 'Logga symtom för anpassad träning'),

  ('cycle_card_missing_title', 'sv', 'neutral', 'Utebliven mens'),
  ('cycle_card_missing_title', 'sv', 'female', 'Utebliven mens'),
  ('cycle_card_missing_title', 'sv', 'male', 'Utebliven mens'),
  ('cycle_card_missing_subtitle', 'sv', 'neutral', 'Träning baseras på dagsform och historia'),
  ('cycle_card_missing_subtitle', 'sv', 'female', 'Träning baseras på dagsform och historia'),
  ('cycle_card_missing_subtitle', 'sv', 'male', 'Träning baseras på dagsform och historia'),

  ('cycle_get_started_title', 'sv', 'neutral', 'Kom igång med cykelspårning'),
  ('cycle_get_started_title', 'sv', 'female', 'Kom igång med cykelspårning'),
  ('cycle_get_started_title', 'sv', 'male', 'Kom igång med cykelspårning'),
  ('cycle_get_started_subtitle', 'sv', 'neutral', 'Logga period för anpassade rekommendationer'),
  ('cycle_get_started_subtitle', 'sv', 'female', 'Logga period för anpassade rekommendationer'),
  ('cycle_get_started_subtitle', 'sv', 'male', 'Logga period för anpassade rekommendationer'),

  ('cycle_hero_no_phase', 'sv', 'neutral', 'Logga period för att se din cykel och hormonprofil'),
  ('cycle_hero_no_phase', 'sv', 'female', 'Logga period för att se din cykel och hormonprofil'),
  ('cycle_hero_no_phase', 'sv', 'male', 'Logga period för att se din cykel och hormonprofil'),
  ('cycle_hero_no_cycle_mode', 'sv', 'neutral', 'Träning anpassas efter dagsform och symtom'),
  ('cycle_hero_no_cycle_mode', 'sv', 'female', 'Träning anpassas efter dagsform och symtom'),
  ('cycle_hero_no_cycle_mode', 'sv', 'male', 'Träning anpassas efter dagsform och symtom'),

  ('cycle_section_title_regular', 'sv', 'neutral', 'Din cykel'),
  ('cycle_section_title_regular', 'sv', 'female', 'Din cykel'),
  ('cycle_section_title_regular', 'sv', 'male', 'Din cykel'),
  ('cycle_section_title_perimenopause', 'sv', 'neutral', 'Peri-/menopaus'),
  ('cycle_section_title_perimenopause', 'sv', 'female', 'Peri-/menopaus'),
  ('cycle_section_title_perimenopause', 'sv', 'male', 'Peri-/menopaus'),
  ('cycle_section_title_missing', 'sv', 'neutral', 'Utebliven mens'),
  ('cycle_section_title_missing', 'sv', 'female', 'Utebliven mens'),
  ('cycle_section_title_missing', 'sv', 'male', 'Utebliven mens'),
  ('cycle_phase_label_caption', 'sv', 'neutral', 'Din cykelfas'),
  ('cycle_phase_label_caption', 'sv', 'female', 'Din cykelfas'),
  ('cycle_phase_label_caption', 'sv', 'male', 'Din cykelfas')
ON CONFLICT (key, locale, profile) DO NOTHING;
