-- Seed data för onboarding tasks
-- Coach tasks
INSERT INTO onboarding_tasks (target_role, key, title, description, order_index, is_active)
VALUES
  ('coach', 'create_client', 'Skapa din första klient', 'Skicka en inbjudan till din första klient så de kan komma igång.', 1, true),
  ('coach', 'create_program', 'Skapa ett träningsprogram', 'Skapa ett träningsprogram med pass och övningar.', 2, true),
  ('coach', 'add_sessions', 'Lägg till pass i programmet', 'Lägg till pass och övningar i ditt program.', 3, true),
  ('coach', 'assign_program', 'Tilldela program till klient', 'Tilldela ditt program till en klient så de kan börja träna.', 4, true),
  ('coach', 'client_first_workout', 'Be klienten logga första passet', 'När klienten loggar sitt första pass kan du se deras progress.', 5, true)
ON CONFLICT (target_role, key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

-- Client tasks
INSERT INTO onboarding_tasks (target_role, key, title, description, order_index, is_active)
VALUES
  ('client', 'log_readiness', 'Logga din första readiness', 'Logga hur du mår idag (sömn, energi, stress, ömhet).', 1, true),
  ('client', 'log_period_start', 'Logga mensstart', 'Logga när din mens började för att få cykel-baserad träning.', 2, true),
  ('client', 'start_workout', 'Starta ditt första pass', 'Starta och logga ditt första träningspass.', 3, true)
ON CONFLICT (target_role, key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

