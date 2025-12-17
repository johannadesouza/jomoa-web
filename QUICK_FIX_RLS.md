# Quick Fix för RLS Problem

Om du får "Åtkomst nekad" när du försöker hämta client data, följ dessa steg:

## Snabb Fix

### 1. Kör fix-migrationen

I Supabase SQL Editor, kör:

```sql
-- Fix RLS policies for clients table
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;
DROP POLICY IF EXISTS "Coaches can view their clients" ON public.clients;

-- Recreate with simpler logic
CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Coaches can view their clients"
ON public.clients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
  AND primary_coach_id = auth.uid()
);

-- Verify RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
```

### 2. Eller kör hela fix-migrationen

Kör filen: `supabase/migrations/20250120000002_fix_rls_clients.sql`

## Verifiera att det fungerar

### Test 1: Som inloggad client

I Supabase SQL Editor (som den inloggade användaren):

```sql
-- Detta ska fungera nu
SELECT id, profile_id, status 
FROM clients 
WHERE profile_id = auth.uid();
```

### Test 2: Kontrollera din profil

```sql
-- Kontrollera att du har rätt roll
SELECT id, role, full_name 
FROM profiles 
WHERE id = auth.uid();
```

Du bör se `role = 'client'`.

### Test 3: Kontrollera att client record finns

Som coach eller service role:

```sql
-- Se om det finns en client record för användaren
SELECT c.*, p.role, p.full_name
FROM clients c
JOIN profiles p ON p.id = c.profile_id
WHERE p.id = 'DIN_USER_ID_HÄR';
```

## Vanliga problem

### Problem: "permission denied"
**Orsak:** RLS policy blockerar queryn
**Lösning:** Kör fix-migrationen ovan

### Problem: "No rows returned"
**Orsak:** Det finns ingen client record
**Lösning:** Coach måste skapa client record först

### Problem: "User is not a client"
**Orsak:** Användaren har inte `role = 'client'` i profiles
**Lösning:** Uppdatera profil:
```sql
UPDATE profiles 
SET role = 'client' 
WHERE id = 'DIN_USER_ID';
```

## Debug steg

1. **Kontrollera RLS är aktiverat:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'clients';
   ```
   `rowsecurity` ska vara `true`.

2. **Lista policies:**
   ```sql
   SELECT policyname, cmd, qual
   FROM pg_policies
   WHERE tablename = 'clients';
   ```

3. **Testa policy direkt:**
   ```sql
   -- Som inloggad användare
   SET ROLE authenticated;
   SELECT id FROM clients WHERE profile_id = auth.uid();
   ```

## Om inget fungerar

Temporärt inaktivera RLS för testing (ENDAST FÖR DEBUGGING):

```sql
-- ⚠️ ENDAST FÖR TESTING - INTE I PRODUCTION
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
```

**VIKTIGT:** Aktivera RLS igen efter testing:
```sql
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
```

