# Debug RLS Policies

Om du får fel när du försöker hämta client data, följ dessa steg för att debugga:

## 1. Verifiera att användaren har rätt roll

Kör i Supabase SQL Editor (som användaren själv, inte service role):

```sql
-- Kontrollera din profil
SELECT id, role, full_name 
FROM profiles 
WHERE id = auth.uid();
```

Du bör se din profil med `role = 'client'`.

## 2. Testa RLS policy direkt

Kör som den inloggade användaren:

```sql
-- Testa att läsa från clients tabellen
SELECT id, profile_id, status, primary_coach_id
FROM clients
WHERE profile_id = auth.uid();
```

**Om detta fungerar:** RLS policy fungerar korrekt.

**Om detta ger fel:** RLS policy blockerar queryn. Kontrollera:
- Att `profile_id = auth.uid()` matchar
- Att användaren har `role = 'client'` i profiles

## 3. Kontrollera att client record finns

```sql
-- Se alla clients (som service role eller coach)
SELECT c.id, c.profile_id, c.status, p.full_name, p.role
FROM clients c
JOIN profiles p ON p.id = c.profile_id
WHERE p.id = 'DIN_USER_ID_HÄR';
```

## 4. Testa RLS policy manuellt

Som service role, testa policy:

```sql
-- Simulera som client user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'DIN_USER_ID_HÄR';

-- Testa query
SELECT id FROM clients WHERE profile_id = 'DIN_USER_ID_HÄR';
```

## 5. Vanliga problem

### Problem: "permission denied for table clients"
**Lösning:** RLS är aktiverat men policy saknas eller är felaktig.
- Kör `20250120000001_add_rls_policies.sql` migrationen igen

### Problem: "No rows returned" (PGRST116)
**Lösning:** Det finns ingen client record för användaren.
- Detta är OK för nya användare
- Coach måste skapa client record först

### Problem: Empty error object `{}`
**Lösning:** Detta kan vara ett nätverksfel eller timeout.
- Kontrollera Supabase connection
- Kolla browser network tab för detaljer

## 6. Verifiera RLS är aktiverat

```sql
-- Kontrollera att RLS är aktiverat
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'clients';
```

`rowsecurity` ska vara `true`.

## 7. Lista alla policies för clients

```sql
-- Se alla policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'clients';
```

## 8. Testa från frontend

Öppna browser console och kör:

```javascript
// Testa query direkt
const { data, error } = await supabase
  .from('clients')
  .select('id, status')
  .eq('profile_id', 'DIN_USER_ID')
  .maybeSingle();

console.log('Data:', data);
console.log('Error:', error);
```

Om error är tom `{}`, kan det vara:
- Nätverksfel
- Timeout
- CORS-problem
- Supabase connection problem

Kontrollera:
- Browser Network tab → se om request går igenom
- Supabase Dashboard → Logs → se om det finns errors

