/**
 * Progression Service
 * Weekly completion tracking for adaptive volume progression
 */

import { supabase } from "../../config/supabase";
import { fetchActiveAssignment } from "./programService";
import { fetchProgramWithStructure } from "./programService";
import { getWeekIdForDate } from "./programService";

export interface WeeklyCompletion {
  lastWeekPlanned: number;
  lastWeekCompleted: number;
  completionRate: number;
}

/**
 * Fetch last week's planned vs completed sessions for adaptive progression.
 * "Last week" = 8–14 days ago (full 7 days in the past).
 */
export async function fetchWeeklyCompletion(
  clientId: string
): Promise<WeeklyCompletion | null> {
  const assignment = await fetchActiveAssignment(clientId);
  if (!assignment) return null;

  const today = new Date();
  const lastWeekEnd = new Date(today);
  lastWeekEnd.setDate(today.getDate() - 8);
  const lastWeekStart = new Date(lastWeekEnd);
  lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

  const startStr = lastWeekStart.toISOString().split("T")[0];
  const endStr = lastWeekEnd.toISOString().split("T")[0];

  const structure = await fetchProgramWithStructure(assignment.program_id);
  if (!structure || structure.sessions.length === 0) return null;

  const weekId = await getWeekIdForDate(
    assignment.program_id,
    assignment.start_date,
    lastWeekStart.toISOString().split("T")[0]
  );
  if (!weekId) return null;

  const plannedSessions = structure.sessions.filter((s) => s.week_id === weekId);
  const plannedIds = new Set(plannedSessions.map((s) => s.id));
  const lastWeekPlanned = plannedIds.size;
  if (lastWeekPlanned === 0) return null;

  const { data: logs } = await supabase
    .from("workout_sessions_log")
    .select("program_session_id")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("date", startStr)
    .lte("date", endStr)
    .not("program_session_id", "is", null);

  let completed = 0;
  for (const row of logs || []) {
    const id = (row as { program_session_id: string }).program_session_id;
    if (id && plannedIds.has(id)) completed++;
  }

  const completionRate =
    lastWeekPlanned > 0 ? completed / lastWeekPlanned : 0;

  return {
    lastWeekPlanned,
    lastWeekCompleted: completed,
    completionRate,
  };
}
