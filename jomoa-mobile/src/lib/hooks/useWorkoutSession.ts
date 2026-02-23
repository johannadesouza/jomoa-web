import { useEffect, useState, useCallback, useRef } from "react";
import { fetchSessionById } from "../services/workoutService";
import { fetchSessionTemplateById } from "../services/sessionTemplateService";
import { createWorkoutLogWithSets } from "../services/workoutLogService";
import {
  getInProgressWorkout,
  setInProgressWorkout,
  clearInProgressWorkout,
  getRestTimerState,
  setRestTimerState,
} from "../store/workoutStore";
import type { SetLogEntry } from "../domain/workout";
import type { ProgramSessionData, SessionExercise } from "../services/workoutService";
import type { SessionTemplateData, SessionTemplateExercise } from "../services/sessionTemplateService";

const PERSIST_RETRY_DELAY_MS = 500;
const PERSIST_ERROR_DISMISS_MS = 5000;

export type SessionExerciseWithExtras = (SessionExercise | SessionTemplateExercise) & {
  rest_seconds?: number | null;
  duration_seconds?: number | null;
  exercise?: { id: string; name: string; default_video_url?: string | null };
};

export function isTimeBasedExercise(ex: SessionExerciseWithExtras): boolean {
  const sec = ex.duration_seconds;
  return typeof sec === "number" && sec > 0;
}

export interface UseWorkoutSessionResult {
  session: (ProgramSessionData | SessionTemplateData) | null;
  setLogs: SetLogEntry[];
  isLoading: boolean;
  isSaving: boolean;
  persistError: string | null;
  addSetLog: (entry: Omit<SetLogEntry, "sessionExerciseId"> & { sessionExerciseId?: string }) => void;
  updateSetLog: (
    exerciseId: string,
    setNumber: number,
    update: Partial<Pick<SetLogEntry, "reps" | "weight" | "rpe">>
  ) => void;
  completeWorkout: (overallRpe?: number) => Promise<{ error: Error | null }>;
  abortWorkout: () => Promise<void>;
  finishLastExerciseAndComplete: () => void;
  restTimer: {
    secondsRemaining: number;
    isRunning: boolean;
    start: (seconds: number, autoStart?: boolean, onRestComplete?: () => void) => void;
    pause: () => void;
  };
  sortedExercises: SessionExerciseWithExtras[];
  currentExerciseIndex: number;
  phase: "exercise" | "rest" | "finishing";
  currentExercise: SessionExerciseWithExtras | null;
  nextExercise: SessionExerciseWithExtras | null;
  isLastExercise: boolean;
  goToNextExercise: () => void;
  goToPrevExercise: () => void;
  skipRest: () => void;
  handleRestComplete: () => void;
  exerciseTimer: {
    secondsRemaining: number;
    isRunning: boolean;
    start: (seconds: number, isLast?: boolean) => void;
    pause: () => void;
    reset: (seconds: number) => void;
  };
}

