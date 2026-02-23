/**
 * Utmärkelser – synk med client_awards + beräkning från träningsdata
 */
import { supabase } from "../../config/supabase";
import { fetchWeeklyStats } from "./workoutLogService";
import { fetchInsightStats } from "./workoutLogService";

export interface ClientAward {
  id: string;
  client_id: string;
  award_type: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

export type AwardType =
  | "streak_1"
  | "streak_7"
  | "streak_14"
  | "sessions_5"
  | "sessions_10"
  | "first_workout";

const AWARD_DISPLAY: Record<AwardType, { label: string; icon: string; description: string }> = {
  streak_1: { label: "1+ dag streak", icon: "🔥", description: "Konsekvent träning" },
  streak_7: { label: "1 vecka streak", icon: "⭐", description: "En hel vecka i rad" },
  streak_14: { label: "2 veckor streak", icon: "🌟", description: "Fantastiskt jobbat" },
  sessions_5: { label: "5+ pass i månaden", icon: "💪", description: "Bra volym" },
  sessions_10: { label: "10+ pass i månaden", icon: "🏆", description: "Imponerande träningsvilja" },
  first_workout: { label: "Första passet", icon: "🎉", description: "Du har börjat" },
};

export function getAwardDisplay(type: string) {
  return (
    AWARD_DISPLAY[type as AwardType] ?? {
      label: type,
      icon: "🏅",
      description: "Utmärkelse",
    }
  );
}

export async function fetchEarnedAwards(clientId: string): Promise<ClientAward[]> {
  const { data, error } = await supabase
    .from("client_awards")
    .select("*")
    .eq("client_id", clientId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("fetchEarnedAwards:", error);
    return [];
  }

  return (data || []) as ClientAward[];
}

export async function ensureAwardsSynced(clientId: string): Promise<{ error: Error | null }> {
  try {
    const [stats, existingAwards] = await Promise.all([
      fetchInsightStats(clientId).then((s) => ({ streak: s.streak, sessionsThisMonth: s.sessionsThisMonth })),
      fetchEarnedAwards(clientId),
    ]);

    const existingTypes = new Set(existingAwards.map((a) => a.award_type));
    const toInsert: { client_id: string; award_type: AwardType; metadata: Record<string, unknown> }[] = [];

    if (stats.streak >= 1 && !existingTypes.has("streak_1"))
      toInsert.push({ client_id: clientId, award_type: "streak_1", metadata: { streak: stats.streak } });
    if (stats.streak >= 7 && !existingTypes.has("streak_7"))
      toInsert.push({ client_id: clientId, award_type: "streak_7", metadata: {} });
    if (stats.streak >= 14 && !existingTypes.has("streak_14"))
      toInsert.push({ client_id: clientId, award_type: "streak_14", metadata: {} });
    if (stats.sessionsThisMonth >= 5 && !existingTypes.has("sessions_5"))
      toInsert.push({ client_id: clientId, award_type: "sessions_5", metadata: { count: stats.sessionsThisMonth } });
    if (stats.sessionsThisMonth >= 10 && !existingTypes.has("sessions_10"))
      toInsert.push({ client_id: clientId, award_type: "sessions_10", metadata: {} });
    if (stats.sessionsThisMonth >= 1 && !existingTypes.has("first_workout"))
      toInsert.push({ client_id: clientId, award_type: "first_workout", metadata: {} });

    if (toInsert.length === 0) return { error: null };

    for (const row of toInsert) {
      const { error } = await supabase.from("client_awards").insert({
        client_id: row.client_id,
        award_type: row.award_type,
        metadata: row.metadata,
      });
      if (error && error.code !== "23505") {
        console.error("ensureAwardsSynced insert:", error);
        return { error };
      }
    }
    return { error: null };
  } catch (e) {
    console.error("ensureAwardsSynced:", e);
    return { error: e instanceof Error ? e : new Error("Unknown error") };
  }
}
