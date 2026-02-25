/**
 * userRepo/assignments – queries mot client_program_assignments (User DB).
 *
 * Cross-DB join-lösning: assignment hämtas från User DB, program-data
 * hämtas separat från contentRepo för att undvika Supabase cross-DB joins.
 */
import { userClient } from "../../supabase/userClient";
import { fetchProgramById, fetchTemplatePrograms } from "../contentRepo/programs";
import type {
  Program,
  ProgramAssignment,
  ProgramWithStatus,
  ProgramStatus,
} from "../../domain/program";
import { computeProgression } from "../../utils/programUtils";

export interface AssignmentData {
  id: string;
  program_id: string;
  start_date: string;
  program: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export async function fetchActiveAssignment(
  clientId: string
): Promise<AssignmentData | null> {
  const { data, error } = await userClient
    .from("client_program_assignments")
    .select("id, program_id, start_date")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  // Program-data hämtas från Content DB (eller User DB med feature flag off)
  const program = await fetchProgramById(data.program_id);
  if (!program) return null;

  return {
    id: data.id,
    program_id: data.program_id,
    start_date: data.start_date,
    program: {
      id: program.id,
      name: program.name,
      description: program.description,
    },
  };
}

export async function fetchActiveAssignmentForView(
  clientId: string
): Promise<(ProgramAssignment & { program: Program }) | null> {
  const { data, error } = await userClient
    .from("client_program_assignments")
    .select("id, program_id, start_date, end_date, is_active")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  const program = await fetchProgramById(data.program_id);
  if (!program) return null;

  return {
    id: data.id,
    program_id: data.program_id,
    start_date: data.start_date,
    end_date: data.end_date ?? null,
    is_active: data.is_active,
    program,
  };
}

export async function assignProgram(
  clientId: string,
  programId: string
): Promise<{ error: Error | null }> {
  const { error } = await userClient
    .from("client_program_assignments")
    .update({ is_active: false })
    .eq("client_id", clientId);

  if (error) return { error };

  const today = new Date().toISOString().split("T")[0];
  const { error: insertError } = await userClient
    .from("client_program_assignments")
    .insert({
      client_id: clientId,
      program_id: programId,
      is_active: true,
      start_date: today,
    });

  return { error: insertError ?? null };
}

export async function archiveAndSwitchProgram(
  clientId: string,
  newProgramId: string
): Promise<{ error: Error | null }> {
  const today = new Date().toISOString().split("T")[0];

  const { error: updateErr } = await userClient
    .from("client_program_assignments")
    .update({ is_active: false, end_date: today })
    .eq("client_id", clientId)
    .eq("is_active", true);

  if (updateErr) return { error: updateErr };

  const { error: insertErr } = await userClient
    .from("client_program_assignments")
    .insert({
      client_id: clientId,
      program_id: newProgramId,
      is_active: true,
      start_date: today,
    });

  return { error: insertErr ?? null };
}

export async function fetchAllProgramsWithAssignment(
  clientId: string
): Promise<{ programs: ProgramWithStatus[]; activeAssignment: ProgramAssignment | null }> {
  const programs = await fetchTemplatePrograms();
  const activeAssignment = await fetchActiveAssignmentForView(clientId);

  const completedSessionIds = new Set<string>();
  let totalSessions = 0;
  const programSessionIds = new Set<string>();

  if (activeAssignment) {
    const { fetchProgramWithStructure } = await import("../contentRepo/programs");
    const structure = await fetchProgramWithStructure(activeAssignment.program_id);
    if (structure) {
      totalSessions = structure.sessions.length;
      structure.sessions.forEach((s) => programSessionIds.add(s.id));
    }
    const { data: logs } = await userClient
      .from("workout_sessions_log")
      .select("program_session_id")
      .eq("client_id", clientId)
      .eq("status", "completed")
      .not("program_session_id", "is", null);
    (logs ?? []).forEach((l: { program_session_id: string }) => {
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

    return { ...p, status, progressionPercent, assignmentId, startDate };
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
