# UI-rensning & Förenkling - Sammanfattning

## Översikt
Systematisk UI-rensning enligt subtraktiv design-principer. Fokus på att ta bort visuellt brus, minska antal knappar och göra varje vy tydlig i sitt syfte.

## Huvudprinciper som följts
✅ Max 1 primär handling per vy  
✅ Ev. 1 sekundär handling  
✅ Allt annat = information, inte klickbart  
✅ Visa sammanfattning först, redigering endast på begäran  
✅ Cards = läsytor, inte kontrollpaneler  
✅ Mobile-first: tumvänligt, luftigt, inga täta formulär  

---

## Vyer som rensades

### 1. Klient Dashboard (`app/client/dashboard/page.tsx`)

**Togs bort:**
- Stort readiness-formulär som visades direkt
- Period-start formulär som visades direkt
- Symptom-formulär som visades direkt
- Onödiga knappar i "Dagens fokus"-sektionen

**Gjordes:**
- ✅ Readiness-formulär är nu dolt som standard, visas bara när användaren klickar på "Uppdatera" eller "Fyll i"
- ✅ Period-start formulär är nu dolt, visas bara när användaren klickar på "Logga mensstart" / "Uppdatera mensstart"
- ✅ Symptom-formulär är nu dolt, visas bara när användaren klickar på "Logga symptom"
- ✅ Readiness-kort visar nu värden + "Uppdatera"-länk (textlänk, inte knapp)
- ✅ Period-start visar nu senaste datum + "Uppdatera mensstart"-länk
- ✅ Symptom-sektion visar nu förklarande text + "Logga symptom"-länk
- ✅ Formulär stängs automatiskt efter sparning

**Resultat:**
- Dashboard visar nu endast sammanfattningar som standard
- En primär CTA i "Dagens fokus" (Starta pass / Markera som genomfört)
- Alla formulär är dolda och visas endast på begäran

---

### 2. Coach Dashboard (`app/coach/dashboard/page.tsx`)

**Togs bort:**
- "Öppna klient"-knappar från "Behöver din attention"-cards
- "Visa senaste pass"-knappar

**Gjordes:**
- ✅ Hela cards är nu klickbara (hover-effekt + cursor-pointer)
- ✅ Klick på card navigerar direkt till klientdetaljer
- ✅ Tog bort alla action-knappar från cards

**Resultat:**
- Cards är nu läsytor, inte kontrollpaneler
- Enklare och mer intuitivt - klick på card = öppna klient

---

### 3. Coach Klientlista (`app/coach/clients/page.tsx`)

**Togs bort:**
- "Visa klient"-knapp per rad

**Gjordes:**
- ✅ Hela raden är nu klickbar (hover-effekt + cursor-pointer)
- ✅ Klick på rad navigerar direkt till klientdetaljer
- ✅ Namnet är nu vanlig text istället för knapp

**Resultat:**
- Enklare och mer intuitivt - klick på rad = öppna klient
- Mindre visuellt brus

---

### 4. Coach Program Detail (`app/coach/programs/[id]/page.tsx`)

**Togs bort:**
- 4 stora knappar i toppen (Tilldela, Skapa block, Skapa vecka, Skapa pass)
- Stora "Lägg till övning"-knappar

**Gjordes:**
- ✅ Toppknappar ersatta med textlänkar (en primär: "Skapa pass", resten sekundära)
- ✅ "Lägg till övning"-knappar gjorda till små textlänkar
- ✅ "Lägg till pass"-knappar gjorda till små textlänkar
- ✅ Formulär var redan dolda som standard (bra!)

**Resultat:**
- Max 1 primär handling (Skapa pass)
- Sekundära handlingar som textlänkar
- Mindre visuellt brus

---

### 5. Coach Client Detail (`app/coach/clients/[id]/page.tsx`)

**Togs bort:**
- Stora "Nutrition"-knapp

**Gjordes:**
- ✅ "Nutrition"-knapp ersatt med textlänk

**Resultat:**
- Mindre visuellt brus
- Tydligare hierarki

---

### 6. Coach Programlista (`app/coach/programs/page.tsx`)

