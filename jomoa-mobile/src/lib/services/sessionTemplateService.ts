/**
 * sessionTemplateService – thin wrapper för bakåtkompatibilitet.
 *
 * Alla queries delegeras till contentRepo/sessionTemplates.
 *
 * FAS 3: importera direkt från repos och ta bort denna fil.
 */
import {
  fetchStandaloneSessions as _fetchStandaloneSessions,
  fetchSessionTemplateById as _fetchSessionTemplateById,
} from "../repos/contentRepo/sessionTemplates";

export interface SessionTemplateExercise {
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
  return _fetchStandaloneSessions(focus) as Promise<SessionTemplateData[]>;
}

export async function fetchSessionTemplateById(
  id: string
): Promise<SessionTemplateData | null> {
  return _fetchSessionTemplateById(id) as Promise<SessionTemplateData | null>;
}
