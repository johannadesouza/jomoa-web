/**
 * Cycle Symptom Service
 * Handles cycle symptoms (cramps, bleeding, mood, energy, etc.)
 */

import { supabase } from "../../config/supabase";

export interface CycleSymptom {
  id?: string;
  client_id: string;
  date: string;
  cramps_severity?: number | null;
  bleeding_level?: number | null;
  mood?: string | null;
  energy_level?: number | null;
  sleep_quality?: number | null;
  stress_level?: number | null;
  cravings?: string | null;
  other_symptoms?: string | null;
}

export interface CycleSymptomInput {
  date: string;
  cramps_severity?: number | null;
  bleeding_level?: number | null;
  mood?: string | null;
  energy_level?: number | null;
  sleep_quality?: number | null;
  stress_level?: number | null;
  cravings?: string | null;
  other_symptoms?: string | null;
}

export async function saveCycleSymptom(
  clientId: string,
  input: CycleSymptomInput
): Promise<{ error: Error | null }> {
  try {
    const { data: existing } = await supabase
      .from("cycle_symptoms")
      .select("id")
      .eq("client_id", clientId)
      .eq("date", input.date)
      .maybeSingle();

    const row: Record<string, unknown> = {};
    if (input.cramps_severity !== undefined) row.cramps_severity = input.cramps_severity;
    if (input.bleeding_level !== undefined) row.bleeding_level = input.bleeding_level;
    if (input.mood !== undefined) row.mood = input.mood;
    if (input.energy_level !== undefined) row.energy_level = input.energy_level;
    if (input.sleep_quality !== undefined) row.sleep_quality = input.sleep_quality;
    if (input.stress_level !== undefined) row.stress_level = input.stress_level;
    if (input.cravings !== undefined) row.cravings = input.cravings;
    if (input.other_symptoms !== undefined) row.other_symptoms = input.other_symptoms;

    if (existing?.id && Object.keys(row).length > 0) {
      const { error } = await supabase
        .from("cycle_symptoms")
        .update(row)
        .eq("id", existing.id);
      if (error) throw error;
    } else if (!existing?.id) {
      const { error } = await supabase.from("cycle_symptoms").insert({
        client_id: clientId,
        date: input.date,
        cramps_severity: input.cramps_severity ?? null,
        bleeding_level: input.bleeding_level ?? null,
        mood: input.mood ?? null,
        energy_level: input.energy_level ?? null,
        sleep_quality: input.sleep_quality ?? null,
        stress_level: input.stress_level ?? null,
        cravings: input.cravings ?? null,
        other_symptoms: input.other_symptoms ?? null,
      });
      if (error) throw error;
    }
    return { error: null };
  } catch (err) {
    console.error("Error saving cycle symptom:", err);
    return {
      error: err instanceof Error ? err : new Error("Kunde inte spara symtom"),
    };
  }
}

export async function getCycleSymptomsForRange(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<CycleSymptom[]> {
  try {
    const { data, error } = await supabase
      .from("cycle_symptoms")
      .select("*")
      .eq("client_id", clientId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;
    return (data ?? []) as CycleSymptom[];
  } catch (err) {
    console.error("Error fetching cycle symptoms:", err);
    return [];
  }
}
