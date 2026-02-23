/**
 * Domain types for Workout system
 * No UI, no I/O – pure business types
 */

/** "Hur utmanande var övningen totalt?" – en gång per övning */
export type ExerciseChallengeLevel = "easy" | "ok" | "hard";

export interface SetLogEntry {
  sessionExerciseId: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
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
  /** Övningsvis flöde: 'exercise' | 'rest' | 'challenge' | 'finishing' */
  phase?: "exercise" | "rest" | "challenge" | "finishing";
  /** Utmaningssvar per övning – sparas vid completeWorkout */
  exerciseChallenges?: Record<string, ExerciseChallengeLevel>;
}

export interface RestTimerState {
  secondsRemaining: number;
  startedAt: string;
  autoStart: boolean;
}
