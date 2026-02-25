/**
 * contentRepo/programs – queries mot training_programs, program_blocks,
 * program_weeks, program_sessions, session_exercises (+ exercises join).
 *
 * FAS 1–2: dual-read via USE_SEPARATE_CONTENT_DB-flaggan.
 * FAS 3:   ta bort fallback och använd contentClient direkt.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { contentClient } from "../../supabase/contentClient";
import { userClient } from "../../supabase/userClient";
import { USE_SEPARATE_CONTENT_DB } from "../../supabase/featureFlags";
import type {
  Program,
  ProgramBlock,
  ProgramWeek,
  ProgramSession,
  SessionExercise,
  ProgramWithStructure,
} from "../../domain/program";

function getDb(): SupabaseClient {
  return USE_SEPARATE_CONTENT_DB ? contentClient : userClient;
}

export async function fetchTemplatePrograms(): Promise<Program[]> {
  const { data, error } = await getDb()
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks")
    .eq("is_template", true)
    .order("name");

  if (error) {
    console.error("contentRepo/programs fetchTemplatePrograms:", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    target_goal: r.target_goal ?? null,
    target_duration_weeks: r.target_duration_weeks ?? null,
  }));
}

export async function fetchProgramById(programId: string): Promise<Program | null> {
  const { data, error } = await getDb()
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks")
    .eq("id", programId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? null,
    target_goal: data.target_goal ?? null,
    target_duration_weeks: data.target_duration_weeks ?? null,
  };
}

export async function getFirstWeekId(programId: string): Promise<string | null> {
  const { data } = await getDb()
    .from("program_weeks")
    .select("id")
    .eq("program_id", programId)
    .order("week_number", { ascending: true })
    .limit(1)
    .single();

  return data?.id ?? null;
}

export async function getWeekIdForDate(
  programId: string,
  startDate: string,
  targetDate: string
): Promise<string | null> {
  const start = new Date(startDate).getTime();
  const target = new Date(targetDate).getTime();
  const daysSinceStart = Math.floor((target - start) / 86400000);

  if (daysSinceStart < 0) {
    return getFirstWeekId(programId);
  }

  const weekNumber = Math.floor(daysSinceStart / 7) + 1;

  const { data: weeks } = await getDb()
    .from("program_weeks")
    .select("id, week_number")
    .eq("program_id", programId)
    .order("week_number", { ascending: true });

  if (!weeks || weeks.length === 0) return null;

  const cappedIndex = Math.min(weekNumber - 1, weeks.length - 1);
  return weeks[cappedIndex]?.id ?? null;
}

export async function fetchProgramWithStructure(
  programId: string
): Promise<ProgramWithStructure | null> {
  const db = getDb();

  const { data: program, error: programErr } = await db
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks")
    .eq("id", programId)
    .single();

  if (programErr || !program) return null;

  const { data: blocks } = await db
    .from("program_blocks")
    .select("id, program_id, name, order_index, weeks_count")
    .eq("program_id", programId)
    .order("order_index", { ascending: true });

  const { data: weeks } = await db
    .from("program_weeks")
    .select("id, program_id, block_id, week_number, name")
    .eq("program_id", programId)
    .order("week_number", { ascending: true });

  const weekIds = (weeks ?? []).map((w) => w.id);
  if (weekIds.length === 0) {
    return {
      program: { id: program.id, name: program.name, description: program.description ?? null, target_goal: program.target_goal ?? null, target_duration_weeks: program.target_duration_weeks ?? null },
      blocks: (blocks ?? []) as ProgramBlock[],
      weeks: [],
      sessions: [],
      sessionExercises: [],
    };
  }

  const { data: sessions } = await db
    .from("program_sessions")
    .select("id, program_id, week_id, name, day_of_week, focus")
    .in("week_id", weekIds)
    .order("day_of_week", { ascending: true });

  const sessionIds = (sessions ?? []).map((s) => s.id);
  if (sessionIds.length === 0) {
    return {
      program: { id: program.id, name: program.name, description: program.description ?? null, target_goal: program.target_goal ?? null, target_duration_weeks: program.target_duration_weeks ?? null },
      blocks: (blocks ?? []) as ProgramBlock[],
      weeks: (weeks ?? []) as ProgramWeek[],
      sessions: [],
      sessionExercises: [],
    };
  }

  const { data: sessionExercisesRaw } = await db
    .from("session_exercises")
    .select(`
      id,
      session_id,
      exercise_id,
      order_index,
      sets_planned,
      reps_planned,
      rest_seconds,
      intensity_type,
      intensity_value,
      exercise:exercises (id, name, default_video_url, primary_muscle_group, equipment)
    `)
    .in("session_id", sessionIds)
    .order("order_index", { ascending: true });

  type RawSE = {
    id: string; session_id: string; exercise_id: string; order_index: number;
    sets_planned: number; reps_planned: number; rest_seconds?: number;
    intensity_type?: string; intensity_value?: number;
    exercise: { id: string; name: string; default_video_url?: string; primary_muscle_group?: string; equipment?: string }
              | { id: string; name: string; default_video_url?: string; primary_muscle_group?: string; equipment?: string }[];
  };

  const sessionExercises: SessionExercise[] = ((sessionExercisesRaw ?? []) as RawSE[]).map((se) => {
    const ex = Array.isArray(se.exercise) ? se.exercise[0] : se.exercise;
    return {
      id: se.id,
      session_id: se.session_id,
      exercise_id: se.exercise_id,
      order_index: se.order_index,
      sets_planned: se.sets_planned ?? 0,
      reps_planned: se.reps_planned ?? 0,
      rest_seconds: se.rest_seconds ?? null,
      intensity_type: se.intensity_type ?? null,
      intensity_value: se.intensity_value ?? null,
      exercise: {
        id: ex.id,
        name: ex.name,
        default_video_url: ex.default_video_url ?? null,
        primary_muscle_group: ex.primary_muscle_group ?? null,
        equipment: ex.equipment ?? null,
      },
    };
  });

  return {
    program: {
      id: program.id,
      name: program.name,
      description: program.description ?? null,
      target_goal: program.target_goal ?? null,
      target_duration_weeks: program.target_duration_weeks ?? null,
    },
    blocks: (blocks ?? []) as ProgramBlock[],
    weeks: (weeks ?? []) as ProgramWeek[],
    sessions: (sessions ?? []) as ProgramSession[],
    sessionExercises,
  };
}

export async function fetchSessionsByWeekId(
  weekId: string
): Promise<Array<{ id: string; name: string; day_of_week: number; focus: string | null; session_exercises: SessionExercise[] }>> {
  const { data } = await getDb()
    .from("program_sessions")
    .select(`
      id, name, day_of_week, focus,
      session_exercises (
        id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds,
        exercise:exercises (id, name)
      )
    `)
    .eq("week_id", weekId)
    .order("day_of_week", { ascending: true });

  return (data ?? []) as typeof data extends null ? [] : NonNullable<typeof data>;
}

export async function fetchSessionById(
  sessionId: string
): Promise<{ id: string; name: string; day_of_week?: number; focus: string | null; session_exercises: SessionExercise[] } | null> {
  const { data, error } = await getDb()
    .from("program_sessions")
    .select(`
      id, name, focus,
      session_exercises (
        id, exercise_id, order_index, sets_planned, reps_planned, rest_seconds, duration_seconds,
        exercise:exercises (id, name, default_video_url)
      )
    `)
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;
  return data as unknown as typeof data;
}

export async function fetchSessionsByIds(
  sessionIds: string[]
): Promise<Array<{ id: string; name: string; day_of_week: number; focus: string | null; session_exercises: SessionExercise[] }>> {
  if (sessionIds.length === 0) return [];
  const { data, error } = await getDb()
    .from("program_sessions")
    .select(`
      id, name, day_of_week, focus,
      session_exercises (
        id, exercise_id, order_index, sets_planned, reps_planned,
        exercise:exercises (id, name)
      )
    `)
    .in("id", sessionIds);

  if (error || !data) return [];
  return data as unknown as typeof data;
}
