# Completion Plan - Göra sidan komplett

## Prioriterad lista över vad som saknas/förbättras

### 🔴 Hög prioritet (Must-have för funktionell app)

#### 1. Invite Acceptance Flow
- [ ] **`app/invite/[token]/page.tsx`** - Invite acceptance page
  - Visa invite-info
  - Signup-formulär om inte inloggad
  - Acceptera invite om redan inloggad
  - Anropa `use_invite()` funktion
  - Redirect till dashboard/onboarding

#### 2. Coach Dashboard - Förbättringar
- [ ] **Notiscenter card** - Visa senaste notifikationer/aktiviteter
- [ ] **Automatiska adjustment prompts** - Förslag baserat på data
- [ ] Förbättra onboarding-checklista (använd `onboarding_tasks`)

#### 3. Coach Klienter - Förbättringar
- [ ] **Filter/Sök** - Filtrera på status, taggar, grupper
- [ ] **Taggar** - Visa och hantera taggar
- [ ] **Grupper** - Visa grupper i listan
- [ ] Förbättra "Skicka inbjudan" (visa invite-länk tydligare)

#### 4. Coach Klientprofil - Fyll i placeholders
- [ ] **Träning-tab** - Visa träningshistorik, grafer, progress
- [ ] **Kost-tab** - Visa nutrition plans, dagliga targets
- [ ] **Insikter-tab** - Förbättra med mer data/grafer

#### 5. Client Sidor - Fyll i placeholders
- [ ] **Insights page** - Fyll i med cykeldata, readiness trends, grafer
- [ ] **Nutrition page** - Visa dagliga targets, nutrition plans
- [ ] **Settings page** - Fyll i med inställningar

### 🟡 Medel prioritet (Should-have)

#### 6. Program Management
- [ ] **Program detail page** - Förbättra med mer info
- [ ] **Program editing** - Redigera befintliga program
- [ ] **Program templates** - Spara som mallar

#### 7. Workout Logging
- [ ] **Workout detail page** - Förbättra med mer funktionalitet
- [ ] **Set logging** - Logga sets/reps/RPE per övning
- [ ] **Coach comments** - Coach kan kommentera pass

#### 8. Check-ins
- [ ] **Check-in templates** - Förbättra
- [ ] **Check-in responses** - Visa och hantera svar

### 🟢 Låg prioritet (Nice-to-have)

#### 9. UX Polish
- [ ] Toast notifications för success/error
- [ ] Bättre form validation
- [ ] Loading states överallt
- [ ] Empty states överallt
- [ ] Mobile responsiveness improvements

#### 10. Ytterligare Features
- [ ] Performance tests & kroppsmått
- [ ] Journal & Coach-noter
- [ ] Meddelanden/kommunikation
- [ ] Nutrition plans (Fas 3)

## Rekommenderad Implementation Order

### Steg 1: Invite Flow (Kritiskt)
1. Skapa/uppdatera `app/invite/[token]/page.tsx`
2. Testa invite acceptance
3. Verifiera att `use_invite()` funktion anropas

### Steg 2: Coach Dashboard Polish
1. Lägg till Notiscenter card
2. Förbättra onboarding-checklista
3. Lägg till adjustment prompts (enklare version)

### Steg 3: Coach Klienter - Filter & Sök
1. Lägg till sök-fält
2. Lägg till filter (status, grupper)
3. Förbättra "Skicka inbjudan" UI

### Steg 4: Fyll i Placeholders
1. Coach Klientprofil - Träning tab
2. Coach Klientprofil - Kost tab
3. Client Insights page
4. Client Nutrition page
5. Client Settings page

### Steg 5: UX Polish
1. Toast notifications
2. Form validation
3. Loading/Empty states
4. Mobile improvements

## Nästa steg

Vilken del vill du börja med? Jag rekommenderar att börja med **Invite Flow** eftersom det är kritiskt för att klienter ska kunna komma igång.

