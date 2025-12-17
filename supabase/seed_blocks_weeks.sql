-- Seed data för Blocks & Weeks struktur
-- Kör detta EFTER att du har skapat ett program och har en coach user
-- 
-- INSTRUKTIONER:
-- 1. Kör först seed.sql för att få övningar
-- 2. Logga in som coach i appen
-- 3. Skapa ett test-program (t.ex. "Testprogram")
-- 4. Kopiera program_id från programmet du skapade
-- 5. Ersätt 'DIN_PROGRAM_ID_HÄR' nedan med ditt program_id
-- 6. Kör detta script i Supabase SQL Editor

-- ============================================
-- STEG 1: Hitta ditt program_id
-- ============================================
-- Kör detta för att hitta ditt program_id:
-- SELECT id, name FROM training_programs ORDER BY created_at DESC LIMIT 1;

-- ============================================
-- STEG 2: Ersätt 'DIN_PROGRAM_ID_HÄR' med ditt program_id
-- ============================================

-- Exempel: Om ditt program_id är '123e4567-e89b-12d3-a456-426614174000'
-- Ersätt alla 'DIN_PROGRAM_ID_HÄR' med det värdet

-- ============================================
-- Skapa Blocks
-- ============================================
INSERT INTO program_blocks (id, program_id, name, order_index, weeks_count, created_at) VALUES
  ('block-001', 'DIN_PROGRAM_ID_HÄR', 'Block 1: Hypertrofi', 0, 4, now()),
  ('block-002', 'DIN_PROGRAM_ID_HÄR', 'Block 2: Styrka', 1, 4, now()),
  ('block-003', 'DIN_PROGRAM_ID_HÄR', 'Block 3: Peaking', 2, 2, now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Skapa Weeks (kopplade till blocks)
-- ============================================
INSERT INTO program_weeks (id, program_id, block_id, week_number, name, created_at) VALUES
  -- Block 1: Hypertrofi (vecka 1-4)
  ('week-001', 'DIN_PROGRAM_ID_HÄR', 'block-001', 1, 'Hypertrofi Vecka 1', now()),
  ('week-002', 'DIN_PROGRAM_ID_HÄR', 'block-001', 2, 'Hypertrofi Vecka 2', now()),
  ('week-003', 'DIN_PROGRAM_ID_HÄR', 'block-001', 3, 'Hypertrofi Vecka 3', now()),
  ('week-004', 'DIN_PROGRAM_ID_HÄR', 'block-001', 4, 'Hypertrofi Vecka 4', now()),
  
  -- Block 2: Styrka (vecka 5-8)
  ('week-005', 'DIN_PROGRAM_ID_HÄR', 'block-002', 5, 'Styrka Vecka 1', now()),
  ('week-006', 'DIN_PROGRAM_ID_HÄR', 'block-002', 6, 'Styrka Vecka 2', now()),
  ('week-007', 'DIN_PROGRAM_ID_HÄR', 'block-002', 7, 'Styrka Vecka 3', now()),
  ('week-008', 'DIN_PROGRAM_ID_HÄR', 'block-002', 8, 'Styrka Vecka 4', now()),
  
  -- Block 3: Peaking (vecka 9-10)
  ('week-009', 'DIN_PROGRAM_ID_HÄR', 'block-003', 9, 'Peaking Vecka 1', now()),
  ('week-010', 'DIN_PROGRAM_ID_HÄR', 'block-003', 10, 'Peaking Vecka 2', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Skapa Sessions (kopplade till weeks)
-- ============================================
INSERT INTO program_sessions (id, program_id, week_id, name, day_of_week, focus, created_at) VALUES
  -- Vecka 1: Hypertrofi
  ('session-001', 'DIN_PROGRAM_ID_HÄR', 'week-001', 'Överkropp A', 1, 'Bröst, axlar, triceps', now()),
  ('session-002', 'DIN_PROGRAM_ID_HÄR', 'week-001', 'Underkropp A', 3, 'Ben, glutes', now()),
  ('session-003', 'DIN_PROGRAM_ID_HÄR', 'week-001', 'Överkropp B', 5, 'Rygg, biceps', now()),
  
  -- Vecka 2: Hypertrofi
  ('session-004', 'DIN_PROGRAM_ID_HÄR', 'week-002', 'Överkropp A', 1, 'Bröst, axlar, triceps', now()),
  ('session-005', 'DIN_PROGRAM_ID_HÄR', 'week-002', 'Underkropp A', 3, 'Ben, glutes', now()),
  ('session-006', 'DIN_PROGRAM_ID_HÄR', 'week-002', 'Överkropp B', 5, 'Rygg, biceps', now()),
  
  -- Vecka 5: Styrka
  ('session-007', 'DIN_PROGRAM_ID_HÄR', 'week-005', 'Starkt Pass', 1, 'Huvudlyft fokus', now()),
  ('session-008', 'DIN_PROGRAM_ID_HÄR', 'week-005', 'Starkt Pass', 3, 'Huvudlyft fokus', now()),
  ('session-009', 'DIN_PROGRAM_ID_HÄR', 'week-005', 'Starkt Pass', 5, 'Huvudlyft fokus', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Skapa Session Exercises med alla nya fält
-- ============================================
-- Övning 1: Knäböj med tempo och RPE
INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes) VALUES
  ('ex-001', 'session-001', '660e8400-e29b-41d4-a716-446655440001', 0, 4, 8, 120, '3-0-1-0', 'rpe', 7.5, 'Fokus på kontrollerad nedgång. Håll kärnan spänd.')
ON CONFLICT (id) DO NOTHING;

-- Övning 2: Marklyft med % av 1RM
INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes) VALUES
  ('ex-002', 'session-001', '660e8400-e29b-41d4-a716-446655440002', 1, 5, 5, 180, NULL, 'percent', 85, 'Arbeta upp till 85% av 1RM. Perfekt form är viktigare än vikt.')
ON CONFLICT (id) DO NOTHING;

-- Övning 3: Bänkpress med tempo och notes
INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes) VALUES
  ('ex-003', 'session-002', '660e8400-e29b-41d4-a716-446655440003', 0, 3, 10, 90, '2-1-1-0', 'rpe', 8, 'Håll skulderblad ihop. Kontrollerad nedgång.')
