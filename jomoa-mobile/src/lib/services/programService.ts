/**
 * programService – thin wrapper för bakåtkompatibilitet.
 *
 * Alla content-queries delegeras till contentRepo/programs.
 * Alla user-queries (assignments, logs) delegeras till userRepo/assignments.
 *
 * FAS 3: importera direkt från repos och ta bort denna fil.
 */
import {
  fetchTemplatePrograms,
  fetchProgramById,
  fetchProgramWithStructure,
  getFirstWeekId,
  getWeekIdForDate,
  fetchSessionsByWeekId,
  fetchSessionById,
  fetchSessionsByIds,
} from "../repos/contentRepo/programs";

import {
  fetchActiveAssignment,
  fetchActiveAssignmentForView,
  assignProgram,
  archiveAndSwitchProgram,
  fetchAllProgramsWithAssignment,
} from "../repos/userRepo/assignments";

import type {
  Program,
  ProgramAssignment,
  ActiveAssignmentView,
  ProgramStatus,
  ProgramWithStatus,
} from "../domain/program";

export type {
  Program,
  ProgramAssignment,
};

// Re-exportera allt för bakåtkompatibilitet
export {
  fetchTemplatePrograms,
  fetchProgramById,
  fetchProgramWithStructure,
  getFirstWeekId,
  getWeekIdForDate,
  fetchSessionsByWeekId,
  fetchSessionById,
  fetchSessionsByIds,
  fetchActiveAssignment,
  fetchActiveAssignmentForView,
  assignProgram,
  archiveAndSwitchProgram,
  fetchAllProgramsWithAssignment,
};

// Alias för bakåtkompatibilitet (gamla signaturen)
export type ProgramAssignmentData = {
  id: string;
  program_id: string;
  start_date: string;
  program: { id: string; name: string; description?: string | null };
};

/**
 * Beräknar programprogression baserat på loggade pass.
 * Ren beräkningsfunktion – ingen DB-access.
 */
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
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
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
