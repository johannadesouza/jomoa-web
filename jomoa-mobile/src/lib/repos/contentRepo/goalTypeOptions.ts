/**
 * contentRepo/goalTypeOptions – resans mål-alternativ från Content DB.
 * AddGoalModal använder med fallback till lib/data/goalOptions.ts
 */
import { contentClient } from "../../supabase/contentClient";
import type { GoalType } from "../../services/goalsService";

export type GoalTypeOptionEntry = {
  goal_type: string;
  option_id: string;
  label: string;
  icon_name: string | null;
  order_index: number;
};

export async function fetchGoalTypeOptions(): Promise<GoalTypeOptionEntry[]> {
  const { data, error } = await contentClient
    .from("goal_type_options")
    .select("goal_type, option_id, label, icon_name, order_index")
    .order("goal_type")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as GoalTypeOptionEntry[];
}

/** Grupperad per goal_type för enkel användning i AddGoalModal */
export async function fetchGoalTypeOptionsByType(): Promise<Record<GoalType, GoalTypeOptionEntry[]>> {
  const rows = await fetchGoalTypeOptions();
  const result: Record<string, GoalTypeOptionEntry[]> = {
    fitness: [],
    nutrition: [],
    wellness: [],
    event: [],
  };
  for (const row of rows) {
    if (result[row.goal_type]) result[row.goal_type].push(row);
  }
  return result as Record<GoalType, GoalTypeOptionEntry[]>;
}