**Togs bort:**
- Stora "Skapa program"-knapp

**Gjordes:**
- ✅ "Skapa program"-knapp ersatt med textlänk
- ✅ "Skapa ditt första program"-knapp ersatt med textlänk

**Resultat:**
- Mindre visuellt brus
- Tydligare hierarki

---

### 7. Klient Pass-vy (i Dashboard)

**Togs bort:**
- Stora "Spara"-knappar per övning

**Gjordes:**
- ✅ "Spara"-knappar gjorda till små textlänkar
- ✅ Kompaktare set-loggning

**Resultat:**
- Mindre visuellt brus
- Fokus på innehållet, inte knappar

---

## Typer av element som togs bort

1. **Stora primära knappar** → Textlänkar
   - "Skapa program" → textlänk
   - "Skapa block/vecka/pass" → textlänkar
   - "Nutrition" → textlänk

2. **Action-knappar i cards** → Hela card klickbar
   - "Öppna klient" → hela card klickbar
   - "Visa senaste pass" → hela card klickbar

3. **Knappar per rad i tabeller** → Hela rad klickbar
   - "Visa klient" → hela rad klickbar

4. **Formulär som visas direkt** → Dolda som standard
   - Readiness-formulär → dolt, visas på "Uppdatera"
   - Period-start formulär → dolt, visas på "Logga mensstart"
   - Symptom-formulär → dolt, visas på "Logga symptom"

5. **Stora "Spara"-knappar** → Små textlänkar
   - Set-loggning "Spara" → liten textlänk
   - "Lägg till övning" → textlänk

---

## Bekräftelse: Affärslogik

✅ All affärslogik fungerar fortfarande:
- Readiness kan fortfarande sparas (formulär visas på begäran)
- Period-start kan fortfarande loggas (formulär visas på begäran)
- Symptom kan fortfarande loggas (formulär visas på begäran)
- Pass kan fortfarande startas/avslutas (primär CTA i "Dagens fokus")
- Set-loggning fungerar fortfarande (textlänk istället för knapp)
- Coach kan fortfarande navigera till klienter (klick på card/rad)
- Coach kan fortfarande skapa program/blocks/veckor/pass (textlänkar)
- Coach kan fortfarande tilldela program (textlänk)

---

## Testlista (5-10 min)

### Klient Dashboard
- [ ] Logga in som klient
- [ ] Verifiera att dashboard visar sammanfattningar (readiness, cykel, pass)
- [ ] Klicka på "Uppdatera" i readiness-kort → formulär visas
- [ ] Fyll i readiness → spara → formulär stängs, värden uppdateras
- [ ] Klicka på "Logga mensstart" → formulär visas
- [ ] Logga mensstart → formulär stängs
- [ ] Klicka på "Logga symptom" → formulär visas
- [ ] Fyll i symptom → spara → formulär stängs
- [ ] Verifiera att "Dagens fokus" har max 1 primär CTA

### Coach Dashboard
- [ ] Logga in som coach
- [ ] Verifiera att "Behöver din attention"-cards är klickbara
- [ ] Klicka på en card → navigerar till klientdetaljer

### Coach Klientlista
- [ ] Gå till klientlista
- [ ] Verifiera att rader är klickbara (hover-effekt)
- [ ] Klicka på en rad → navigerar till klientdetaljer

### Coach Program Detail
- [ ] Gå till ett program
- [ ] Verifiera att toppknappar är textlänkar
- [ ] Klicka på "Skapa pass" → formulär visas
- [ ] Verifiera att "Lägg till övning" är textlänkar

### Coach Programlista
- [ ] Gå till programlista
- [ ] Verifiera att "Skapa program" är textlänk
- [ ] Klicka på textlänk → formulär visas

---

## Nästa steg (valfritt)

Om du vill fortsätta rensa:
- [ ] Förenkla nutrition-vyer (coach & klient)
- [ ] Förenkla pass-vyn ytterligare (kanske en egen vy istället för i dashboard)
- [ ] Gör onboarding-checklistan mer diskret
- [ ] Förenkla "Dagens fokus"-sektionen ytterligare

