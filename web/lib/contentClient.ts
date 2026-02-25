/**
 * contentClient (web) – Supabase-klient mot Content DB.
 *
 * Används i Next.js API routes och server components för att läsa
 * articles, programs, exercises etc.
 *
 * SÄKERHET: Denna klient exponerar INGA User DB-credentials.
 * Anon key är ok att använda för READ av publikt content.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_CONTENT_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error(
    "Content DB env saknas: sätt NEXT_PUBLIC_CONTENT_SUPABASE_URL + NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY i web/.env.local"
  );
}

export const contentClient = createClient(url, anonKey);
