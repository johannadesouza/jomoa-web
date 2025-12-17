# Test-guide: Blocks & Weeks Struktur

## Översikt

Denna guide hjälper dig att testa den nya block/week-strukturen och de förbättrade exercise-fälten (tempo, intensity, notes).

## Förberedelser

### 1. Verifiera databas-schema

Kontrollera att alla tabeller och kolumner finns:

```sql
-- Kontrollera att session_exercises har alla kolumner
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session_exercises' 
ORDER BY ordinal_position;
```

Du bör se:
- `tempo` (text)
- `intensity_type` (intensity_type_enum)
- `intensity_value` (numeric)
- `notes` (text)

### 2. Seed-data

#### Steg 1: Kör övnings-seed (om inte redan gjort)
```bash
# I Supabase SQL Editor eller via psql
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

#### Steg 2: Skapa ett test-program i appen
1. Logga in som coach
2. Gå till `/coach/programs`
3. Klicka "Skapa program"
4. Skapa ett program (t.ex. "Testprogram")
5. Kopiera program_id från URL eller databas

#### Steg 3: Kör block/week seed-data
1. Öppna `supabase/seed_blocks_weeks.sql`
2. Ersätt `'DIN_PROGRAM_ID_HÄR'` med ditt program_id (3 ställen)
3. Kör scriptet i Supabase SQL Editor

#### Steg 4: Verifiera seed-data
```sql
-- Ersätt med ditt program_id
SELECT 
  pb.name as block_name,
  pw.week_number,
  pw.name as week_name,
  ps.name as session_name,
  ps.day_of_week
