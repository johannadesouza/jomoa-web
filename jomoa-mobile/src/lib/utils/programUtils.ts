/**
 * Ren beräkningsfunktion – ingen DB-access, inga cirkulära importer.
 * Beräknar programprogression baserat på loggade pass.
 */
import type { ProgramAssignment, ActiveAssignmentView, ProgramStatus } from "../domain/program";

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
