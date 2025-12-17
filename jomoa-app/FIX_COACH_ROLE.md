# Fix Coach Role Issue

Om du inte kan logga in som coach och dirigeras till client istället, kan det bero på att din profile har fel roll i databasen.

## Lösning 1: Uppdatera roll i Supabase Studio

1. Öppna Supabase Studio
2. Gå till `profiles` tabellen
3. Hitta din användare (sök på email eller user ID)
4. Ändra `role` från `client` till `coach`
5. Spara

## Lösning 2: SQL Query

Kör denna SQL i Supabase SQL Editor:

```sql
-- Uppdatera roll för specifik användare (ersätt EMAIL_HÄR med din email)
UPDATE profiles
SET role = 'coach'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'DIN_EMAIL_HÄR'
);
```

## Lösning 3: Kontrollera din roll

Kör denna query för att se din nuvarande roll:

```sql
SELECT 
  p.id,
  p.role,
  p.full_name,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'DIN_EMAIL_HÄR';
```

## Notera

- När en ny användare skapas via `handle_new_user()` trigger, sätts rollen automatiskt till `'coach'`
- Om du skapades via invite, kan rollen ha satts till `'client'`
- Efter att ha uppdaterat rollen, logga ut och logga in igen

