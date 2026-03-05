/**
 * App config / feature flags – hämtas vid start från User DB.
 * Använd useFeatureFlags() i UI; importera inte Supabase direkt i skärmar.
 */

import { supabase } from "../../config/supabase";

export type FeatureFlags = Record<string, boolean | number | string>;

const CACHE_KEY = "app_config_flags";
let cached: FeatureFlags | null = null;

export async function fetchAppConfig(): Promise<FeatureFlags> {
  if (cached) return cached;
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("key, value_json");
    if (error) throw error;
    const flags: FeatureFlags = {};
    for (const row of data ?? []) {
      if (!row?.key) continue;
      const v = row.value_json;
      if (row.key === "feature_flags" && v !== null && typeof v === "object" && !Array.isArray(v)) {
        Object.assign(flags, v);
      } else {
        flags[row.key] = v as boolean | number | string;
      }
    }
    cached = flags;
    return flags;
  } catch (e) {
    if (__DEV__) console.warn("[appConfigService] fetchAppConfig failed:", e);
    return {};
  }
}

export function getCachedFlags(): FeatureFlags | null {
  return cached;
}

export function clearAppConfigCache(): void {
  cached = null;
}
