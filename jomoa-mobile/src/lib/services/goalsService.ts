/**
 * Mål – synk med client_goals
 */
import { supabase } from "../../config/supabase";

export type GoalType = "fitness" | "nutrition" | "wellness" | "event";

export interface ClientGoal {
  id: string;
  client_id: string;
  goal_type: GoalType;
  description: string | null;
  target_value: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  fitness: "Träning",
  nutrition: "Nutrition",
  wellness: "Hälsa",
  event: "Event",
};

export function getGoalTypeLabel(type: GoalType): string {
  return GOAL_TYPE_LABELS[type] ?? type;
}

export async function fetchGoals(clientId: string): Promise<ClientGoal[]> {
  const { data, error } = await supabase
    .from("client_goals")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchGoals:", error);
    return [];
  }

  return (data || []) as ClientGoal[];
}

export async function createGoal(
  clientId: string,
  goalType: GoalType,
  description?: string | null,
  targetValue?: string | null
): Promise<{ id: string | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("client_goals")
    .insert({
      client_id: clientId,
      goal_type: goalType,
      description: description ?? null,
      target_value: targetValue ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createGoal:", error);
    return { id: null, error };
  }
  return { id: data?.id ?? null, error: null };
}

export async function updateGoal(
  clientId: string,
  goalId: string,
  updates: Partial<Pick<ClientGoal, "description" | "target_value" | "is_active">>
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("client_goals")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("client_id", clientId);

  if (error) {
    console.error("updateGoal:", error);
    return { error };
  }
  return { error: null };
}

export async function deleteGoal(
  clientId: string,
  goalId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("client_goals")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", goalId)
    .eq("client_id", clientId);

  if (error) {
    console.error("deleteGoal:", error);
    return { error };
  }
  return { error: null };
}
