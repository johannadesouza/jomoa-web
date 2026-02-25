/**
 * contentRepo/exercises – queries mot exercises-tabellen.
 */
import { contentClient } from "../../supabase/contentClient";
import type { Exercise } from "../../domain/program";

export async function fetchExerciseById(id: string): Promise<Exercise | null> {
  const { data, error } = await contentClient
    .from("exercises")
    .select("id, name, default_video_url, primary_muscle_group, equipment")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Exercise;
}

export async function fetchAllExercises(): Promise<Exercise[]> {
  const { data, error } = await contentClient
    .from("exercises")
    .select("id, name, default_video_url, primary_muscle_group, equipment")
    .order("name", { ascending: true });

  if (error) {
    console.error("contentRepo/exercises fetchAllExercises:", error);
    return [];
  }
  return (data ?? []) as Exercise[];
}
