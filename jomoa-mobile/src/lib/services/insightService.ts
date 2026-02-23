/**
 * Hormone / training insights engine
 * Generates daily cues from cycle phase + readiness + symptoms
 * Persists to daily_insight_log for stable home screen
 */

import { supabase } from "../../config/supabase";
import { getLocalDateString } from "../utils/date";

export interface DailyInsight {
  id: string;
  client_id: string;
  date: string;
  phase: string | null;
  insight_title: string;
  insight_body: string | null;
  actions: string[];
  tags: string[];
}

export interface InsightInput {
  phase: string | null;
  cycleDay: number | null;
  readinessTier: "high" | "medium" | "low" | null;
  energyLevel: number | null;
  hasSymptoms: boolean;
}

function computeInsightTitle(input: InsightInput): string {
  if (input.phase === "menstruation") {
    if (input.energyLevel != null && input.energyLevel <= 4) {
      return "Vila och lätt rörelse";
    }
    return "Försiktig träning i mensfas";
  }
  if (input.phase === "follicular") {
    return "Bra dag för intensiv träning";
  }
  if (input.phase === "ovulation") {
    return "Peak energi – utmana dig";
  }
  if (input.phase === "luteal") {
    if (input.readinessTier === "low" || (input.energyLevel != null && input.energyLevel <= 4)) {
      return "Lugnare pass – lyssna på kroppen";
    }
    return "Stabil träning i lutealfas";
  }
  if (input.readinessTier === "low") {
    return "Prioritera återhämtning idag";
  }
  if (input.readinessTier === "high") {
    return "Redo för ett starkt pass";
  }
  return "Dagens träningsrekommendation";
}

function computeInsightBody(input: InsightInput): string {
  const parts: string[] = [];
  if (input.phase === "menstruation") {
    parts.push("Din cykel indikerar mensfas. Fokusera på rörelse som känns bra – promenad, stretching eller lätt styrka.");
  } else if (input.phase === "follicular") {
    parts.push("Follikulär fas ger ofta mer energi. Bra tillfälle för tyngre lyft eller högre intensitet.");
  } else if (input.phase === "ovulation") {
    parts.push("Kring ovulation är energin ofta hög. Utmana dig med hög intensitet eller nya övningar.");
  } else if (input.phase === "luteal") {
    parts.push("I lutealfas kan energin variera. Justera volym och intensitet efter hur du mår.");
  }
  if (input.readinessTier === "low") {
    parts.push("Din readiness är låg – överväg lättare pass eller extra vila.");
  } else if (input.readinessTier === "high") {
    parts.push("Bra readiness – du kan pusha lite mer idag.");
  }
  return parts.length > 0 ? parts.join(" ") : "Logga readiness för personliga rekommendationer.";
}

function computeActions(input: InsightInput): string[] {
  const actions: string[] = [];
  if (input.hasSymptoms && (input.phase === "menstruation" || input.phase === "luteal")) {
    actions.push("Lyssna på kroppen – justera efter symtom");
  }
  if (input.readinessTier === "low" || (input.phase === "menstruation" && (input.energyLevel ?? 5) <= 4)) {
    actions.push("Minska volym med 10–20%");
    actions.push("Överväg stretching eller promenad");
  }
  if (input.readinessTier === "high" && (input.phase === "follicular" || input.phase === "ovulation")) {
    actions.push("Öka intensiteten lite");
    actions.push("Prova en ny övning");
  }
  if (input.phase === "luteal" && !actions.length) {
    actions.push("Lyssna på kroppen");
    actions.push("Behåll teknikfokus");
  }
  if (actions.length === 0) {
    actions.push("Följ din vanliga plan");
  }
  return actions;
}

function computeTags(input: InsightInput): string[] {
  const tags: string[] = [];
  if (input.phase) tags.push(input.phase);
  if (input.readinessTier) tags.push(input.readinessTier);
  return tags;
}

export function generateInsight(input: InsightInput): Omit<DailyInsight, "id" | "client_id" | "date"> {
  return {
    phase: input.phase,
    insight_title: computeInsightTitle(input),
    insight_body: computeInsightBody(input),
    actions: computeActions(input),
    tags: computeTags(input),
  };
}

export async function getOrCreateTodayInsight(
  clientId: string,
  input: InsightInput
): Promise<{ data: DailyInsight | null; error: string | null }> {
  const date = getLocalDateString();
  try {
    const { data: existing } = await supabase
      .from("daily_insight_log")
      .select("*")
      .eq("client_id", clientId)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      return { data: existing as DailyInsight, error: null };
    }

    const insight = generateInsight(input);
    const { data: inserted, error } = await supabase
      .from("daily_insight_log")
      .insert({
        client_id: clientId,
        date,
        phase: insight.phase,
        insight_title: insight.insight_title,
        insight_body: insight.insight_body,
        actions: insight.actions,
        tags: insight.tags,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: inserted as DailyInsight, error: null };
  } catch (err) {
    const e = err as { code?: string; message?: string };
    const isTableMissing = e?.code === "PGRST205" || (e?.message && String(e.message).includes("daily_insight_log"));
    const message = e?.message ? String(e.message) : "getOrCreateTodayInsight failed";
    if (!isTableMissing && __DEV__) {
      console.warn("[insightService] getOrCreateTodayInsight:", e?.code ?? message, err);
    }
    return { data: null, error: isTableMissing ? null : message };
  }
}

export async function getTodayInsight(
  clientId: string
): Promise<{ data: DailyInsight | null; error: string | null }> {
  try {
    const date = getLocalDateString();
    const { data, error } = await supabase
      .from("daily_insight_log")
      .select("*")
      .eq("client_id", clientId)
      .eq("date", date)
      .maybeSingle();

    if (error) throw error;
    return { data: data as DailyInsight | null, error: null };
  } catch (err) {
    const e = err as { code?: string; message?: string };
    const isTableMissing = e?.code === "PGRST205" || (e?.message && String(e.message).includes("daily_insight_log"));
    const message = e?.message ? String(e.message) : "getTodayInsight failed";
    if (!isTableMissing && __DEV__) {
      console.warn("[insightService] getTodayInsight:", e?.code ?? message, err);
    }
    return { data: null, error: isTableMissing ? null : message };
  }
}
