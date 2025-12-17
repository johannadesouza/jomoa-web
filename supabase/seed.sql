-- Seed data för övningar i lokal Supabase
-- Kör detta efter databas-reset för att få användbar testdata

-- 1. Skapa övningskategorier
-- Använd DO NOTHING för att undvika fel om kategorier redan finns
INSERT INTO exercise_categories (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Styrketräning', 'Övningar för styrkeutveckling'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Kondition', 'Konditions- och uthållighetsövningar'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Hyrox', 'Hyrox-specifika övningar'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Kärna', 'Kärnstabilitet och core'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Mobilitet', 'Mobilitet och rörlighet')
ON CONFLICT (id) DO NOTHING;

-- 2. Skapa globala övningar (is_global = true)
-- Dessa syns för alla coaches
INSERT INTO exercises (id, name, category_id, primary_muscle_group, equipment, description, is_global, created_at, updated_at) VALUES
  -- Styrketräning
  ('660e8400-e29b-41d4-a716-446655440001', 'Knäböj', '550e8400-e29b-41d4-a716-446655440001', 'Ben', 'Skivstång', 'Klassisk knäböj med skivstång. Fokus på korrekt teknik och djup.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440002', 'Marklyft', '550e8400-e29b-41d4-a716-446655440001', 'Rygg, Ben', 'Skivstång', 'Marklyft med fokus på rygg och bensstyrka.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440003', 'Bänkpress', '550e8400-e29b-41d4-a716-446655440001', 'Bröst, Armar', 'Skivstång, Bänk', 'Bänkpress för övre kroppens styrka.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440004', 'Hip Thrust', '550e8400-e29b-41d4-a716-446655440001', 'Glutes, Bakre lår', 'Skivstång, Bänk', 'Hip thrust för gluteus och bakre lår.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440005', 'Bulgarian Split Squat', '550e8400-e29b-41d4-a716-446655440001', 'Ben', 'Hantlar (valfritt)', 'Enbensknäböj med bakfot upphöjd.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440006', 'Pull-ups', '550e8400-e29b-41d4-a716-446655440001', 'Rygg, Armar', 'Pull-up bar', 'Drag med egen kroppsvikt. Kan modifieras med band eller assistans.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440007', 'Overhead Press', '550e8400-e29b-41d4-a716-446655440001', 'Axlar, Armar', 'Skivstång eller hantlar', 'Press över huvudet för axelstyrka.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440008', 'Romanian Deadlift', '550e8400-e29b-41d4-a716-446655440001', 'Bakre lår, Glutes', 'Skivstång eller hantlar', 'RDL för bakre lår och glutes.', true, now(), now()),

  -- Kondition
  ('660e8400-e29b-41d4-a716-446655440009', 'Löpning 1 km', '550e8400-e29b-41d4-a716-446655440002', 'Kondition', 'Ingen', 'Löpning på 1 kilometer. Fokus på tempo och uthållighet.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440010', 'Löpning 2 km', '550e8400-e29b-41d4-a716-446655440002', 'Kondition', 'Ingen', 'Löpning på 2 kilometer.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440011', 'Rowing 500m', '550e8400-e29b-41d4-a716-446655440002', 'Kondition, Övre kropp', 'Rowing maskin', '500 meter på rowing maskin.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440012', 'Rowing 1 km', '550e8400-e29b-41d4-a716-446655440002', 'Kondition, Övre kropp', 'Rowing maskin', '1 kilometer på rowing maskin.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440013', 'Bike Erg 1 km', '550e8400-e29b-41d4-a716-446655440002', 'Kondition, Ben', 'Bike Erg', '1 kilometer på Bike Erg.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440014', 'SkiErg 500m', '550e8400-e29b-41d4-a716-446655440002', 'Kondition, Övre kropp', 'SkiErg', '500 meter på SkiErg.', true, now(), now()),

  -- Hyrox
  ('660e8400-e29b-41d4-a716-446655440015', '100m Wall Balls', '550e8400-e29b-41d4-a716-446655440003', 'Ben, Kärna, Kondition', 'Wall Ball (9kg)', '100 meter wall balls enligt Hyrox-format.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440016', '100m Row', '550e8400-e29b-41d4-a716-446655440003', 'Kondition, Övre kropp', 'Rowing maskin', '100 meter på rowing maskin (Hyrox-format).', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440017', '80m Burpee Broad Jump', '550e8400-e29b-41d4-a716-446655440003', 'Helkropp, Kondition', 'Ingen', '80 meter burpee broad jumps.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440018', '100m Sandbag Lunges', '550e8400-e29b-41d4-a716-446655440003', 'Ben, Kondition', 'Sandbag (20kg)', '100 meter lunges med sandbag.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440019', '100m Farmers Walk', '550e8400-e29b-41d4-a716-446655440003', 'Grip, Kärna, Ben', 'Kettlebells (2x24kg)', '100 meter farmers walk med kettlebells.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440020', '100m Sandbag Carry', '550e8400-e29b-41d4-a716-446655440003', 'Kärna, Grip, Ben', 'Sandbag (20kg)', '100 meter sandbag carry.', true, now(), now()),

  -- Kärna
  ('660e8400-e29b-41d4-a716-446655440021', 'Plank', '550e8400-e29b-41d4-a716-446655440004', 'Kärna', 'Ingen', 'Plank för kärnstabilitet. Håll korrekt form.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440022', 'Dead Bug', '550e8400-e29b-41d4-a716-446655440004', 'Kärna', 'Ingen', 'Dead bug för djup kärnstabilitet.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440023', 'Russian Twist', '550e8400-e29b-41d4-a716-446655440004', 'Kärna', 'Vikt (valfritt)', 'Russian twist för roterande kärnstyrka.', true, now(), now()),

  -- Mobilitet
  ('660e8400-e29b-41d4-a716-446655440024', 'Hip Mobility Flow', '550e8400-e29b-41d4-a716-446655440005', 'Höfter', 'Ingen', 'Rörlighetssekvens för höfter.', true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440025', 'Shoulder Mobility', '550e8400-e29b-41d4-a716-446655440005', 'Axlar', 'Band (valfritt)', 'Rörlighetsövningar för axlar.', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Skapa coach-specifika övningar (is_global = false)
-- Dessa är kopplade till första coachen i databasen (om någon finns)
-- Om ingen coach finns, skippas dessa rader (ingen fel genereras)
INSERT INTO exercises (id, name, category_id, primary_muscle_group, equipment, description, is_global, created_by_profile_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Custom Övning 1',
  '550e8400-e29b-41d4-a716-446655440001',
  'Ben',
  'Hantlar',
  'En anpassad övning skapad av coachen.',
  false,
  p.id,
  now(),
  now()
FROM profiles p
WHERE p.role = 'coach'
LIMIT 1;

INSERT INTO exercises (id, name, category_id, primary_muscle_group, equipment, description, is_global, created_by_profile_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Custom Övning 2',
  '550e8400-e29b-41d4-a716-446655440002',
  'Kondition',
  'Ingen',
  'En anpassad konditionsövning.',
  false,
  p.id,
  now(),
  now()
FROM profiles p
WHERE p.role = 'coach'
LIMIT 1;

INSERT INTO exercises (id, name, category_id, primary_muscle_group, equipment, description, is_global, created_by_profile_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Custom Övning 3',
  '550e8400-e29b-41d4-a716-446655440003',
  'Helkropp',
  'Kettlebell',
  'En anpassad Hyrox-inspirerad övning.',
  false,
  p.id,
  now(),
  now()
FROM profiles p
WHERE p.role = 'coach'
LIMIT 1;

-- 4. Skapa tips-bibliotek kopplat till cykelfaser
-- Tips för Mens (menstruation) - 6 tips
INSERT INTO tips_library (id, title, body, category, phase, context, is_active, created_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Lyssna på kroppen', 'Vid mens kan energin vara lägre. Anpassa träningen efter hur du mår – det är okej att ta det lugnare.', 'training', 'menstruation', 'low_energy', true, now()),
  ('770e8400-e29b-41d4-a716-446655440002', 'Järnrik mat', 'Fokusera på järnrik mat som kött, fisk, bönor och grönsaker för att stödja kroppen under mens.', 'nutrition', 'menstruation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440003', 'Mild träning', 'Lättare träning som yoga, promenader eller stretching kan kännas bättre än intensiv styrketräning.', 'training', 'menstruation', 'low_energy', true, now()),
  ('770e8400-e29b-41d4-a716-446655440004', 'Hydrering', 'Drick extra vatten under mens för att stödja kroppen och minska blåhet.', 'nutrition', 'menstruation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440005', 'Värme och komfort', 'Varm dusch eller värme på magen kan hjälpa vid kramper. Ta hand om dig.', 'cycle', 'menstruation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440006', 'Återhämtning prioriteras', 'Sömn och vila är extra viktigt nu. Prioritera återhämtning över prestation.', 'mindset', 'menstruation', 'low_energy', true, now()),

-- Tips för Follikulär fas - 6 tips
  ('770e8400-e29b-41d4-a716-446655440007', 'Ökad energi', 'Energin ökar ofta i follikulär fas. Detta är ett bra tillfälle för mer intensiv träning.', 'training', 'follicular', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440008', 'Protein för återhämtning', 'Se till att få tillräckligt med protein för att stödja muskelåterhämtning efter träning.', 'nutrition', 'follicular', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440009', 'Nya utmaningar', 'Detta är ett bra tillfälle att testa nya övningar eller öka belastningen gradvis.', 'training', 'follicular', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440010', 'Balanserad kost', 'Fokusera på balanserad kost med kolhydrater, protein och fett för att stödja träning och återhämtning.', 'nutrition', 'follicular', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440011', 'Bygg styrka', 'Follikulär fas är ofta bra för styrketräning. Utnyttja den ökade energin.', 'training', 'follicular', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440012', 'Positivt mindset', 'Kroppen känner sig ofta starkare nu. Utnyttja den positiva känslan i träningen.', 'mindset', 'follicular', 'general', true, now()),

-- Tips för Ägglossning (ovulation) - 5 tips
  ('770e8400-e29b-41d4-a716-446655440013', 'Toppprestation', 'Många upplever högre prestationsförmåga vid ägglossning. Detta kan vara ett bra tillfälle för tävling eller maxbelastning.', 'training', 'ovulation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440014', 'Extra kolhydrater', 'Om du tränar intensivt, se till att få tillräckligt med kolhydrater för att stödja prestationen.', 'nutrition', 'ovulation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440015', 'Högre intensitet', 'Detta kan vara ett bra tillfälle för högintensiv träning eller att testa nya personbästa.', 'training', 'ovulation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440016', 'Hydrering är viktigt', 'Se till att dricka tillräckligt med vatten, särskilt om du tränar intensivt.', 'nutrition', 'ovulation', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440017', 'Utnyttja styrkan', 'Kroppen är ofta på topp nu. Planera tunga pass eller utmaningar under denna fas.', 'mindset', 'ovulation', 'general', true, now()),

-- Tips för Luteal fas - 6 tips
  ('770e8400-e29b-41d4-a716-446655440018', 'Anpassad träning', 'Energin kan sjunka i luteal fas. Var flexibel och anpassa träningen efter hur du mår.', 'training', 'luteal', 'low_energy', true, now()),
  ('770e8400-e29b-41d4-a716-446655440019', 'Magnesium och järn', 'Fokusera på magnesium- och järnrik mat för att stödja kroppen inför mens.', 'nutrition', 'luteal', 'general', true, now()),
  ('770e8400-e29b-41d4-a716-446655440020', 'Mildare träning', 'Överväg lättare träning eller teknikfokus istället för maxbelastning.', 'training', 'luteal', 'low_energy', true, now()),
  ('770e8400-e29b-41d4-a716-446655440021', 'Sockerbehov', 'Det är normalt att känna suget efter sötsaker. Välj balanserade alternativ som frukt eller mörk choklad.', 'nutrition', 'luteal', 'cravings', true, now()),
  ('770e8400-e29b-41d4-a716-446655440022', 'Återhämtning och sömn', 'Prioritera sömn och återhämtning. Kroppen behöver extra vila nu.', 'cycle', 'luteal', 'low_energy', true, now()),
  ('770e8400-e29b-41d4-a716-446655440023', 'Var snäll mot dig själv', 'Det är okej att ta det lugnare. Lyssna på kroppen och var inte för hård mot dig själv.', 'mindset', 'luteal', 'high_stress', true, now())
ON CONFLICT (id) DO NOTHING;

