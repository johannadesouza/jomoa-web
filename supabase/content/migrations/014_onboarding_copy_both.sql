-- Onboarding copy for "both" path (träning + cykel) and Complete next-step cycle
INSERT INTO public.onboarding_copy (id, screen, field_key, value_sv, value_en)
VALUES
  (
    'cycle_setup_title_both',
    'cycle_setup',
    'title_both',
    'Senaste period',
    'Last period'
  ),
  (
    'cycle_setup_subtitle_both',
    'cycle_setup',
    'subtitle_both',
    'När började din senaste period? (valfritt) Vi anpassar träning och återhämtning utifrån din cykelfas. Du kan logga senare under Inställningar → Menscykel.',
    'When did your last period start? (optional) We adapt training and recovery based on your cycle phase. You can log this later under Settings → Menstrual cycle.'
  )
ON CONFLICT (id) DO NOTHING;
