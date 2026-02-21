import { supabase } from "../../config/supabase";
import type {
  Program,
  ProgramBlock,
  ProgramWeek,
  ProgramSession,
  SessionExercise,
  ProgramWithStructure,
  ProgramAssignment,
  ActiveAssignmentView,
  ProgramStatus,
  ProgramWithStatus,
} from "../domain/program";

export type { Program, ProgramAssignment };

export interface ProgramAssignmentData {
  id: string;
  program_id: string;
  start_date: string;
  program: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export async function fetchTemplatePrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks")
    .eq("is_template", true)
    .order("name");

  if (error) {
    console.error("Error fetching programs:", error);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    target_goal: r.target_goal ?? null,
    target_duration_weeks: r.target_duration_weeks ?? null,
  }));
}

export async function fetchActiveAssignment(clientId: string): Promise<ProgramAssignmentData | null> {
  const { data, error } = await supabase
    .from("client_program_assignments")
    .select(`
      id,
      program_id,
      start_date,
      program:training_programs (
        id,
        name,
        description
      )
    `)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  const prog = data.program;
  return {
    id: data.id,
    program_id: data.program_id,
    start_date: data.start_date,
    program: (Array.isArray(prog) ? prog[0] : prog) as ProgramAssignmentData["program"],
  };
}

export async function getFirstWeekId(programId: string): Promise<string | null> {
  const { data } = await supabase
    .from("program_weeks")
    .select("id")
    .eq("program_id", programId)
    .order("week_number", { ascending: true })
    .limit(1)
    .single();

  return data?.id ?? null;
}

export async function assignProgram(
  clientId: string,
  programId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("client_program_assignments")
    .update({ is_active: false })
    .eq("client_id", clientId);

  if (error) return { error };

  const today = new Date().toISOString().split("T")[0];
  const { error: insertError } = await supabase
    .from("client_program_assignments")
    .insert({
      client_id: clientId,
      program_id: programId,
      is_active: true,
      start_date: today,
    });

  return { error: insertError ?? null };
}

/** Fetch full program structure: program, blocks, weeks, sessions, session_exercises */
export async function fetchProgramWithStructure(
  programId: string
): Promise<ProgramWithStructure | null> {
  const { data: program, error: programErr } = await supabase
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks")
    .eq("id", programId)
    .single();

  if (programErr || !program) return null;

  const { data: blocks } = await supabase
    .from("program_blocks")
    .select("id, program_id, name, order_index, weeks_count")
    .eq("program_id", programId)
    .order("order_index", { ascending: true });

  const { data: weeks } = await supabase
    .from("program_weeks")
    .select("id, program_id, block_id, week_number, name")
    .eq("program_id", programId)
    .order("week_number", { ascending: true });

  const weekIds = (weeks || []).map((w) => w.id);
  if (weekIds.length === 0) {
    return {
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        target_goal: program.target_goal,
        target_duration_weeks: program.target_duration_weeks,
      },
      blocks: blocks || [],
      weeks: weeks || [],
      sessions: [],
      sessionExercises: [],
    };
  }

  const { data: sessions } = await supabase
    .from("program_sessions")
    .select("id, program_id, week_id, name, day_of_week, focus")
    .in("week_id", weekIds)
    .order("day_of_week", { ascending: true });

  const sessionIds = (sessions || []).map((s) => s.id);
  if (sessionIds.length === 0) {
    return {
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        target_goal: program.target_goal,
        target_duration_weeks: program.target_duration_weeks,
      },
      blocks: blocks || [],
      weeks: weeks || [],
      sessions: sessions || [],
      sessionExercises: [],
    };
  }

  const { data: sessionExercisesRaw } = await supabase
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

  const raw = (sessionExercisesRaw || []) as {
    id: string;
    session_id: string;
    exercise_id: string;
    order_index: number;
    sets_planned: number;
    reps_planned: number;
    rest_seconds?: number;
    intensity_type?: string;
    intensity_value?: number;
    exercise: { id: string; name: string; default_video_url?: string; primary_muscle_group?: string; equipment?: string } | { id: string; name: string; default_video_url?: string; primary_muscle_group?: string; equipment?: string }[];
  }[];
  const sessionExercises: SessionExercise[] = raw.map(
    (se) => {
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
    }
  );

  return {
    program: {
      id: program.id,
      name: program.name,
      description: program.description,
      target_goal: program.target_goal,
      target_duration_weeks: program.target_duration_weeks,
    },
    blocks: blocks || [],
    weeks: weeks || [],
    sessions: sessions || [],
    sessionExercises,
  };
}

