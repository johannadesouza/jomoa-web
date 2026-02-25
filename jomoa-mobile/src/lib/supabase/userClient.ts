/**
 * userClient – Supabase-klient mot User DB (persondata).
 *
 * Innehåller: clients, logs, cycle_events, body_measurements, etc.
 * RLS: strikt per användare via auth.uid().
 *
 * Prioritetsordning för URL/KEY:
 *   1. EXPO_PUBLIC_USER_SUPABASE_* (ny, explicit)
 *   2. EXPO_PUBLIC_SUPABASE_*      (legacy alias, tas bort i FAS 3)
 */
import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const url =
  process.env.EXPO_PUBLIC_USER_SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "";

const anonKey =
  process.env.EXPO_PUBLIC_USER_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";

if (!url || !anonKey) {
  throw new Error(
    "User DB env saknas: sätt EXPO_PUBLIC_USER_SUPABASE_URL + EXPO_PUBLIC_USER_SUPABASE_ANON_KEY"
  );
}

export const userClient: SupabaseClient = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
