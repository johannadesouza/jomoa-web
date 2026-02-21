import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

function validateSupabaseEnv(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl && "EXPO_PUBLIC_SUPABASE_URL",
      !supabaseAnonKey && "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    ].filter(Boolean);
    throw new Error(
      `Supabase env missing: ${missing.join(", ")}. Add to .env and restart.`
    );
  }
  if (!supabaseUrl.startsWith("https://")) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL must start with https://");
  }
}

validateSupabaseEnv();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

