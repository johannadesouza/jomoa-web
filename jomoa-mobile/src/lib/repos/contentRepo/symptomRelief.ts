/**
 * contentRepo/symptomRelief – symtomtips (trötthet, uppblåsthet, energi, sömn) från Content DB.
 * Används i SymptomReliefCards / SymptomReliefModal.
 */
import { contentClient } from "../../supabase/contentClient";

export type SymptomReliefEntry = {
  symptom_id: string;
  label: string;
  icon: string | null;
  headline: string;
  tips: string[];
};

export async function fetchSymptomRelief(): Promise<SymptomReliefEntry[]> {
  const { data, error } = await contentClient
    .from("symptom_relief_tips")
    .select("symptom_id, label, icon, headline, tips")
    .order("symptom_id");
  if (error) throw error;
  return (data ?? []).map((r: { symptom_id: string; label: string; icon: string | null; headline: string; tips: string[] }) => ({
    symptom_id: r.symptom_id,
    label: r.label,
    icon: r.icon,
    headline: r.headline,
    tips: Array.isArray(r.tips) ? r.tips : [],
  }));
}

export async function fetchSymptomReliefBySymptom(
  symptomId: string
): Promise<SymptomReliefEntry | null> {
  const { data, error } = await contentClient
    .from("symptom_relief_tips")
    .select("symptom_id, label, icon, headline, tips")
    .eq("symptom_id", symptomId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    symptom_id: data.symptom_id,
    label: data.label,
    icon: data.icon,
    headline: data.headline,
    tips: Array.isArray(data.tips) ? data.tips : [],
  };
}
