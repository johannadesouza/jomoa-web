/**
 * Readiness Service
 * Daily check-in: sleep, stress, energy, soreness
 */

import { supabase } from "../../config/supabase";
import { getLocalDateString } from "../utils/date";

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

function calculateReadinessScore(data: {
  sleep_quality?: number | null;
  energy_level?: number | null;
  stress_level?: number | null;
  soreness?: number | null;
}): number | null {
  const factors: number[] = [];
  if (data.sleep_quality != null) {
    factors.push((data.sleep_quality / 10) * 25);
  }
  if (data.energy_level != null) {
    factors.push((data.energy_level / 10) * 30);
  }
  if (data.stress_level != null) {
    factors.push(((10 - data.stress_level) / 10) * 20);
  }
  if (data.soreness != null) {
    factors.push(((10 - data.soreness) / 10) * 25);
  }
  if (factors.length === 0) return null;
  const score = factors.reduce((a, b) => a + b, 0) / factors.length;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export async function saveReadiness(
  data: ReadinessData
): Promise<{ success: boolean; error?: string }> {
  try {
    const readinessScore = calculateReadinessScore(data);

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
