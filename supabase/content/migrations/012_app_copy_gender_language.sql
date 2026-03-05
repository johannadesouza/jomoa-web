-- ============================================================================
-- Content DB – profilvarierande copy för onboarding och kärnskärmar (kvinna vs man)
-- ============================================================================

INSERT INTO public.app_copy (key, locale, profile, value)
VALUES
  -- Onboarding (efter Gender)
  ('theme_title', 'sv', 'neutral', 'Vilken stil passar dig bäst?'),
  ('theme_title', 'sv', 'female', 'Vilken stil passar dig bäst?'),
  ('theme_title', 'sv', 'male', 'Vilken stil passar dig bäst?'),
  ('theme_subtitle', 'sv', 'neutral', 'Prova och se – tonen i appen anpassas.'),
  ('theme_subtitle', 'sv', 'female', 'Prova och se – tonen i appen anpassas.'),
  ('theme_subtitle', 'sv', 'male', 'Prova och se – tonen i appen anpassas.'),

  ('path_choice_title', 'sv', 'neutral', 'Vad vill du använda JOMOA till?'),
  ('path_choice_title', 'sv', 'female', 'Vad vill du använda JOMOA till?'),
  ('path_choice_title', 'sv', 'male', 'Vad vill du använda JOMOA till?'),
  ('path_choice_subtitle', 'sv', 'neutral', 'Välj vad som passar – du kan lägga till cykel senare om du vill.'),
  ('path_choice_subtitle', 'sv', 'female', 'Välj vad som passar – du kan lägga till cykel senare om du vill.'),
  ('path_choice_subtitle', 'sv', 'male', 'Välj vad som passar – du kan lägga till mer senare.'),

  ('goals_title', 'sv', 'neutral', 'Vad är ditt mål?'),
  ('goals_title', 'sv', 'female', 'Vad är ditt mål?'),
  ('goals_title', 'sv', 'male', 'Vad är ditt mål?'),
  ('goals_subtitle', 'sv', 'neutral', 'Välj det som passar dig bäst'),
  ('goals_subtitle', 'sv', 'female', 'Välj det som passar dig bäst'),
  ('goals_subtitle', 'sv', 'male', 'Välj det som passar dig bäst'),

  ('frequency_title', 'sv', 'neutral', 'Hur ofta vill du träna?'),
  ('frequency_title', 'sv', 'female', 'Hur ofta vill du träna?'),
  ('frequency_title', 'sv', 'male', 'Hur ofta vill du träna?'),
  ('frequency_subtitle', 'sv', 'neutral', 'Vi anpassar programmet efter din tid'),
  ('frequency_subtitle', 'sv', 'female', 'Vi anpassar programmet efter din tid'),
  ('frequency_subtitle', 'sv', 'male', 'Vi anpassar programmet efter din tid'),

  ('complete_title', 'sv', 'neutral', 'Allt klart!'),
  ('complete_title', 'sv', 'female', 'Allt klart!'),
  ('complete_title', 'sv', 'male', 'Allt klart!'),
  ('complete_subtitle', 'sv', 'neutral', 'Här är en sammanfattning av dina val'),
  ('complete_subtitle', 'sv', 'female', 'Här är en sammanfattning av dina val'),
  ('complete_subtitle', 'sv', 'male', 'Här är en sammanfattning av dina val'),
  ('complete_checkin_copy', 'sv', 'neutral', 'Varje dag kan du logga sömn, energi och stress – vi anpassar träning och tips, och din fas när du använder cykel.'),
  ('complete_checkin_copy', 'sv', 'female', 'Varje dag kan du logga sömn, energi och stress – vi anpassar träning och tips, och din fas när du använder cykel.'),
  ('complete_checkin_copy', 'sv', 'male', 'Varje dag kan du logga sömn, energi och stress – då får du tydliga beslut: Öka, Behåll eller Justera.'),

  -- Nästa steg (Complete)
  ('complete_next_step_1', 'sv', 'neutral', 'Gå till Hem'),
  ('complete_next_step_1', 'sv', 'female', 'Gå till Hem'),
  ('complete_next_step_1', 'sv', 'male', 'Gå till Hem'),
  ('complete_next_step_2', 'sv', 'neutral', 'Välj program om du inte har ett'),
  ('complete_next_step_2', 'sv', 'female', 'Välj program om du inte har ett'),
  ('complete_next_step_2', 'sv', 'male', 'Välj program om du inte har ett'),
  ('complete_next_step_3', 'sv', 'neutral', 'Logga check-in imorgon'),
  ('complete_next_step_3', 'sv', 'female', 'Logga check-in imorgon'),
  ('complete_next_step_3', 'sv', 'male', 'Logga check-in imorgon'),

  -- Kärnskärmar
  ('morning_routine_step_checkin', 'sv', 'neutral', 'Hur mår du idag?'),
  ('morning_routine_step_checkin', 'sv', 'female', 'Hur mår du idag?'),
  ('morning_routine_step_checkin', 'sv', 'male', 'Hur mår du idag?'),
  ('morning_routine_step_workout', 'sv', 'neutral', 'Ditt pass idag'),
  ('morning_routine_step_workout', 'sv', 'female', 'Ditt pass idag'),
  ('morning_routine_step_workout', 'sv', 'male', 'Ditt pass idag'),
  ('morning_routine_adapt_explanation', 'sv', 'neutral', 'Utifrån din check-in föreslår appen: Öka belastning, Behåll planen eller Justera (lättare pass idag). Vi tar även hänsyn till din fas när du använder cykel.'),
  ('morning_routine_adapt_explanation', 'sv', 'female', 'Utifrån din check-in föreslår appen: Öka belastning, Behåll planen eller Justera (lättare pass idag). Vi tar även hänsyn till din fas när du använder cykel.'),
  ('morning_routine_adapt_explanation', 'sv', 'male', 'Utifrån din check-in föreslår appen: Öka belastning, Behåll planen eller Justera (lättare pass idag). Standard är att behålla.'),

  ('readiness_section_title', 'sv', 'neutral', 'Hur mår du idag?'),
  ('readiness_section_title', 'sv', 'female', 'Hur mår du idag?'),
  ('readiness_section_title', 'sv', 'male', 'Hur mår du idag?'),
  ('journey_how_are_you_title', 'sv', 'neutral', 'Hur mår du idag?'),
  ('journey_how_are_you_title', 'sv', 'female', 'Hur mår du idag?'),
  ('journey_how_are_you_title', 'sv', 'male', 'Hur mår du idag?'),
  ('journey_how_are_you_subtitle', 'sv', 'neutral', 'Sömn, stress, energi – fyll i för rekommendationer'),
  ('journey_how_are_you_subtitle', 'sv', 'female', 'Sömn, stress, energi – fyll i för rekommendationer'),
  ('journey_how_are_you_subtitle', 'sv', 'male', 'Sömn, stress, energi – fyll i för rekommendationer'),

  ('highlights_do_checkin', 'sv', 'neutral', 'Gör check-in'),
  ('highlights_do_checkin', 'sv', 'female', 'Gör check-in'),
  ('highlights_do_checkin', 'sv', 'male', 'Gör check-in'),
  ('highlights_no_activity', 'sv', 'neutral', 'Ingen check-in eller pass denna dag'),
  ('highlights_no_activity', 'sv', 'female', 'Ingen check-in eller pass denna dag'),
  ('highlights_no_activity', 'sv', 'male', 'Ingen check-in eller pass denna dag'),

  ('adaptation_decision_hint', 'sv', 'neutral', 'Öka = mer belastning · Behåll = som planerat · Justera = lättare pass idag'),
  ('adaptation_decision_hint', 'sv', 'female', 'Öka = mer belastning · Behåll = som planerat · Justera = lättare pass idag'),
  ('adaptation_decision_hint', 'sv', 'male', 'Öka = mer belastning · Behåll = som planerat · Justera = lättare pass idag'),

  -- Första gången check-in-förklaring
  ('readiness_first_time_explanation', 'sv', 'neutral', 'När du loggar sömn och energi får du bättre rekommendationer – Öka, Behåll eller Justera.'),
  ('readiness_first_time_explanation', 'sv', 'female', 'När du loggar sömn och energi får du bättre rekommendationer – Öka, Behåll eller Justera. Vi tar även hänsyn till din fas.'),
  ('readiness_first_time_explanation', 'sv', 'male', 'När du loggar sömn och energi får du bättre rekommendationer – Öka, Behåll eller Justera.'),

  -- Dashboard: Välj program prompt
  ('dashboard_choose_program_title', 'sv', 'neutral', 'Välj ditt första program'),
  ('dashboard_choose_program_title', 'sv', 'female', 'Välj ditt första program'),
  ('dashboard_choose_program_title', 'sv', 'male', 'Välj ditt första program'),
  ('dashboard_choose_program_subtitle', 'sv', 'neutral', 'Gå till Träna och välj ett program som matchar dina mål.'),
  ('dashboard_choose_program_subtitle', 'sv', 'female', 'Gå till Träna och välj ett program som matchar dina mål.'),
  ('dashboard_choose_program_subtitle', 'sv', 'male', 'Gå till Träna och välj ett program som matchar dina mål.')
ON CONFLICT (key, locale, profile) DO NOTHING;
