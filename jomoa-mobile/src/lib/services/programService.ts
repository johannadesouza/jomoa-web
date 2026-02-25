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
} from "../domain/program";

// computeProgression lever nu i programUtils för att undvika cirkulär import
export { computeProgression } from "../utils/programUtils";

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
