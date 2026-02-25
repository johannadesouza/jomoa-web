/**
 * Admin Content Client – SERVER ONLY
 *
 * Använder CONTENT_SERVICE_ROLE_KEY som kringgår RLS och tillåter
 * CRUD-operationer på alla content-tabeller.
 *
 * SÄKERHET:
 * - Denna fil får ALDRIG importeras av klientkod ("use client")
 * - CONTENT_SERVICE_ROLE_KEY ska ALDRIG exponeras i NEXT_PUBLIC_*
 * - Det finns INGA User DB-credentials i admin/ – tekniskt omöjligt att nå persondata
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.CONTENT_SUPABASE_URL;
const serviceRoleKey = process.env.CONTENT_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Admin env saknas: sätt CONTENT_SUPABASE_URL + CONTENT_SERVICE_ROLE_KEY i admin/.env.local\n" +
    "OBS: använd ALDRIG NEXT_PUBLIC_* för dessa variabler."
  );
}

export const adminContentClient = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
