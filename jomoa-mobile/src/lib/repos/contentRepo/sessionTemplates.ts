/**
 * contentRepo/sessionTemplates – queries mot session_templates
 * och session_template_exercises (fristående pass).
 *
 * FAS 1–2: dual-read via USE_SEPARATE_CONTENT_DB-flaggan.
 * FAS 3:   ta bort fallback och använd contentClient direkt.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { contentClient } from "../../supabase/contentClient";
import { userClient } from "../../supabase/userClient";
import { USE_SEPARATE_CONTENT_DB } from "../../supabase/featureFlags";
import type { SessionTemplateData, SessionTemplateExercise } from "../../services/sessionTemplateService";

function getDb(): SupabaseClient {
  return USE_SEPARATE_CONTENT_DB ? contentClient : userClient;
}

export async function fetchStandaloneSessions(
  focus?: string | null
): Promise<SessionTemplateData[]> {
  let query = getDb()
    .from("session_templates")
    .select(`
      id, name, focus, description, duration_minutes,
      session_template_exercises (
        id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds,
        exercise:exercises (id, name)
      )
    `)
    .order("name", { ascending: true });

  if (focus) {
    query = query.ilike("focus", `%${focus}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("contentRepo/sessionTemplates fetchStandaloneSessions:", error);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const exercises = (row.session_template_exercises ?? row.session_exercises ?? []) as SessionTemplateExercise[];
    return {
      id: row.id as string,
      name: row.name as string,
      focus: row.focus as string,
      description: (row.description as string | null) ?? null,
      duration_minutes: (row.duration_minutes as number | null) ?? null,
      session_exercises: exercises,
    };
  });
}

export async function fetchSessionTemplateById(
  id: string
): Promise<SessionTemplateData | null> {
  const { data, error } = await getDb()
    .from("session_templates")
    .select(`
      id, name, focus, description, duration_minutes,
      session_template_exercises (
        id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, duration_seconds,
        exercise:exercises (id, name, default_video_url)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const raw = data as Record<string, unknown>;
  const exercises = (raw.session_template_exercises ?? raw.session_exercises ?? []) as SessionTemplateExercise[];

  return {
    id: data.id as string,
    name: data.name as string,
    focus: data.focus as string,
    description: (data.description as string | null) ?? null,
    duration_minutes: (data.duration_minutes as number | null) ?? null,
    session_exercises: exercises,
  };
}
