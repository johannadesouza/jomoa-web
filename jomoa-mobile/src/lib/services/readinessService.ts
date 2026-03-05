/**
 * Readiness Service
 * Daily check-in: sleep, stress, energy, soreness
 */

import { supabase } from "../../config/supabase";
import { getLocalDateString } from "../utils/date";
import { calculateReadinessScore, type ReadinessScoreWeights } from "../domain/readinessScore";
import { getCachedFlags } from "./appConfigService";

export interface ReadinessData {
  client_id: string;
  date: string;
  sleep_hours?: number | null;
  sleep_quality?: number | null;
  stress_level?: number | null;
  energy_level?: number | null;
  soreness?: number | null;
}

export interface ReadinessRecord {
  id: string;
  client_id: string;
  date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  energy_level: number | null;
  soreness: number | null;
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
}

function getReadinessWeightsFromConfig(): ReadinessScoreWeights | null {
  const flags = getCachedFlags();
  if (!flags) return null;
  const raw = (flags as Record<string, unknown>)["readiness_weights"];
  if (raw == null) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as ReadinessScoreWeights;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as ReadinessScoreWeights;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveReadiness(
  data: ReadinessData
): Promise<{ success: boolean; error?: string }> {
  try {
    const weights = getReadinessWeightsFromConfig();
    const readinessScore = calculateReadinessScore(data, weights);

    const { data: existing } = await supabase
      .from("daily_readiness")
      .select("id")
      .eq("client_id", data.client_id)
      .eq("date", data.date)
      .maybeSingle();

    const payload = {
      sleep_hours: data.sleep_hours ?? null,
      sleep_quality: data.sleep_quality ?? null,
      stress_level: data.stress_level ?? null,
      energy_level: data.energy_level ?? null,
      soreness: data.soreness ?? null,
      readiness_score: readinessScore,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from("daily_readiness")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("daily_readiness")
        .insert({
          client_id: data.client_id,
          date: data.date,
          ...payload,
        });
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error("Error saving readiness:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Kunde inte spara",
    };
  }
}

export async function getTodayReadiness(
  clientId: string
): Promise<{ data: ReadinessRecord | null; error: string | null }> {
  return getReadinessForDate(clientId, getLocalDateString());
}

export async function getReadinessForDate(
  clientId: string,
  date: string
): Promise<{ data: ReadinessRecord | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("daily_readiness")
      .select("*")
      .eq("client_id", clientId)
      .eq("date", date)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return { data: data ?? null, error: null };
  } catch (err) {
    console.error("Error fetching readiness:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Kunde inte hämta",
    };
  }
}

/** Fetch readiness history for trend graphs */
export async function getReadinessHistory(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<ReadinessRecord[]> {
  try {
    const { data, error } = await supabase
      .from("daily_readiness")
      .select("*")
      .eq("client_id", clientId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;
    return (data ?? []) as ReadinessRecord[];
  } catch (err) {
    console.error("Error fetching readiness history:", err);
    return [];
  }
}
