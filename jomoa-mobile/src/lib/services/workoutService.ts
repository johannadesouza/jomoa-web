import { supabase } from "../../config/supabase";
import { getWeekIdForDate } from "./programService";

export interface SessionExercise {
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

export interface ProgramSessionData {
  id: string;
  name: string;
  day_of_week: number;
  focus: string | null;
  session_exercises: SessionExercise[];
}

export async function fetchSessionsForWorkouts(
  clientId: string
): Promise<{ sessions: ProgramSessionData[]; programName: string | null }> {
  const { data: assignmentData } = await supabase
    .from("client_program_assignments")
    .select(`
      id,
      program_id,
      start_date,
      program:training_programs (id, name)
    `)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .single();

  if (!assignmentData) {
    return { sessions: [], programName: null };
  }

  const program = assignmentData.program;
  const programName = (Array.isArray(program) ? program[0] : program)?.name ?? null;
  const today = new Date().toISOString().split("T")[0];
  const weekId = await getWeekIdForDate(
    assignmentData.program_id,
    assignmentData.start_date,
    today
  );

  if (!weekId) {
    return { sessions: [], programName };
  }

  const { data: sessionsData } = await supabase
    .from("program_sessions")
    .select(`
      id,
      name,
      day_of_week,
      focus,
      session_exercises (
        id,
        exercise_id,
        order_index,
        sets_planned,
        reps_planned,
        exercise:exercises (id, name)
      )
    `)
    .eq("week_id", weekId)
    .order("day_of_week", { ascending: true });

  const sessions = (sessionsData || []) as unknown as ProgramSessionData[];
  return { sessions, programName };
}

export async function fetchSessionById(
  sessionId: string
): Promise<ProgramSessionData | null> {
  const { data, error } = await supabase
    .from("program_sessions")
    .select(`
      id,
      name,
      focus,
      session_exercises (
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
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;

  return data as unknown as ProgramSessionData;
}

export async function fetchSessionsByWeekId(weekId: string): Promise<ProgramSessionData[]> {
  const { data } = await supabase
    .from("program_sessions")
    .select(`
      id,
      name,
      day_of_week,
      focus,
      session_exercises (
        id,
        exercise_id,
        order_index,
        sets_planned,
        reps_planned,
        rest_seconds,
        exercise:exercises (id, name)
      )
    `)
    .eq("week_id", weekId)
    .order("day_of_week", { ascending: true });

  return (data || []) as unknown as ProgramSessionData[];
}

export async function fetchSessionsByIds(
  sessionIds: string[]
): Promise<ProgramSessionData[]> {
  if (sessionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("program_sessions")
    .select(`
      id,
      name,
      day_of_week,
      focus,
      session_exercises (
        id,
        exercise_id,
        order_index,
        sets_planned,
        reps_planned,
        exercise:exercises (id, name)
      )
    `)
    .in("id", sessionIds);

  if (error || !data) return [];
  return (data || []) as unknown as ProgramSessionData[];
}
