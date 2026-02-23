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
  isStandalone?: boolean;
  startedAt: string;
  setLogs: SetLogEntry[];
  restTimerSecondsRemaining: number | null;
  lastSetCompletedAt: string | null;
  /** Övningsvis flöde: index av nuvarande övning (0-baserad) */
  currentExerciseIndex?: number;
  /** Övningsvis flöde: 'exercise' = övning, 'rest' = vila, 'finishing' = sparar och avslutar */
  phase?: "exercise" | "rest" | "finishing";
}

export interface RestTimerState {
  secondsRemaining: number;
  startedAt: string;
  autoStart: boolean;
}