ON CONFLICT (id) DO NOTHING;

-- Övning 4: Hip Thrust utan intensity (endast sets/reps)
INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes) VALUES
  ('ex-004', 'session-002', '660e8400-e29b-41d4-a716-446655440004', 1, 4, 12, 60, NULL, 'none', NULL, 'Fokus på gluteus activation. Paus i toppen.')
ON CONFLICT (id) DO NOTHING;

-- Övning 5: Pull-ups med tempo
INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes) VALUES
  ('ex-005', 'session-003', '660e8400-e29b-41d4-a716-446655440006', 0, 3, 8, 120, '2-0-2-0', 'none', NULL, 'Full rörelseomfång. Om du inte klarar 8, använd band.')
ON CONFLICT (id) DO NOTHING;

-- Övning 6: Styrka-pass med % av 1RM
INSERT INTO session_exercises (id, session_id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, tempo, intensity_type, intensity_value, notes) VALUES
  ('ex-006', 'session-007', '660e8400-e29b-41d4-a716-446655440001', 0, 5, 3, 240, NULL, 'percent', 90, 'Arbeta upp till 90% av 1RM. Max 3 reps per set.')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Verifiera att allt skapades korrekt
-- ============================================
-- Kör dessa queries för att verifiera:

-- Se alla blocks:
-- SELECT * FROM program_blocks WHERE program_id = 'DIN_PROGRAM_ID_HÄR';

-- Se alla weeks:
-- SELECT pw.*, pb.name as block_name 
-- FROM program_weeks pw 
-- LEFT JOIN program_blocks pb ON pw.block_id = pb.id 
-- WHERE pw.program_id = 'DIN_PROGRAM_ID_HÄR' 
-- ORDER BY pw.week_number;

-- Se alla sessions med week-info:
-- SELECT ps.*, pw.name as week_name, pw.week_number, pb.name as block_name
-- FROM program_sessions ps
-- JOIN program_weeks pw ON ps.week_id = pw.id
-- LEFT JOIN program_blocks pb ON pw.block_id = pb.id
-- WHERE ps.program_id = 'DIN_PROGRAM_ID_HÄR'
-- ORDER BY pw.week_number, ps.day_of_week;

-- Se alla exercises med alla fält:
-- SELECT se.*, e.name as exercise_name, ps.name as session_name
-- FROM session_exercises se
-- JOIN exercises e ON se.exercise_id = e.id
-- JOIN program_sessions ps ON se.session_id = ps.id
-- WHERE ps.program_id = 'DIN_PROGRAM_ID_HÄR'
-- ORDER BY ps.id, se.order_index;

