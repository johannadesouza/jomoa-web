# Databas-krav för Blocks & Weeks

## Översikt

Alla tabeller och kolumner finns redan i schemat. Inga migrationer behövs.

## Tabeller som används

### 1. `program_blocks`
**Status:** ✅ Finns redan

**Kolumner:**
- `id` (UUID, PK)
- `program_id` (UUID, FK → training_programs)
- `name` (text)
- `order_index` (integer)
- `weeks_count` (integer, nullable)
- `created_at` (timestamp)

**Användning:**
- Blocks organisera veckor i programmet
- Ett program kan ha flera blocks
- Blocks har en order_index för sortering

### 2. `program_weeks`
**Status:** ✅ Finns redan

**Kolumner:**
- `id` (UUID, PK)
- `program_id` (UUID, FK → training_programs)
- `block_id` (UUID, nullable, FK → program_blocks)
- `week_number` (integer)
- `name` (text, nullable)
- `created_at` (timestamp)

**Användning:**
- Weeks kan vara kopplade till ett block (block_id) eller direkt under programmet (block_id = NULL)
- week_number används för sortering och unikhet per program
- Unique constraint: (program_id, week_number)

### 3. `program_sessions`
**Status:** ✅ Finns redan (uppdaterad)

**Kolumner:**
- `id` (UUID, PK)
- `program_id` (UUID, FK → training_programs)
- `week_id` (UUID, FK → program_weeks) ⚠️ **KRÄVS NU**
- `name` (text)
- `day_of_week` (integer, 1-7)
- `focus` (text, nullable)
- `created_at` (timestamp)

**Ändringar:**
- `week_id` är nu obligatoriskt (tidigare kunde sessions vara direkt under program)
- Migration sker automatiskt i appen (skapar default block + week om behövs)

### 4. `session_exercises`
**Status:** ✅ Finns redan (alla kolumner finns)

**Kolumner:**
- `id` (UUID, PK)
- `session_id` (UUID, FK → program_sessions)
- `exercise_id` (UUID, FK → exercises)
- `order_index` (integer)
- `sets_planned` (integer, nullable)
- `reps_planned` (integer, nullable)
- `rest_seconds` (integer, nullable)
- `tempo` (text, nullable) ✅ **NYTT FÄLT**
- `intensity_type` (intensity_type_enum, default 'none') ✅ **NYTT FÄLT**
- `intensity_value` (numeric, nullable) ✅ **NYTT FÄLT**
- `notes` (text, nullable) ✅ **NYTT FÄLT**

**Enum: `intensity_type_enum`**
- `'none'` - Ingen intensity-specifikation
- `'rpe'` - Rate of Perceived Exertion (1-10)
- `'percent'` - Procent av 1RM (0-100)

## Verifiering

### Kontrollera att alla tabeller finns:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('program_blocks', 'program_weeks', 'program_sessions', 'session_exercises');
```

### Kontrollera att session_exercises har alla kolumner:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'session_exercises' 
AND column_name IN ('tempo', 'intensity_type', 'intensity_value', 'notes')
ORDER BY ordinal_position;
```

### Kontrollera att intensity_type_enum finns:
```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'intensity_type_enum'
)
ORDER BY enumsortorder;
```

Du bör se: `none`, `rpe`, `percent`

## Foreign Keys

### Kontrollera foreign keys:
```sql
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('program_blocks', 'program_weeks', 'program_sessions', 'session_exercises');
```

## Constraints

### Unique constraints:
- `program_weeks`: (program_id, week_number) - En vecka kan bara ha ett nummer per program

### Not null constraints:
- `program_sessions.week_id` - Måste ha en week (migreras automatiskt)

## Migration av befintlig data

Om du har befintliga sessions utan `week_id`:

1. **Automatisk migration:** Appen skapar automatiskt ett default block och week om behövs
2. **Manuell migration:** Kör detta script:

```sql
-- Skapa default block om det inte finns
INSERT INTO program_blocks (program_id, name, order_index)
SELECT DISTINCT program_id, 'Default Block', 0
FROM program_sessions
WHERE week_id IS NULL
ON CONFLICT DO NOTHING;

-- Skapa default week om det inte finns
INSERT INTO program_weeks (program_id, block_id, week_number, name)
SELECT DISTINCT 
  ps.program_id,
  pb.id,
  1,
  'Vecka 1'
FROM program_sessions ps
JOIN program_blocks pb ON pb.program_id = ps.program_id AND pb.name = 'Default Block'
WHERE ps.week_id IS NULL
ON CONFLICT (program_id, week_number) DO NOTHING;

-- Uppdatera sessions utan week_id
UPDATE program_sessions ps
SET week_id = pw.id
FROM program_weeks pw
JOIN program_blocks pb ON pb.id = pw.block_id
WHERE ps.week_id IS NULL
AND ps.program_id = pw.program_id
AND pw.week_number = 1
AND pb.name = 'Default Block';
```

## Testdata

Se:
- `supabase/seed_blocks_weeks.sql` - Manuell seed (kräver program_id)
- `supabase/seed_blocks_weeks_auto.sql` - Automatisk seed (hittar senaste programmet)

## Felsökning

### Problem: "column tempo does not exist"
**Lösning:** Kör migration för att lägga till kolumner (borde inte behövas, men om det behövs):
```sql
ALTER TABLE session_exercises 
ADD COLUMN IF NOT EXISTS tempo text,
ADD COLUMN IF NOT EXISTS intensity_type intensity_type_enum DEFAULT 'none',
ADD COLUMN IF NOT EXISTS intensity_value numeric,
ADD COLUMN IF NOT EXISTS notes text;
```

### Problem: "type intensity_type_enum does not exist"
**Lösning:** Skapa enum (borde inte behövas):
```sql
CREATE TYPE intensity_type_enum AS ENUM ('none', 'rpe', 'percent');
```

### Problem: Sessions saknar week_id
**Lösning:** Kör migration-scriptet ovan eller låt appen göra det automatiskt.

