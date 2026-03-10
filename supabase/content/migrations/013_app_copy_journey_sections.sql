-- ============================================================================
-- Content DB – Journey/Insikter: sektionstitlar och tom-stater (ingen hårdkod)
-- ============================================================================

INSERT INTO public.app_copy (key, locale, profile, value)
VALUES
  ('journey_section_dagens_insikt_title', 'sv', 'neutral', 'Dagens insikt'),
  ('journey_section_dagens_insikt_title', 'sv', 'female', 'Dagens insikt'),
  ('journey_section_dagens_insikt_title', 'sv', 'male', 'Dagens insikt'),
  ('journey_section_dagens_insikt_subtitle', 'sv', 'neutral', 'Vad kan jag förvänta mig och göra?'),
  ('journey_section_dagens_insikt_subtitle', 'sv', 'female', 'Vad kan jag förvänta mig och göra?'),
  ('journey_section_dagens_insikt_subtitle', 'sv', 'male', 'Vad kan jag förvänta mig och göra?'),

  ('journey_section_symtomlindring_title', 'sv', 'neutral', 'Symtomlindring'),
  ('journey_section_symtomlindring_title', 'sv', 'female', 'Symtomlindring'),
  ('journey_section_symtomlindring_title', 'sv', 'male', 'Symtomlindring'),
  ('journey_section_symtomlindring_subtitle_ready', 'sv', 'neutral', 'Rekommendationer baserat på hur du mår'),
  ('journey_section_symtomlindring_subtitle_ready', 'sv', 'female', 'Rekommendationer baserat på hur du mår'),
  ('journey_section_symtomlindring_subtitle_ready', 'sv', 'male', 'Rekommendationer baserat på hur du mår'),
  ('journey_section_symtomlindring_subtitle_not_ready', 'sv', 'neutral', 'Logga hur du mår för att låsa upp tips'),
  ('journey_section_symtomlindring_subtitle_not_ready', 'sv', 'female', 'Logga hur du mår för att låsa upp tips'),
  ('journey_section_symtomlindring_subtitle_not_ready', 'sv', 'male', 'Logga hur du mår för att låsa upp tips'),

  ('journey_section_utforska_title', 'sv', 'neutral', 'Utforska'),
  ('journey_section_utforska_title', 'sv', 'female', 'Utforska'),
  ('journey_section_utforska_title', 'sv', 'male', 'Utforska'),
  ('journey_section_utforska_subtitle', 'sv', 'neutral', 'Träning, kost och välmående'),
  ('journey_section_utforska_subtitle', 'sv', 'female', 'Träning, kost och välmående'),
  ('journey_section_utforska_subtitle', 'sv', 'male', 'Träning, kost och välmående'),

  ('journey_section_statistik_title', 'sv', 'neutral', 'Din träningsstatistik'),
  ('journey_section_statistik_title', 'sv', 'female', 'Din träningsstatistik'),
  ('journey_section_statistik_title', 'sv', 'male', 'Din träningsstatistik'),
  ('journey_section_statistik_subtitle', 'sv', 'neutral', 'Baserat på dina loggade pass'),
  ('journey_section_statistik_subtitle', 'sv', 'female', 'Baserat på dina loggade pass'),
  ('journey_section_statistik_subtitle', 'sv', 'male', 'Baserat på dina loggade pass'),

  ('journey_section_training_title', 'sv', 'neutral', 'Din träning'),
  ('journey_section_training_title', 'sv', 'female', 'Din träning'),
  ('journey_section_training_title', 'sv', 'male', 'Din träning'),
  ('journey_section_training_subtitle', 'sv', 'neutral', 'Volym, pass och streak'),
  ('journey_section_training_subtitle', 'sv', 'female', 'Volym, pass och streak'),
  ('journey_section_training_subtitle', 'sv', 'male', 'Volym, pass och streak'),

  ('journey_empty_first_workout_title', 'sv', 'neutral', 'Logga ditt första pass'),
  ('journey_empty_first_workout_title', 'sv', 'female', 'Logga ditt första pass'),
  ('journey_empty_first_workout_title', 'sv', 'male', 'Logga ditt första pass'),
  ('journey_empty_first_workout_description', 'sv', 'neutral', 'Starta från Hem eller Träna – då fylls statistik och historik här.'),
  ('journey_empty_first_workout_description', 'sv', 'female', 'Starta från Hem eller Träna – då fylls statistik och historik här.'),
  ('journey_empty_first_workout_description', 'sv', 'male', 'Starta från Hem eller Träna – då fylls statistik och historik här.'),

  ('journey_section_how_are_you_subtitle', 'sv', 'neutral', 'Klicka för symtomlindring eller logga'),
  ('journey_section_how_are_you_subtitle', 'sv', 'female', 'Klicka för symtomlindring eller logga'),
  ('journey_section_how_are_you_subtitle', 'sv', 'male', 'Klicka för symtomlindring eller logga'),

  ('journey_section_training_history_title', 'sv', 'neutral', 'Träningshistorik'),
  ('journey_section_training_history_title', 'sv', 'female', 'Träningshistorik'),
  ('journey_section_training_history_title', 'sv', 'male', 'Träningshistorik'),
  ('journey_section_training_history_subtitle', 'sv', 'neutral', 'Se kalendern för dina pass'),
  ('journey_section_training_history_subtitle', 'sv', 'female', 'Se kalendern för dina pass'),
  ('journey_section_training_history_subtitle', 'sv', 'male', 'Se kalendern för dina pass'),

  ('journey_empty_calendar_description', 'sv', 'neutral', 'Logga pass under Träna – historiken visas i kalendern.'),
  ('journey_empty_calendar_description', 'sv', 'female', 'Logga pass under Träna – historiken visas i kalendern.'),
  ('journey_empty_calendar_description', 'sv', 'male', 'Logga pass under Träna – historiken visas i kalendern.'),
  ('journey_empty_calendar_description_has_data', 'sv', 'neutral', 'Se dina loggade pass i kalendern.'),
  ('journey_empty_calendar_description_has_data', 'sv', 'female', 'Se dina loggade pass i kalendern.'),
  ('journey_empty_calendar_description_has_data', 'sv', 'male', 'Se dina loggade pass i kalendern.'),

  ('journey_section_mer_att_logga_title', 'sv', 'neutral', 'Mer att logga'),
  ('journey_section_mer_att_logga_title', 'sv', 'female', 'Mer att logga'),
  ('journey_section_mer_att_logga_title', 'sv', 'male', 'Mer att logga'),
  ('journey_section_mer_att_logga_subtitle', 'sv', 'neutral', 'Cykel och mätningar'),
  ('journey_section_mer_att_logga_subtitle', 'sv', 'female', 'Cykel och mätningar'),
  ('journey_section_mer_att_logga_subtitle', 'sv', 'male', 'Cykel och mätningar')
ON CONFLICT (key, locale, profile) DO NOTHING;
