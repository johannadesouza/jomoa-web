# Plan: Grundfunktioner - Skapa Klient, Inbjudan & Onboarding

## Översikt

Implementera grundläggande funktioner för att skapa klienter, skicka inbjudningar och hantera onboarding för både coach och klient.

## Nuvarande Status

- ✅ Databas-tabeller finns: `invites`, `clients`, `profiles`, `onboarding_tasks`, `profile_onboarding_task_status`
- ✅ `use_invite()` funktion finns i databasen
- ❌ Ingen UI för att skapa klienter
- ❌ Ingen UI för att skicka inbjudningar
- ❌ Ingen signup/invite acceptance flow
- ❌ Ingen onboarding-flow

## Fas 1: Skapa Klient

### Uppgifter

1. **Coach: Skapa klient direkt**
   - Uppdatera `app/coach/clients/page.tsx`:
     - Lägg till "Skapa klient"-länk (textlänk, enligt UI-rensning)
     - Formulär (dolt som standard):
       - Email (required)
       - Namn (required)
       - Födelsedatum (optional)
       - Kön (optional)
     - När coach skapar klient:
       - Skapa `auth.users` record (via Supabase Admin API eller edge function)
       - Skapa `profiles` record med role='client'
       - Skapa `clients` record kopplad till coach
       - Sätt `onboarding_stage='not_started'`
   - Alternativ: Använd Supabase Auth Admin API för att skapa användare

2. **Coach: Skicka inbjudan**
   - Uppdatera `app/coach/clients/page.tsx`:
     - "Skicka inbjudan"-länk (textlänk)
     - Formulär (dolt som standard):
       - Email (required)
       - Valfritt meddelande (optional)
     - När coach skickar inbjudan:
       - Generera unik token
       - Skapa `invites` record:
         - email
         - invited_by_profile_id (coach)
         - role='client'
         - token
         - expires_at (default: 7 dagar)
         - client_id (null först, sätts när klient accepterar)
       - Skicka email med invite-länk (för MVP: visa länk i UI, senare: email integration)

### Databas-struktur

- `invites`: id, email, invited_by_profile_id, role, organization_id, client_id, token, expires_at, accepted_at, created_at
- `clients`: id, profile_id, primary_coach_id, date_of_birth, gender, status, notes, onboarding_stage, created_at
- `profiles`: id, role, full_name, language, onboarding_stage, onboarding_completed_at

## Fas 2: Accept Invite & Signup

### Uppgifter

1. **Invite acceptance page**
   - `app/invite/[token]/page.tsx`:
     - Hämta invite från databasen baserat på token
     - Verifiera att invite är giltig (inte expired, inte redan accepted)
     - Visa invite-info: "Du har blivit inbjuden av [coach namn]"
     - Om användaren inte är inloggad:
       - Visa signup-formulär:
         - Email (pre-fylld från invite)
         - Lösenord (required)
         - Bekräfta lösenord (required)
         - Namn (required)
       - När användaren signar upp:
         - Skapa `auth.users` record
         - Skapa `profiles` record med role='client'
         - Anropa `use_invite(token)` funktion
         - Skapa `clients` record kopplad till coach
         - Sätt `onboarding_stage='started'`
         - Redirect till onboarding eller dashboard
     - Om användaren redan är inloggad:
       - Visa "Acceptera inbjudan"-knapp
       - När användaren accepterar:
         - Anropa `use_invite(token)` funktion
         - Skapa `clients` record om den inte finns
         - Redirect till dashboard

2. **Signup page (för framtida utökning)**
   - `app/signup/page.tsx`:
     - Formulär för att skapa konto
     - För nu: endast för coach-signup (eller redirect till invite)

## Fas 3: Onboarding

### Uppgifter

1. **Onboarding tasks setup**
   - Skapa seed data för `onboarding_tasks`:
     - Coach tasks:
       - "Skapa din första klient" (key: 'create_client')
       - "Skapa ett träningsprogram" (key: 'create_program')
       - "Lägg till pass i programmet" (key: 'add_sessions')
       - "Tilldela program till klient" (key: 'assign_program')
     - Client tasks:
       - "Logga din första readiness" (key: 'log_readiness')
       - "Logga mensstart" (key: 'log_period_start')
       - "Starta ditt första pass" (key: 'start_workout')

