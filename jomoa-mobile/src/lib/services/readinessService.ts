/**
 * Readiness Service
 * Daily check-in: sleep, stress, energy, soreness
 */

import { supabase } from "../../config/supabase";
import { getLocalDateString } from "../utils/date";
import { calculateReadinessScore, type ReadinessScoreWeights } from "../domain/readinessScore";
import { getCachedFlags } from "./appConfigService";
import { isDemoMode, getRuntimeDemoPersona } from "../demo/demoMode";
import { getDemoReadiness } from "../demo/demoData";

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
  if (isDemoMode()) {
    return { success: false, error: "Demo: Readiness är read-only" };
  }
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
  // #region agent log
  fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H3',location:'readinessService.ts:getReadinessForDate',message:'getReadinessForDate enter',data:{isDemoMode:isDemoMode(),clientIdPresent:!!clientId,date},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (isDemoMode()) {
    const persona = getRuntimeDemoPersona();
    // #region agent log
    fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H3',location:'readinessService.ts:demoReturn',message:'getReadinessForDate demo return',data:{persona},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return { data: getDemoReadiness(persona, date), error: null };
  }
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
  if (isDemoMode()) {
    const persona = getRuntimeDemoPersona();
    const start = new Date(startDate + "T12:00:00");
    const end = new Date(endDate + "T12:00:00");
    const out: ReadinessRecord[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().slice(0, 10);
      const r = getDemoReadiness(persona, date);
      if (r) out.push(r);
    }
    return out;
  }
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
