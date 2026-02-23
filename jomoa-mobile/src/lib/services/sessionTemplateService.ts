/**
 * Session Template Service – fristående pass (ej kopplade till program)
 * För "Utforska pass efter stil" – pass användare kan lägga till och köra själva
 */

import { supabase } from "../../config/supabase";

export interface SessionTemplateExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number;
  reps_planned: string;
  rest_seconds?: number | null;
  /** Tidsbestämd övning: antal sekunder (t.ex. 55). Om null: set/reps-baserad */
  duration_seconds?: number | null;
  exercise: {
    id: string;
    name: string;
    default_video_url?: string | null;
  };
}

export interface SessionTemplateData {
  id: string;
  name: string;
  focus: string;
  description: string | null;
  duration_minutes: number | null;
  session_exercises: SessionTemplateExercise[];
}

export async function fetchStandaloneSessions(
  focus?: string | null
): Promise<SessionTemplateData[]> {
  let query = supabase
    .from("session_templates")
    .select(`
      id,
      name,
      focus,
      description,
      duration_minutes,
      session_template_exercises (
        id,
        exercise_id,
        order_index,
        sets_planned,
        reps_planned,
        rest_seconds,
        exercise:exercises (id, name)
      )
    `)
    .order("name", { ascending: true });

  if (focus) {
    query = query.ilike("focus", `%${focus}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching session templates:", error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => {
    const exercises = (row.session_template_exercises ?? row.session_exercises ?? []) as SessionTemplateExercise[];
    return {
      id: row.id,
      name: row.name,
      focus: row.focus,
      description: row.description ?? null,
      duration_minutes: row.duration_minutes ?? null,
      session_exercises: exercises,
    } as SessionTemplateData;
  });
}

export async function fetchSessionTemplateById(
  id: string
): Promise<SessionTemplateData | null> {
  const { data, error } = await supabase
    .from("session_templates")
    .select(`
      id,
      name,
      focus,
      description,
      duration_minutes,
      session_template_exercises (
        id,
        exercise_id,
        order_index,
        sets_planned,
        reps_planned,
        rest_seconds,
        duration_seconds,
        exercise:exercises (id, name, default_video_url)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const raw = data as Record<string, unknown>;
  const exercises = (raw.session_template_exercises ?? raw.session_exercises ?? []) as SessionTemplateExercise[];

  return {
    id: data.id,
    name: data.name,
    focus: data.focus,
    description: data.description ?? null,
    duration_minutes: data.duration_minutes ?? null,
    session_exercises: exercises,
  } as SessionTemplateData;
}
