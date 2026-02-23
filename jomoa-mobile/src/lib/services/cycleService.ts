/**
 * Cycle Service
 * Handles cycle events and phases from Supabase
 */

import { supabase } from "../../config/supabase";

export type CycleEventType =
  | "period_start"
  | "period_end"
  | "ovulation_estimate"
  | "ovulation_confirmed";

export interface CycleEvent {
  id: string;
  client_id: string;
  date: string;
  event_type: string;
  source: string;
  note: string | null;
  created_at: string;
}

export interface CyclePhaseRecord {
  id: string;
  client_id: string;
  date: string;
  phase: string;
  source: string;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all period start dates for a client (for phase calculation on historical dates)
 */
export async function getAllPeriodStarts(
  clientId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("cycle_events")
      .select("date")
      .eq("client_id", clientId)
      .eq("event_type", "period_start")
      .order("date", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((r) => r.date).filter(Boolean);
  } catch (err) {
    console.error("Error fetching period starts:", err);
    return [];
  }
}

/**
 * Get latest period start date for a client
 */
export async function getLatestPeriodStart(
  clientId: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("cycle_events")
      .select("date")
      .eq("client_id", clientId)
      .eq("event_type", "period_start")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return { data: data?.date ?? null, error: null };
  } catch (err) {
    console.error("Error fetching latest period start:", err);
    return {
      data: null,
      error: err instanceof Error ? err.message : "Kunde inte hämta senaste mensstart",
    };
  }
}

/**
 * Save period start event
 */
export async function savePeriodStart(
  clientId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("cycle_events").insert({
      client_id: clientId,
      date,
      event_type: "period_start",
      source: "client",
    });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error saving period start:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Kunde inte spara periodstart",
    };
  }
}

/**
 * Get cycle phases for a date range
 */
export async function getCyclePhases(
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: CyclePhaseRecord[]; error: string | null }> {
  try {
    let query = supabase
      .from("cycle_phases")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: true });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data, error } = await query;

    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error("Error fetching cycle phases:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Kunde inte hämta cykelfaser",
    };
  }
}