2. **Coach onboarding**
   - Uppdatera `app/coach/dashboard/page.tsx`:
     - Visa onboarding-checklista (redan implementerad delvis)
     - Uppdatera för att använda `onboarding_tasks` och `profile_onboarding_task_status`
     - När task är klar: markera som completed i `profile_onboarding_task_status`
     - När alla tasks är klara: sätt `profiles.onboarding_stage='completed'`

3. **Client onboarding**
   - Uppdatera `app/client/dashboard/page.tsx`:
     - Visa onboarding-checklista för nya klienter
     - Tasks baserat på `onboarding_tasks` där `target_role='client'`
     - När task är klar: markera som completed
     - När alla tasks är klara: sätt `profiles.onboarding_stage='completed'`

4. **Onboarding completion**
   - När onboarding är klar:
     - Sätt `profiles.onboarding_stage='completed'`
     - Sätt `profiles.onboarding_completed_at`
     - Dölj onboarding-checklista från dashboard

## UI-principer (enligt UI-rensning)

- Max 1 primär handling per vy
- Formulär dolda som standard, visas på begäran
- Textlänkar istället för stora knappar
- Cards = läsytor, inte kontrollpaneler
- Mobile-first, luftigt, inga täta formulär
- All text på svenska

## Filer att skapa/uppdatera

### Nya filer
- `app/invite/[token]/page.tsx` - Invite acceptance page
- `app/signup/page.tsx` - Signup page (valfritt för nu)
- `supabase/seed_onboarding_tasks.sql` - Seed data för onboarding tasks

### Uppdatera
- `app/coach/clients/page.tsx` - Lägg till "Skapa klient" och "Skicka inbjudan"
- `app/coach/dashboard/page.tsx` - Uppdatera onboarding för att använda onboarding_tasks
- `app/client/dashboard/page.tsx` - Lägg till client onboarding-checklista
- `app/login/page.tsx` - Hantera redirect för onboarding

## Implementation Order

1. Fas 1: Skapa klient & skicka inbjudan (coach kan skapa klienter)
2. Fas 2: Accept invite & signup (klient kan acceptera invite)
3. Fas 3: Onboarding (både coach och klient)

## Tekniska detaljer

### Skapa klient direkt
- För MVP: Använd Supabase Admin Client för att skapa auth.users
- Eller: Skapa edge function som hanterar detta
- Skapa profiles + clients records efter auth.users skapas

### Invite flow
1. Coach skickar invite → skapar `invites` record
2. Klient får email/länk → går till `/invite/[token]`
3. Klient signar upp → `use_invite(token)` anropas
4. System skapar `clients` record → kopplar till coach

### Onboarding tracking
- Använd `profile_onboarding_task_status` för att spåra progress
- Uppdatera `profiles.onboarding_stage` baserat på completed tasks
- Visa checklista i dashboard tills onboarding är klar

## Test-checklista

### Fas 1
- [ ] Coach kan skapa klient direkt
- [ ] Coach kan skicka inbjudan
- [ ] Invite sparas korrekt i databasen
- [ ] Invite-länk genereras korrekt

### Fas 2
- [ ] Klient kan se invite-sida med token
- [ ] Klient kan signa upp via invite
- [ ] `use_invite()` funktion anropas korrekt
- [ ] Client record skapas och kopplas till coach
- [ ] Redirect fungerar efter signup

### Fas 3
- [ ] Onboarding tasks seed data skapas
- [ ] Coach ser onboarding-checklista
- [ ] Client ser onboarding-checklista
- [ ] Tasks markeras som completed när de är klara
- [ ] Onboarding döljs när den är klar

## Nästa steg efter grundfunktioner

Fortsätt med Fas 5: Check-ins (enligt tidigare plan)