/** Fetch all template programs + status for client (active assignment, progression) */
export async function fetchAllProgramsWithAssignment(
  clientId: string
): Promise<{ programs: ProgramWithStatus[]; activeAssignment: ProgramAssignment | null }> {
  const programs = await fetchTemplatePrograms();
  const activeAssignment = await fetchActiveAssignmentForView(clientId);

  const completedSessionIds = new Set<string>();
  let totalSessions = 0;
  const programSessionIds = new Set<string>();

  if (activeAssignment) {
    const structure = await fetchProgramWithStructure(activeAssignment.program_id);
    if (structure) {
      totalSessions = structure.sessions.length;
      structure.sessions.forEach((s) => programSessionIds.add(s.id));
    }
    const { data: logs } = await supabase
      .from("workout_sessions_log")
      .select("program_session_id")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .not("program_session_id", "is", null);
    (logs || []).forEach((l: { program_session_id: string }) => {
      if (l.program_session_id && programSessionIds.has(l.program_session_id)) {
        completedSessionIds.add(l.program_session_id);
      }
    });
  }

  const programsWithStatus = programs.map((p): ProgramWithStatus => {
    const isActive = activeAssignment?.program_id === p.id;
    let status: ProgramStatus = "not_started";
    let progressionPercent = 0;
    let assignmentId: string | undefined;
    let startDate: string | undefined;

    if (isActive && activeAssignment) {
      status = "active";
      assignmentId = activeAssignment.id;
      startDate = activeAssignment.start_date;
      const view = computeProgression(activeAssignment, completedSessionIds, totalSessions);
      progressionPercent = view.progressionPercent;
      if (view.status === "completed") status = "completed";
    }

    return {
      ...p,
      status,
      progressionPercent,
      assignmentId,
      startDate,
    };
  });

  return {
    programs: programsWithStatus,
    activeAssignment: activeAssignment
      ? {
          id: activeAssignment.id,
          program_id: activeAssignment.program_id,
          start_date: activeAssignment.start_date,
          end_date: activeAssignment.end_date ?? null,
          is_active: activeAssignment.is_active,
          program: activeAssignment.program,
        }
      : null,
  };
}

async function fetchActiveAssignmentForView(
  clientId: string
): Promise<(ProgramAssignment & { program: Program }) | null> {
  const { data, error } = await supabase
    .from("client_program_assignments")
    .select(`
      id,
      program_id,
      start_date,
      end_date,
      is_active,
      program:training_programs (id, name, description, target_goal, target_duration_weeks)
    `)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  const program = data.program;
  return {
    id: data.id,
    program_id: data.program_id,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: data.is_active,
    program: Array.isArray(program) ? program[0] : (program as Program),
  };
}

/** Compute progression from workout logs vs total sessions */
export function computeProgression(
  assignment: ProgramAssignment,
  completedSessionIds: Set<string>,
  totalSessions: number
): Omit<ActiveAssignmentView, "assignment"> {
  const total = totalSessions > 0 ? totalSessions : 1;
  const completed = completedSessionIds.size;
  const progressionPercent = Math.min(100, Math.round((completed / total) * 100));

  const start = new Date(assignment.start_date);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const durationWeeks = assignment.program.target_duration_weeks ?? 52;
  const currentWeekNumber = Math.min(Math.floor(daysSinceStart / 7) + 1, durationWeeks);

  let status: ProgramStatus = "active";
  if (progressionPercent >= 100 && durationWeeks > 0) {
    status = "completed";
  }

  return {
    currentWeekNumber: Math.max(1, currentWeekNumber),
    progressionPercent,
    status,
    totalSessions: total,
    completedSessions: completed,
  };
}

/** Archive current assignment (end_date, is_active=false) and assign new program */
export async function archiveAndSwitchProgram(
  clientId: string,
  newProgramId: string
): Promise<{ error: Error | null }> {
  const today = new Date().toISOString().split("T")[0];

  const { error: updateErr } = await supabase
    .from("client_program_assignments")
    .update({ is_active: false, end_date: today })
    .eq("client_id", clientId)
    .eq("is_active", true);

  if (updateErr) return { error: updateErr };

  const { error: insertErr } = await supabase.from("client_program_assignments").insert({
    client_id: clientId,
    program_id: newProgramId,
    is_active: true,
    start_date: today,
  });

  return { error: insertErr ?? null };
}