FROM program_blocks pb
LEFT JOIN program_weeks pw ON pw.block_id = pb.id
LEFT JOIN program_sessions ps ON ps.week_id = pw.id
WHERE pb.program_id = 'DITT_PROGRAM_ID'
ORDER BY pb.order_index, pw.week_number, ps.day_of_week;
```

## Test-scenarier

### Test 1: Visa programstruktur

**Mål:** Verifiera att blocks → weeks → sessions visas korrekt

**Steg:**
1. Logga in som coach
2. Gå till `/coach/programs`
3. Klicka på ditt test-program
4. **Förväntat resultat:**
   - Du ser blocks (t.ex. "Block 1: Hypertrofi")
   - Under varje block ser du weeks (t.ex. "Hypertrofi Vecka 1")
   - Under varje week ser du sessions (t.ex. "Överkropp A")
   - Sessions är sorterade efter veckodag

**Verifiera:**
- [ ] Blocks visas i rätt ordning (order_index)
- [ ] Weeks visas under rätt block
- [ ] Sessions visas under rätt week
- [ ] Veckodagar visas korrekt (Måndag, Tisdag, etc.)

### Test 2: Skapa nytt block

**Mål:** Testa block-creation

**Steg:**
1. På program detail-sidan, klicka "Skapa block"
2. Fyll i namn: "Block 4: Test"
3. Klicka "Skapa block"
4. **Förväntat resultat:**
   - Blocket visas i listan
   - Blocket har rätt order_index (sist)

**Verifiera:**
- [ ] Blocket skapas utan fel
- [ ] Blocket visas i UI
- [ ] Blocket har rätt namn

### Test 3: Skapa ny vecka

**Mål:** Testa week-creation med och utan block

**Steg A: Vecka kopplad till block**
1. Klicka "Skapa vecka"
2. Fyll i:
   - Namn: "Test Vecka"
   - Veckonummer: 11
   - Block: Välj ett block (t.ex. "Block 1: Hypertrofi")
3. Klicka "Skapa vecka"
4. **Förväntat resultat:**
   - Veckan visas under valt block

**Steg B: Vecka direkt under program**
1. Klicka "Skapa vecka"
2. Fyll i:
   - Namn: "Standalone Vecka"
   - Veckonummer: 12
   - Block: Välj "-- Ingen block (direkt under program) --"
3. Klicka "Skapa vecka"
4. **Förväntat resultat:**
   - Veckan visas under "Veckor (direkt under program)"

**Verifiera:**
- [ ] Veckan skapas korrekt
- [ ] Veckan visas på rätt plats (under block eller direkt)
- [ ] Veckonummer är korrekt

### Test 4: Skapa nytt pass

**Mål:** Testa session-creation med week-val

**Steg:**
1. Klicka "Skapa pass"
2. Fyll i:
   - Namn: "Test Pass"
   - Vecka: Välj en vecka
   - Veckodag: Välj "Onsdag"
3. Klicka "Skapa pass"
4. **Förväntat resultat:**
   - Passet visas under vald vecka
   - Passet visas på rätt veckodag

**Verifiera:**
- [ ] Passet skapas utan fel
- [ ] Passet visas under rätt week
- [ ] Veckodag visas korrekt

### Test 5: Lägg till övning med alla fält

**Mål:** Testa exercise-creation med tempo, intensity, notes

**Steg:**
1. Klicka "Lägg till övning" på ett pass
2. Välj en övning (t.ex. "Knäböj")
3. Fyll i:
   - Sets: 4
   - Reps: 8
   - Vila: 120
   - Tempo: 3-0-1-0
   - Intensitetstyp: RPE
   - RPE-värde: 7.5
   - Coach-anteckningar: "Fokus på kontrollerad nedgång"
4. Klicka "Lägg till"
5. **Förväntat resultat:**
   - Övningen visas med alla detaljer
   - Tempo visas
   - RPE visas
   - Notes visas

**Verifiera:**
- [ ] Övningen skapas utan fel
- [ ] Alla fält sparas korrekt
- [ ] UI visar alla fält korrekt

### Test 6: Testa olika intensity-typer

**Mål:** Verifiera att olika intensity-typer fungerar

**Steg A: RPE**
1. Lägg till övning med:
   - Intensitetstyp: RPE
   - RPE-värde: 8
2. **Förväntat:** Visas som "RPE: 8"

**Steg B: % av 1RM**
1. Lägg till övning med:
   - Intensitetstyp: % av 1RM
   - % av 1RM: 85
2. **Förväntat:** Visas som "85% av 1RM"

**Steg C: Ingen intensity**
1. Lägg till övning med:
   - Intensitetstyp: Ingen
2. **Förväntat:** Inget intensity-fält visas

**Verifiera:**
- [ ] RPE visas korrekt
- [ ] % av 1RM visas korrekt
- [ ] "Ingen" döljer intensity-värde

### Test 7: Migration av befintliga sessions

**Mål:** Verifiera att gamla sessions migreras korrekt

**Steg:**
1. Om du har sessions som saknar week_id:
   - De ska automatiskt få en default week
2. Kontrollera i databasen:
```sql
-- Kontrollera att alla sessions har week_id
SELECT id, name, week_id 
FROM program_sessions 
WHERE program_id = 'DITT_PROGRAM_ID' 
AND week_id IS NULL;
```
3. **Förväntat:** Inga sessions saknar week_id

**Verifiera:**
- [ ] Migration sker automatiskt
- [ ] Default block och week skapas om behövs
- [ ] Gamla sessions visas korrekt i UI

### Test 8: Visa exercises med alla fält

**Mål:** Verifiera att alla exercise-fält visas korrekt

**Steg:**
1. Gå till ett pass som har övningar (från seed-data)
2. **Förväntat resultat:**
   - Övningsnamn visas
   - Sets x Reps visas
   - Vila visas
   - Tempo visas (om satt)
   - Intensity visas (om satt)
   - Notes visas (om satt)

**Verifiera:**
- [ ] Alla fält visas korrekt
- [ ] Formatting är läsbart
- [ ] Tomma fält visas inte

## Felsökning

### Problem: Blocks/weeks visas inte

**Lösning:**
1. Kontrollera att program_id är korrekt i seed-data
2. Verifiera att blocks/weeks finns i databasen:
```sql
SELECT * FROM program_blocks WHERE program_id = 'DITT_PROGRAM_ID';
SELECT * FROM program_weeks WHERE program_id = 'DITT_PROGRAM_ID';
```

### Problem: Sessions visas inte under weeks

**Lösning:**
1. Kontrollera att sessions har week_id:
```sql
SELECT ps.*, pw.name as week_name
FROM program_sessions ps
LEFT JOIN program_weeks pw ON ps.week_id = pw.id
WHERE ps.program_id = 'DITT_PROGRAM_ID';
```

### Problem: Exercise-fält sparas inte

**Lösning:**
1. Kontrollera att kolumnerna finns:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'session_exercises' 
AND column_name IN ('tempo', 'intensity_type', 'intensity_value', 'notes');
```

### Problem: Migration fungerar inte

**Lösning:**
1. Kontrollera konsolen för fel
2. Manuellt skapa default block/week:
```sql
-- Ersätt med ditt program_id
INSERT INTO program_blocks (program_id, name, order_index)
VALUES ('DITT_PROGRAM_ID', 'Default Block', 0)
ON CONFLICT DO NOTHING;

INSERT INTO program_weeks (program_id, week_number, name)
VALUES ('DITT_PROGRAM_ID', 1, 'Vecka 1')
ON CONFLICT DO NOTHING;
```

## Nästa steg

Efter att ha testat:
1. Testa att tilldela program till klient
2. Testa att klient ser programstrukturen
3. Testa att klient kan logga pass

## Support

Om du stöter på problem:
1. Kontrollera konsolen för JavaScript-fel
2. Kontrollera Supabase logs för databas-fel
3. Verifiera att alla kolumner finns i schema

