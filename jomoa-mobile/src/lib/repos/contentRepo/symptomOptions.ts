/**
 * contentRepo/symptomOptions – symtomalternativ (mood, cravings, bleeding) från Content DB.
 * Används i cykellogg (CycleScreen).
 */
import { contentClient } from "../../supabase/contentClient";

export type SymptomOptionType = "mood" | "cravings" | "bleeding";

export type SymptomOption = {
  option_id: string;
  label: string;
  value: number | null;
};

export async function fetchSymptomOptions(
  type: SymptomOptionType
): Promise<SymptomOption[]> {
  const { data, error } = await contentClient
    .from("symptom_options")
    .select("option_id, label, value")
    .eq("option_type", type)
    .order("order_index");
  if (error) throw error;
  return (data ?? []).map((r: { option_id: string; label: string; value: number | null }) => ({
    option_id: r.option_id,
    label: r.label,
    value: r.value,
  }));
}
