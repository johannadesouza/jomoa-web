/**
 * contentRepo/exercises – queries mot exercises-tabellen.
 *
 * FAS 1–2: dual-read via USE_SEPARATE_CONTENT_DB-flaggan.
 * FAS 3:   ta bort fallback och använd contentClient direkt.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { contentClient } from "../../supabase/contentClient";
import { userClient } from "../../supabase/userClient";
import { USE_SEPARATE_CONTENT_DB } from "../../supabase/featureFlags";
import type { Exercise } from "../../domain/program";

function getDb(): SupabaseClient {
  return USE_SEPARATE_CONTENT_DB ? contentClient : userClient;
}

export async function fetchExerciseById(id: string): Promise<Exercise | null> {
  const { data, error } = await getDb()
    .from("exercises")
    .select("id, name, default_video_url, primary_muscle_group, equipment")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Exercise;
}

export async function fetchAllExercises(): Promise<Exercise[]> {
  const { data, error } = await getDb()
    .from("exercises")
    .select("id, name, default_video_url, primary_muscle_group, equipment")
    .order("name", { ascending: true });

  if (error) {
    console.error("contentRepo/exercises fetchAllExercises:", error);
    return [];
  }
  return (data ?? []) as Exercise[];
}
