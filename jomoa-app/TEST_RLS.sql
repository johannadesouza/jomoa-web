-- Test RLS policies - Kör detta i Supabase SQL Editor
-- För att verifiera att RLS fungerar korrekt

-- ============================================
-- TEST 1: Kontrollera att RLS är aktiverat
-- ============================================
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS aktiverat'
    ELSE '❌ RLS INTE aktiverat'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'clients';

-- ============================================
-- TEST 2: Lista alla policies för clients
-- ============================================
SELECT 
  policyname,
  cmd as command,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Policy har USING clause'
    ELSE '⚠️ Policy saknar USING clause'
  END as status
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY policyname;

-- ============================================
-- TEST 3: Kontrollera din profil
-- ============================================
-- Kör som inloggad användare
SELECT 
  id,
  role,
  full_name,
  CASE 
    WHEN role = 'client' THEN '✅ Korrekt roll'
    ELSE '❌ Fel roll - ska vara "client"'
  END as status
FROM profiles 
WHERE id = auth.uid();

-- ============================================
-- TEST 4: Testa att läsa client record
-- ============================================
-- Kör som inloggad client-användare
-- Detta ska fungera om RLS är korrekt konfigurerad
SELECT 
  id,
  profile_id,
  status,
  primary_coach_id,
  CASE 
    WHEN profile_id = auth.uid() THEN '✅ Matchar auth.uid()'
    ELSE '❌ Matchar INTE auth.uid()'
  END as match_status
FROM clients
WHERE profile_id = auth.uid();

-- ============================================
-- TEST 5: Se om client record finns
-- ============================================
-- Kör som service role eller coach
-- Ersätt 'USER_ID_HÄR' med faktiskt user ID
SELECT 
  c.id as client_id,
  c.profile_id,
  c.status as client_status,
  c.primary_coach_id,
  p.id as profile_id_check,
  p.role,
  p.full_name,
  CASE 
    WHEN c.id IS NOT NULL THEN '✅ Client record finns'
    ELSE '❌ Client record saknas'
  END as status
FROM profiles p
LEFT JOIN clients c ON c.profile_id = p.id
WHERE p.id = auth.uid(); -- Eller ersätt med specifikt user ID

-- ============================================
-- FIX: Om policy saknas eller är fel
-- ============================================
-- Kör detta om test 4 ger "permission denied"

-- Ta bort gamla policies
DROP POLICY IF EXISTS "Clients can view their own record" ON public.clients;
DROP POLICY IF EXISTS "Coaches can view their clients" ON public.clients;

-- Skapa enklare, mer pålitlig policy
CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Verifiera att RLS är aktiverat
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

