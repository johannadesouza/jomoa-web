/**
 * contentRepo/trainingGoals – träningsmål från Content DB.
 * Används i onboarding (GoalsScreen), profil och programmatchning.
 */
import { contentClient } from "../../supabase/contentClient";

export type TrainingGoalEntry = {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  program_target_goal: string | null;
  order_index: number;
};

export async function fetchTrainingGoals(): Promise<TrainingGoalEntry[]> {
  const { data, error } = await contentClient
    .from("training_goals")
    .select("id, label, description, icon, program_target_goal, order_index")
    .order("order_index");
  if (error) throw error;
  return (data ?? []) as TrainingGoalEntry[];
}
