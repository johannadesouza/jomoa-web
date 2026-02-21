/**
 * Domain types for Workout system
 * No UI, no I/O – pure business types
 */

export interface SetLogEntry {
  sessionExerciseId: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
}

export interface InProgressWorkout {
  sessionId: string;
  startedAt: string;
  setLogs: SetLogEntry[];
  restTimerSecondsRemaining: number | null;
  lastSetCompletedAt: string | null;
}

export interface RestTimerState {
  secondsRemaining: number;
  startedAt: string;
  autoStart: boolean;
}
