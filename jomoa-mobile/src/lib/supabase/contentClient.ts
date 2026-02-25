/**
 * contentClient – Supabase-klient mot Content DB (exercises, programs, articles…).
 *
 * Content är publikt läsbart (anon key räcker).
 * Skrivoperationer görs ENBART via admin-appen (service role, server-side).
 */
import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_CONTENT_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY ?? "";

if (!url || !anonKey) {
  throw new Error(
    "Content DB env saknas: sätt EXPO_PUBLIC_CONTENT_SUPABASE_URL + EXPO_PUBLIC_CONTENT_SUPABASE_ANON_KEY"
  );
}

export const contentClient: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
