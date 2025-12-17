# Snabbstart: Testa Blocks & Weeks

## Snabbaste vägen att komma igång

### Steg 1: Starta Supabase lokalt
```bash
cd jomoa-app
supabase start
```

### Steg 2: Kör seed-data för övningar (om inte redan gjort)
```bash
# Via Supabase Studio SQL Editor eller:
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
```

### Steg 3: Logga in i appen
1. Starta Next.js: `npm run dev`
2. Öppna `http://localhost:3000/login`
3. Logga in som coach (använd dina test-credentials)

### Steg 4: Skapa ett test-program
1. Gå till `/coach/programs`
2. Klicka "Skapa program"
3. Fyll i namn: "Testprogram Blocks"
4. Klicka "Skapa"

### Steg 5: Hämta program_id
**Alternativ A: Från URL**
- Efter att ha skapat programmet, kolla URL: `/coach/programs/[PROGRAM_ID]`
- Kopiera PROGRAM_ID

**Alternativ B: Från Supabase Studio**
1. Öppna Supabase Studio: `http://localhost:54323`
2. Gå till SQL Editor
3. Kör:
```sql
SELECT id, name FROM training_programs ORDER BY created_at DESC LIMIT 1;
```

### Steg 6: Kör seed-data för blocks/weeks

**Alternativ A: Automatisk (rekommenderas)**
1. Öppna Supabase Studio SQL Editor
2. Kör `supabase/seed_blocks_weeks_auto.sql`
3. Scriptet hittar automatiskt ditt senaste program

**Alternativ B: Manuell**
1. Öppna `supabase/seed_blocks_weeks.sql`
2. Ersätt alla `'DIN_PROGRAM_ID_HÄR'` (3 ställen) med ditt program_id
3. Kör scriptet i Supabase Studio SQL Editor

### Steg 7: Testa i appen
1. Gå tillbaka till program detail-sidan (`/coach/programs/[PROGRAM_ID]`)
2. Du bör nu se:
   - Blocks (Block 1: Hypertrofi, Block 2: Styrka, Block 3: Peaking)
   - Weeks under varje block
   - Sessions under varje week
   - Exercises med tempo/intensity/notes

## Snabbtest-checklista

- [ ] Blocks visas korrekt
- [ ] Weeks visas under blocks
- [ ] Sessions visas under weeks
- [ ] Kan skapa nytt block
- [ ] Kan skapa ny vecka (med och utan block)
- [ ] Kan skapa nytt pass (väljer week)
- [ ] Kan lägga till övning med tempo
- [ ] Kan lägga till övning med RPE
- [ ] Kan lägga till övning med % av 1RM
- [ ] Kan lägga till coach-notes
- [ ] Alla fält visas korrekt i UI

## Vanliga problem

**Problem:** "Ingen programstruktur ännu" visas
- **Lösning:** Kör seed-data för blocks/weeks (steg 6)

**Problem:** Blocks visas inte
- **Lösning:** Verifiera att program_id är korrekt i seed-scriptet

**Problem:** Sessions visas inte
- **Lösning:** Kontrollera att sessions har week_id i databasen

## Nästa steg

Efter att ha testat grundfunktionaliteten, se `TESTING_BLOCKS_WEEKS.md` för detaljerade test-scenarier.

