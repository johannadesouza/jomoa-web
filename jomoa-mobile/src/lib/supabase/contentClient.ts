/**
 * contentClient – Supabase-klient mot Content DB (exercises, programs, articles…).
 *
 * Content är publikt läsbart (anon key räcker).
 * Skrivoperationer görs ENBART via admin-appen (service role, server-side).
 *
 * FAS 1–2: Om EXPO_PUBLIC_CONTENT_SUPABASE_URL saknas faller vi tillbaka på
 *           User DB-URL:en (dual-read-läge). Feature flag USE_SEPARATE_CONTENT_DB
 *           styr vilken klient som faktiskt används i repos.
 */
import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const contentUrl = process.env.EXPO_PUBLIC_CONTENT_SUPABASE_URL ?? "";
const contentAnonKey = process.env.EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY ?? "";

// Fallback till User DB under FAS 1–2 om Content DB ännu inte är konfigurerad
const fallbackUrl =
  process.env.EXPO_PUBLIC_USER_SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "";
const fallbackKey =
  process.env.EXPO_PUBLIC_USER_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";

const url = contentUrl || fallbackUrl;
const anonKey = contentAnonKey || fallbackKey;

if (!url || !anonKey) {
  throw new Error(
    "Content DB env saknas: sätt EXPO_PUBLIC_CONTENT_SUPABASE_URL + EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY"
  );
}

export const contentClient: SupabaseClient = createClient(url, anonKey, {
  // Ingen auth-konfiguration – content kräver inte inloggad session
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
