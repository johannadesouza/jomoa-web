/**
 * contentRepo/appCopy – profilvarierande apptexter från Content DB.
 * Fallback: först profil (male/female/neutral), sedan neutral.
 */
import { contentClient } from "../../supabase/contentClient";
import type { PresentationProfile } from "../../shared/types/onboarding";

export type AppCopyLocale = "sv" | "en";

const PROFILES: PresentationProfile[] = ["male", "female", "neutral"];

function isProfile(s: string): s is PresentationProfile {
  return PROFILES.includes(s as PresentationProfile);
}

/**
 * Hämtar app copy för locale och profil. Slår ihop profil + neutral (profil över neutral).
 */
export async function fetchAppCopy(
  locale: AppCopyLocale = "sv",
  profile: PresentationProfile | null = "neutral"
): Promise<Record<string, string>> {
  const effectiveProfile = profile && isProfile(profile) ? profile : "neutral";
  const profilesToFetch = effectiveProfile === "neutral" ? ["neutral"] : [effectiveProfile, "neutral"];

  const { data, error } = await contentClient
    .from("app_copy")
    .select("key, profile, value")
    .eq("locale", locale)
    .in("profile", profilesToFetch);

  if (error) throw error;

  const result: Record<string, string> = {};
  const byKey: Record<string, Record<string, string>> = {};

  for (const row of data ?? []) {
    if (!row.key || row.value == null) continue;
    if (!byKey[row.key]) byKey[row.key] = {};
    byKey[row.key][row.profile] = row.value;
  }

  for (const [key, profileValues] of Object.entries(byKey)) {
    result[key] = profileValues[effectiveProfile] ?? profileValues.neutral ?? "";
  }

  return result;
}
