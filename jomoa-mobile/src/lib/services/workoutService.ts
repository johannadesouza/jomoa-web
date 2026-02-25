/**
 * workoutService – thin wrapper för bakåtkompatibilitet.
 *
 * Content-queries (program_sessions, session_exercises, exercises)
 * delegeras till contentRepo/programs.
 * User-queries (client_program_assignments) delegeras till userRepo/assignments.
 *
 * FAS 3: importera direkt från repos och ta bort denna fil.
 */
import { fetchActiveAssignment } from "../repos/userRepo/assignments";
import {
  fetchSessionsByWeekId as _fetchSessionsByWeekId,
  fetchSessionById as _fetchSessionById,
  fetchSessionsByIds as _fetchSessionsByIds,
  getWeekIdForDate,
} from "../repos/contentRepo/programs";
import { userClient } from "../supabase/userClient";

export interface SessionExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number;
  reps_planned: string;
  rest_seconds?: number | null;
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
  const assignmentData = await fetchActiveAssignment(clientId);
  if (!assignmentData) return { sessions: [], programName: null };

  const programName = assignmentData.program?.name ?? null;
  const today = new Date().toISOString().split("T")[0];
  const weekId = await getWeekIdForDate(
    assignmentData.program_id,
    assignmentData.start_date,
    today
  );

  if (!weekId) return { sessions: [], programName };

  const sessions = await _fetchSessionsByWeekId(weekId);
  return { sessions: sessions as unknown as ProgramSessionData[], programName };
}

export async function fetchSessionById(
  sessionId: string
): Promise<ProgramSessionData | null> {
  const result = await _fetchSessionById(sessionId);
  return result as unknown as ProgramSessionData | null;
}

export async function fetchSessionsByWeekId(
  weekId: string
): Promise<ProgramSessionData[]> {
  const result = await _fetchSessionsByWeekId(weekId);
  return result as unknown as ProgramSessionData[];
}

export async function fetchSessionsByIds(
  sessionIds: string[]
): Promise<ProgramSessionData[]> {
  const result = await _fetchSessionsByIds(sessionIds);
  return result as unknown as ProgramSessionData[];
}
