/**
 * Strategy decisions – user accept/reject of suggested adjustments
 * Used for learning: system adjusts future suggestions based on acceptance rate
 */

import { supabase } from "../../config/supabase";

export interface StrategyDecisionInput {
  clientId: string;
  sessionId: string;
  isStandalone: boolean;
  suggestedVolumeModifier: number;
  accepted: boolean;
}

export interface StrategyAcceptanceStats {
  acceptanceRate: number;
  decisionCount: number;
}

const DEFAULT_LOOKBACK = 20;

/**
 * Save a strategy decision (called when user starts workout with a suggestion)
 */
export async function saveStrategyDecision(
  input: StrategyDecisionInput
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("strategy_decisions").insert({
    client_id: input.clientId,
    session_id: input.sessionId,
    is_standalone: input.isStandalone,
    suggested_volume_modifier: input.suggestedVolumeModifier,
    accepted: input.accepted,
  });

  if (error) {
    console.error("saveStrategyDecision:", error);
    return { error };
  }
  return { error: null };
}

/**
 * Fetch acceptance rate for the last N decisions (default 20)
 */
export async function fetchAcceptanceRate(
  clientId: string,
  lookback = DEFAULT_LOOKBACK
): Promise<StrategyAcceptanceStats> {
  const { data, error } = await supabase
    .from("strategy_decisions")
    .select("accepted")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(lookback);

  if (error) {
    console.error("fetchAcceptanceRate:", error);
    return { acceptanceRate: 0.5, decisionCount: 0 };
  }

  const decisions = data ?? [];
  const decisionCount = decisions.length;
  if (decisionCount === 0) {
    return { acceptanceRate: 0.5, decisionCount: 0 };
  }

  const acceptedCount = decisions.filter((d) => d.accepted === true).length;
  const acceptanceRate = acceptedCount / decisionCount;

  return { acceptanceRate, decisionCount };
}
