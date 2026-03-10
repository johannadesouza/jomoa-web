/**
 * contentClient (web) – Supabase-klient mot Content DB.
 *
 * Används i Next.js API routes och server components för att läsa
 * articles, programs, exercises etc.
 *
 * SÄKERHET: Denna klient exponerar INGA User DB-credentials.
 * Anon key är ok att använda för READ av publikt content.
 *
 * Lazy init: kraschar först vid första användning om env saknas,
 * så att next dev kan starta även utan .env.local.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getContentClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_CONTENT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Content DB env saknas: sätt NEXT_PUBLIC_CONTENT_SUPABASE_URL + NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY i web/.env.local (kopiera från web/.env.example)"
    );
  }
  _client = createClient(url, anonKey);
  return _client;
}

/** Lazy: första anrop som använder klienten kräver att env är satt. */
export const contentClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getContentClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
