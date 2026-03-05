/**
 * contentRepo/onboardingCopy – onboarding-texter från Content DB.
 * Returnerar Record<id, value> så att skärmar kan slå upp t.ex. copy.path_choice_title.
 */
import { contentClient } from "../../supabase/contentClient";

export type OnboardingCopyLocale = "sv" | "en";

export async function fetchOnboardingCopy(
  locale: OnboardingCopyLocale = "sv"
): Promise<Record<string, string>> {
  const { data, error } = await contentClient
    .from("onboarding_copy")
    .select("id, value_sv, value_en");
  if (error) throw error;
  const result: Record<string, string> = {};
  for (const row of data ?? []) {
    const value = locale === "en" && row.value_en ? row.value_en : row.value_sv;
    if (row.id && value) result[row.id] = value;
  }
  return result;
}
