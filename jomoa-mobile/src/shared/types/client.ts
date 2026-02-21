/**
 * Client-specific types used across the app
 * Consolidated from dashboard domain types
 */

export interface TrainingProgram {
  id: string;
  name: string;
  description: string | null;
}

export interface ProgramSession {
  id: string;
  name: string;
  day_of_week: number;
  focus: string | null;
  exercises: SessionExercise[];
  workoutLog?: WorkoutLog | null;
}

export interface WorkoutLog {
  id: string;
  client_id: string;
  program_session_id: string;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number | null;
  reps_planned: number | null;
  rest_seconds: number | null;
  tempo: string | null;
  intensity_type: "none" | "rpe" | "percent";
  intensity_value: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
  };
  setLog?: {
    id: string;
    reps: number | null;
    weight: number | null;
  } | null;
}

export interface ProgramAssignment {
  id: string;
  program_id: string;
  start_date: string;
  program: TrainingProgram;
}

export interface OnboardingTask {
  id: string;
  key: string;
  title: string;
  description: string | null;
  order_index: number;
  status: "completed" | "pending";
  completed_at: string | null;
}

export interface CycleStatus {
  cycleDay: number;
  phase: string;
  phaseEnum: string | null;
  periodStartDate: string;
  confidence: number;
  isManual: boolean;
}

export interface ReadinessState {
  sleep_quality: string;
  energy_level: string;
  stress_level: string;
  soreness: string;
}

