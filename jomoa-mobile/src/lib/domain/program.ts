/**
 * Domain types for Program system
 * No UI, no I/O – pure business types
 */

export interface Program {
  id: string;
  name: string;
  description: string | null;
  target_goal?: string | null;
  target_duration_weeks: number | null;
  sessions_per_week?: number | null;
  difficulty_level?: string | null;
}

export interface ProgramBlock {
  id: string;
  program_id: string;
  name: string;
  order_index: number;
  weeks_count: number | null;
}

export interface ProgramWeek {
  id: string;
  program_id: string;
  block_id: string | null;
  week_number: number;
  name: string | null;
}

export interface ProgramSession {
  id: string;
  program_id: string;
  week_id: string;
  name: string;
  day_of_week: number;
  focus: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  default_video_url?: string | null;
  primary_muscle_group?: string | null;
  equipment?: string | null;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number;
  reps_planned: number | string;
  rest_seconds?: number | null;
  intensity_type?: string | null;
  intensity_value?: number | null;
  exercise: Exercise;
}

export interface ProgramWithStructure {
  program: Program;
  blocks: ProgramBlock[];
  weeks: ProgramWeek[];
  sessions: ProgramSession[];
  sessionExercises: SessionExercise[];
}

export type ProgramStatus = "not_started" | "active" | "completed";

export interface ProgramWithStatus extends Program {
  status: ProgramStatus;
  progressionPercent: number;
  assignmentId?: string;
  startDate?: string;
}

export interface ProgramAssignment {
  id: string;
  program_id: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  program: Program;
}

export interface ActiveAssignmentView {
  assignment: ProgramAssignment;
  currentWeekNumber: number;
  progressionPercent: number;
  status: ProgramStatus;
  totalSessions: number;
  completedSessions: number;
}