export function useWorkoutSession(
  sessionId: string | undefined,
  clientId: string | undefined,
  isStandalone?: boolean
): UseWorkoutSessionResult {
  const [session, setSession] = useState<(ProgramSessionData | SessionTemplateData) | null>(null);
  const [setLogs, setSetLogs] = useState<SetLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [workoutStartedAt, setWorkoutStartedAt] = useState<string | null>(null);
  const [restTimerInterval, setRestTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<"exercise" | "rest" | "finishing">("exercise");
  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [exerciseTimerInterval, setExerciseTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);
  const persistChainRef = useRef<Promise<void>>(Promise.resolve());
  const latestLogsRef = useRef<SetLogEntry[]>([]);
  const latestFlowRef = useRef<{ currentExerciseIndex: number; phase: "exercise" | "rest" | "finishing" }>({
    currentExerciseIndex: 0,
    phase: "exercise",
  });

  useEffect(() => {
    if (!sessionId || !clientId) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!sessionId) return;
      setIsLoading(true);
      const [sessionData, inProgress] = await Promise.all([
        isStandalone ? fetchSessionTemplateById(sessionId) : fetchSessionById(sessionId),
        getInProgressWorkout(),
      ]);

      if (cancelled) return;

      if (sessionData) {
        setSession(sessionData);
        if (inProgress && inProgress.sessionId === sessionId && inProgress.isStandalone === isStandalone) {
          setSetLogs(inProgress.setLogs);
          setWorkoutStartedAt(inProgress.startedAt);
          if (inProgress.restTimerSecondsRemaining != null && inProgress.restTimerSecondsRemaining > 0) {
            setRestSeconds(inProgress.restTimerSecondsRemaining);
          }
          setCurrentExerciseIndex(inProgress.currentExerciseIndex ?? 0);
          setPhase(inProgress.phase ?? "exercise");
        } else {
          setSetLogs([]);
          setWorkoutStartedAt(new Date().toISOString());
          setCurrentExerciseIndex(0);
          setPhase("exercise");
        }
      } else {
        setSession(null);
      }

      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId, clientId, isStandalone]);

  useEffect(() => {
    let cancelled = false;
    getRestTimerState()
      .then((s) => {
        if (!cancelled && s && s.secondsRemaining > 0) setRestSeconds(s.secondsRemaining);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      if (restTimerInterval) clearInterval(restTimerInterval);
      if (exerciseTimerInterval) clearInterval(exerciseTimerInterval);
    };
  }, [restTimerInterval, exerciseTimerInterval]);

  const sortedExercises: SessionExerciseWithExtras[] = session
    ? [...(session.session_exercises ?? [])].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      )
    : [];
  const currentExercise = sortedExercises[currentExerciseIndex] ?? null;
  const nextExercise = sortedExercises[currentExerciseIndex + 1] ?? null;
  const isLastExercise = currentExerciseIndex >= sortedExercises.length - 1;

  latestFlowRef.current = { currentExerciseIndex, phase };
  latestLogsRef.current = setLogs;

  const doPersist = useCallback(
    async (logs: SetLogEntry[]) => {
      if (!sessionId || !clientId) return;
      const flow = latestFlowRef.current;
      const payload = {
        sessionId,
        isStandalone,
        startedAt: workoutStartedAt ?? new Date().toISOString(),
        setLogs: logs,
        restTimerSecondsRemaining: restSeconds > 0 ? restSeconds : null,
        lastSetCompletedAt: null,
        currentExerciseIndex: flow.currentExerciseIndex,
        phase: flow.phase,
      };
      try {
        await setInProgressWorkout(payload);
        setPersistError(null);
      } catch (err) {
        await new Promise((r) => setTimeout(r, PERSIST_RETRY_DELAY_MS));
        try {
          await setInProgressWorkout(payload);
          setPersistError(null);
        } catch {
          setPersistError("Kunde inte spara – försök igen");
          setTimeout(() => setPersistError(null), PERSIST_ERROR_DISMISS_MS);
        }
      }
    },
    [sessionId, clientId, isStandalone, restSeconds, workoutStartedAt]
  );

  const schedulePersist = useCallback(
    (logs: SetLogEntry[]) => {
      latestLogsRef.current = logs;
      const run = async () => {
        await doPersist(latestLogsRef.current);
      };
      persistChainRef.current = persistChainRef.current.then(run, run);
    },
    [doPersist]
  );

  const addSetLog = useCallback(
    (entry: Omit<SetLogEntry, "sessionExerciseId"> & { sessionExerciseId?: string }) => {
      if (!session) return;
      const se = session.session_exercises?.find((e) => e.exercise_id === entry.exerciseId) ??
        session.session_exercises?.find((e) => e.id === entry.sessionExerciseId);
      const sessionExerciseId = entry.sessionExerciseId ?? se?.id ?? entry.exerciseId;

      const newEntry: SetLogEntry = {
        sessionExerciseId,
        exerciseId: entry.exerciseId,
        setNumber: entry.setNumber,
        reps: entry.reps ?? null,
        weight: entry.weight ?? null,
        rpe: entry.rpe ?? null,
      };

      setSetLogs((prev) => {
        const filtered = prev.filter(
          (l) => !(l.exerciseId === entry.exerciseId && l.setNumber === entry.setNumber)
        );
        const next = [...filtered, newEntry];
        schedulePersist(next);
        return next;
      });
    },
    [session, schedulePersist]
  );

  const updateSetLog = useCallback(
    (
      exerciseId: string,
      setNumber: number,
      update: Partial<Pick<SetLogEntry, "reps" | "weight" | "rpe">>
    ) => {
      setSetLogs((prev) => {
        const next = prev.map((l) =>
          l.exerciseId === exerciseId && l.setNumber === setNumber ? { ...l, ...update } : l
        );
        latestLogsRef.current = next;
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const completeWorkout = useCallback(
    async (overallRpe?: number): Promise<{ error: Error | null }> => {
      if (!clientId || !session) return { error: new Error("Missing client or session") };

      setIsSaving(true);

      const logsByExercise = new Map<string, SetLogEntry[]>();
      for (const log of setLogs) {
        const list = logsByExercise.get(log.exerciseId) ?? [];
        list.push(log);
        logsByExercise.set(log.exerciseId, list);
      }

      const flatLogs = Array.from(logsByExercise.values()).flat();
      const sortedLogs = flatLogs.sort((a, b) => {
        if (a.exerciseId !== b.exerciseId) return 0;
        return a.setNumber - b.setNumber;
      });

      const setLogInputs = sortedLogs.map((l) => ({
        exerciseId: l.exerciseId,
        setNumber: l.setNumber,
        reps: l.reps,
        weight: l.weight,
        rpe: l.rpe,
      }));

      const { error } = await createWorkoutLogWithSets(
        clientId,
        session.id,
        setLogInputs,
        overallRpe,
        { isStandalone }
      );

      setIsSaving(false);

      if (!error) {
        try {
          await clearInProgressWorkout();
        } catch {
          try {
            await clearInProgressWorkout();
          } catch {}
        }
      }

      return { error };
    },
    [clientId, session, setLogs, isStandalone]
  );

  const onRestCompleteRef = useRef<(() => void) | null>(null);

  const startRestTimer = useCallback(
    (seconds: number, autoStart = false, onRestComplete?: () => void) => {
      onRestCompleteRef.current = onRestComplete ?? null;
      setRestSeconds(seconds);
      setRestTimerState({ secondsRemaining: seconds, startedAt: new Date().toISOString(), autoStart }).catch(() => {});

      if (restTimerInterval) clearInterval(restTimerInterval);
      const id = setInterval(() => {
        setRestSeconds((prev) => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            clearInterval(id);
            setRestTimerInterval(null);
            setRestTimerState(null).catch(() => {});
            const cb = onRestCompleteRef.current;
            onRestCompleteRef.current = null;
            cb?.();
          } else {
            setRestTimerState({
              secondsRemaining: next,
              startedAt: new Date().toISOString(),
              autoStart,
            }).catch(() => {});
          }
          return next;
        });
      }, 1000);
      setRestTimerInterval(id);
    },
    [restTimerInterval]
  );

  const pauseRestTimer = useCallback(() => {
    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      setRestTimerInterval(null);
    }
    setRestTimerState(null).catch(() => {});
  }, [restTimerInterval]);

  const persistFlow = useCallback(() => {
    schedulePersist(latestLogsRef.current);
  }, [schedulePersist]);

  const goToNextExercise = useCallback(() => {
    setPhase("rest");
    latestFlowRef.current.phase = "rest";
    persistFlow();
  }, [persistFlow]);

  const goToPrevExercise = useCallback(() => {
    const newIndex = Math.max(0, currentExerciseIndex - 1);
    setPhase("exercise");
    setCurrentExerciseIndex(newIndex);
    latestFlowRef.current.phase = "exercise";
    latestFlowRef.current.currentExerciseIndex = newIndex;
    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      setRestTimerInterval(null);
    }
    setRestSeconds(0);
    setRestTimerState(null).catch(() => {});
    persistFlow();
  }, [currentExerciseIndex, restTimerInterval, persistFlow]);

  const skipRest = useCallback(() => {
    const newIndex = currentExerciseIndex + 1;
    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      setRestTimerInterval(null);
    }
    setRestSeconds(0);
    setRestTimerState(null).catch(() => {});
    setPhase("exercise");
    setCurrentExerciseIndex(newIndex);
    latestFlowRef.current.phase = "exercise";
    latestFlowRef.current.currentExerciseIndex = newIndex;
    persistFlow();
  }, [currentExerciseIndex, restTimerInterval, persistFlow]);

  const abortWorkout = useCallback(async () => {
    try {
      await clearInProgressWorkout();
    } catch {}
  }, []);

  const finishLastExerciseAndComplete = useCallback(() => {
    setPhase("finishing");
    latestFlowRef.current.phase = "finishing";
  }, []);

  const handleRestComplete = useCallback(() => {
    const newIndex = currentExerciseIndex + 1;
    setPhase("exercise");
    setCurrentExerciseIndex(newIndex);
    latestFlowRef.current.phase = "exercise";
    latestFlowRef.current.currentExerciseIndex = newIndex;
    schedulePersist(latestLogsRef.current);
  }, [currentExerciseIndex, schedulePersist]);

  const startExerciseTimer = useCallback(
    (seconds: number, isLast = false) => {
      setExerciseSeconds(seconds);
      if (exerciseTimerInterval) clearInterval(exerciseTimerInterval);
      const id = setInterval(() => {
        setExerciseSeconds((prev) => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            clearInterval(id);
            setExerciseTimerInterval(null);
            if (isLast) {
              setPhase("finishing");
              latestFlowRef.current.phase = "finishing";
            } else {
              setPhase("rest");
              latestFlowRef.current.phase = "rest";
            }
            schedulePersist(latestLogsRef.current);
          }
          return next;
        });
      }, 1000);
      setExerciseTimerInterval(id);
    },
    [exerciseTimerInterval, schedulePersist]
  );

  const pauseExerciseTimer = useCallback(() => {
    if (exerciseTimerInterval) {
      clearInterval(exerciseTimerInterval);
      setExerciseTimerInterval(null);
    }
  }, [exerciseTimerInterval]);

  const resetExerciseTimer = useCallback((seconds: number) => {
    setExerciseSeconds(seconds);
  }, []);

  return {
    session,
    setLogs,
    isLoading,
    isSaving,
    persistError,
    addSetLog,
    updateSetLog,
    completeWorkout,
    abortWorkout,
    finishLastExerciseAndComplete,
    restTimer: {
      secondsRemaining: restSeconds,
      isRunning: restTimerInterval != null,
      start: startRestTimer,
      pause: pauseRestTimer,
    },
    sortedExercises,
    currentExerciseIndex,
    phase,
    currentExercise,
    nextExercise,
    isLastExercise,
    goToNextExercise,
    goToPrevExercise,
    skipRest,
    handleRestComplete,
    exerciseTimer: {
      secondsRemaining: exerciseSeconds,
      isRunning: exerciseTimerInterval != null,
      start: startExerciseTimer,
      pause: pauseExerciseTimer,
      reset: resetExerciseTimer,
    },
  };
}
