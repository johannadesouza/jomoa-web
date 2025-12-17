-- Seed data för Blocks & Weeks struktur (AUTOMATISK VERSION)
-- Detta script hittar automatiskt det senaste programmet
-- Kör detta EFTER att du har skapat ett program i appen

-- ============================================
-- Hitta det senaste programmet automatiskt
-- ============================================
DO $$
DECLARE
  v_program_id UUID;
BEGIN
  -- Hitta det senaste programmet
  SELECT id INTO v_program_id
  FROM training_programs
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_program_id IS NULL THEN
    RAISE EXCEPTION 'Inget program hittades. Skapa först ett program i appen.';
  END IF;

  RAISE NOTICE 'Använder program_id: %', v_program_id;

  -- ============================================
  -- Skapa Blocks
  -- ============================================
  INSERT INTO program_blocks (id, program_id, name, order_index, weeks_count, created_at) VALUES
    (gen_random_uuid(), v_program_id, 'Block 1: Hypertrofi', 0, 4, now()),
    (gen_random_uuid(), v_program_id, 'Block 2: Styrka', 1, 4, now()),
    (gen_random_uuid(), v_program_id, 'Block 3: Peaking', 2, 2, now())
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Skapa Weeks (kopplade till blocks)
  -- ============================================
  -- Block 1: Hypertrofi (vecka 1-4)
  INSERT INTO program_weeks (id, program_id, block_id, week_number, name, created_at)
  SELECT 
    gen_random_uuid(),
    v_program_id,
    pb.id,
    week_num,
    'Hypertrofi Vecka ' || week_num,
    now()
  FROM program_blocks pb
  CROSS JOIN generate_series(1, 4) AS week_num
  WHERE pb.program_id = v_program_id AND pb.name = 'Block 1: Hypertrofi'
  ON CONFLICT DO NOTHING;

  -- Block 2: Styrka (vecka 5-8)
  INSERT INTO program_weeks (id, program_id, block_id, week_number, name, created_at)
  SELECT 
    gen_random_uuid(),
    v_program_id,
    pb.id,
    week_num,
    'Styrka Vecka ' || (week_num - 4),
    now()
  FROM program_blocks pb
  CROSS JOIN generate_series(5, 8) AS week_num
  WHERE pb.program_id = v_program_id AND pb.name = 'Block 2: Styrka'
  ON CONFLICT DO NOTHING;

  -- Block 3: Peaking (vecka 9-10)
  INSERT INTO program_weeks (id, program_id, block_id, week_number, name, created_at)
  SELECT 
    gen_random_uuid(),
    v_program_id,
    pb.id,
    week_num,
    'Peaking Vecka ' || (week_num - 8),
    now()
  FROM program_blocks pb
  CROSS JOIN generate_series(9, 10) AS week_num
  WHERE pb.program_id = v_program_id AND pb.name = 'Block 3: Peaking'
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Skapa Sessions (kopplade till weeks)
  -- ============================================
  -- Vecka 1: Hypertrofi
  INSERT INTO program_sessions (id, program_id, week_id, name, day_of_week, focus, created_at)
  SELECT 
    gen_random_uuid(),
    v_program_id,
    pw.id,
    session_name,
    day_num,
    session_focus,
    now()
  FROM program_weeks pw
  CROSS JOIN (VALUES 
    ('Överkropp A', 1, 'Bröst, axlar, triceps'),
    ('Underkropp A', 3, 'Ben, glutes'),
    ('Överkropp B', 5, 'Rygg, biceps')
  ) AS sessions(session_name, day_num, session_focus)
  WHERE pw.program_id = v_program_id AND pw.week_number = 1
  ON CONFLICT DO NOTHING;

  -- Vecka 2: Hypertrofi (samma struktur)
  INSERT INTO program_sessions (id, program_id, week_id, name, day_of_week, focus, created_at)
  SELECT 
    gen_random_uuid(),
    v_program_id,
    pw.id,
    session_name,
    day_num,
    session_focus,
    now()
  FROM program_weeks pw
  CROSS JOIN (VALUES 
    ('Överkropp A', 1, 'Bröst, axlar, triceps'),
    ('Underkropp A', 3, 'Ben, glutes'),
    ('Överkropp B', 5, 'Rygg, biceps')
  ) AS sessions(session_name, day_num, session_focus)
  WHERE pw.program_id = v_program_id AND pw.week_number = 2
  ON CONFLICT DO NOTHING;

  -- Vecka 5: Styrka
  INSERT INTO program_sessions (id, program_id, week_id, name, day_of_week, focus, created_at)
  SELECT 
    gen_random_uuid(),
    v_program_id,
    pw.id,
    'Starkt Pass',
    day_num,
    'Huvudlyft fokus',
    now()
  FROM program_weeks pw
  CROSS JOIN generate_series(1, 5, 2) AS day_num  -- Måndag, Onsdag, Fredag
  WHERE pw.program_id = v_program_id AND pw.week_number = 5
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Skapa Session Exercises med alla nya fält
  -- ============================================
  -- Hitta första sessionen för att lägga till övningar
  DECLARE
    v_session_id UUID;
    v_knaboj_id UUID;
    v_marklyft_id UUID;
    v_bankpress_id UUID;
    v_hipthrust_id UUID;
    v_pullups_id UUID;
  BEGIN
    -- Hitta första sessionen
    SELECT id INTO v_session_id
    FROM program_sessions
    WHERE program_id = v_program_id
    ORDER BY created_at ASC
    LIMIT 1;

    -- Hitta övningar (förutsätter att seed.sql har körts)
    SELECT id INTO v_knaboj_id FROM exercises WHERE name = 'Knäböj' LIMIT 1;
    SELECT id INTO v_marklyft_id FROM exercises WHERE name = 'Marklyft' LIMIT 1;
    SELECT id INTO v_bankpress_id FROM exercises WHERE name = 'Bänkpress' LIMIT 1;
    SELECT id INTO v_hipthrust_id FROM exercises WHERE name = 'Hip Thrust' LIMIT 1;
    SELECT id INTO v_pullups_id FROM exercises WHERE name = 'Pull-ups' LIMIT 1;

    IF v_session_id IS NOT NULL THEN
      -- Övning 1: Knäböj med tempo och RPE
      INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes)
      VALUES (
        gen_random_uuid(),
        v_session_id,
        v_knaboj_id,
        0,
        4,
        8,
        120,
        '3-0-1-0',
        'rpe',
        7.5,
        'Fokus på kontrollerad nedgång. Håll kärnan spänd.'
      )
      ON CONFLICT DO NOTHING;

      -- Övning 2: Marklyft med % av 1RM
      INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes)
      VALUES (
        gen_random_uuid(),
        v_session_id,
        v_marklyft_id,
        1,
        5,
        5,
        180,
        NULL,
        'percent',
        85,
        'Arbeta upp till 85% av 1RM. Perfekt form är viktigare än vikt.'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END;

  RAISE NOTICE 'Seed-data skapad för program_id: %', v_program_id;
END $$;

-- ============================================
-- Verifiera att allt skapades korrekt
-- ============================================
SELECT 
  pb.name as block_name,
  pw.week_number,
  pw.name as week_name,
  COUNT(ps.id) as session_count
FROM program_blocks pb
LEFT JOIN program_weeks pw ON pw.block_id = pb.id
LEFT JOIN program_sessions ps ON ps.week_id = pw.id
WHERE pb.program_id = (SELECT id FROM training_programs ORDER BY created_at DESC LIMIT 1)
GROUP BY pb.id, pb.name, pb.order_index, pw.id, pw.week_number, pw.name
ORDER BY pb.order_index, pw.week_number;

