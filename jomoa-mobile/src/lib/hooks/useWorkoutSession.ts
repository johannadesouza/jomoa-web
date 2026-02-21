import { useEffect, useState, useCallback } from "react";
import { fetchSessionById } from "../services/workoutService";
import { createWorkoutLogWithSets } from "../services/workoutLogService";
import {
  getInProgressWorkout,
  setInProgressWorkout,
  clearInProgressWorkout,
  getRestTimerState,
  setRestTimerState,
} from "../store/workoutStore";
import type { SetLogEntry } from "../domain/workout";
import type { ProgramSessionData } from "../services/workoutService";

export interface UseWorkoutSessionResult {
  session: ProgramSessionData | null;
  setLogs: SetLogEntry[];
  isLoading: boolean;
  isSaving: boolean;
  addSetLog: (entry: Omit<SetLogEntry, "sessionExerciseId"> & { sessionExerciseId?: string }) => void;
  updateSetLog: (
    exerciseId: string,
    setNumber: number,
    update: Partial<Pick<SetLogEntry, "reps" | "weight" | "rpe">>
  ) => void;
  completeWorkout: (overallRpe?: number) => Promise<{ error: Error | null }>;
  restTimer: {
    secondsRemaining: number;
    isRunning: boolean;
    start: (seconds: number, autoStart?: boolean) => void;
    pause: () => void;
  };
}

export function useWorkoutSession(
  sessionId: string | undefined,
  clientId: string | undefined
): UseWorkoutSessionResult {
  const [session, setSession] = useState<ProgramSessionData | null>(null);
  const [setLogs, setSetLogs] = useState<SetLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [workoutStartedAt, setWorkoutStartedAt] = useState<string | null>(null);
  const [restTimerInterval, setRestTimerInterval] = useState<ReturnType<typeof setInterval> | null>(
    null
  );

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
        fetchSessionById(sessionId),
        getInProgressWorkout(),
      ]);

      if (cancelled) return;

      if (sessionData) {
        setSession(sessionData);
        if (inProgress && inProgress.sessionId === sessionId) {
          setSetLogs(inProgress.setLogs);
          setWorkoutStartedAt(inProgress.startedAt);
          if (inProgress.restTimerSecondsRemaining != null && inProgress.restTimerSecondsRemaining > 0) {
            setRestSeconds(inProgress.restTimerSecondsRemaining);
          }
        } else {
          setSetLogs([]);
          setWorkoutStartedAt(new Date().toISOString());
        }
      } else {
        setSession(null);
      }

      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clientId]);

  useEffect(() => {
    const state = getRestTimerState().then((s) => {
      if (s && s.secondsRemaining > 0) setRestSeconds(s.secondsRemaining);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (restTimerInterval) clearInterval(restTimerInterval);
    };
  }, [restTimerInterval]);

  const persistSetLogs = useCallback(
    async (logs: SetLogEntry[]) => {
      if (!sessionId || !clientId) return;
      await setInProgressWorkout({
        sessionId,
        startedAt: workoutStartedAt ?? new Date().toISOString(),
        setLogs: logs,
        restTimerSecondsRemaining: restSeconds > 0 ? restSeconds : null,
        lastSetCompletedAt: null,
      });
    },
    [sessionId, clientId, restSeconds, workoutStartedAt]
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
        persistSetLogs(next);
        return next;
      });
    },
    [session, persistSetLogs]
  );

  const updateSetLog = useCallback(
    (
      exerciseId: string,
      setNumber: number,
      update: Partial<Pick<SetLogEntry, "reps" | "weight" | "rpe">>
    ) => {
      setSetLogs((prev) => {
        const next = prev.map((l) =>
          l.exerciseId === exerciseId && l.setNumber === setNumber
            ? { ...l, ...update }
            : l
        );
        persistSetLogs(next);
        return next;
      });
    },
    [persistSetLogs]
  );

  const completeWorkout = useCallback(
    async (overallRpe?: number): Promise<{ error: Error | null }> => {
      if (!clientId || !session) {
        return { error: new Error("Missing client or session") };
      }

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
        overallRpe
      );

      setIsSaving(false);

      if (!error) {
        await clearInProgressWorkout();
      }

      return { error };
    },
    [clientId, session, setLogs]
  );

  const startRestTimer = useCallback((seconds: number, autoStart = false) => {
    setRestSeconds(seconds);
    setRestTimerState({ secondsRemaining: seconds, startedAt: new Date().toISOString(), autoStart });

    if (restTimerInterval) clearInterval(restTimerInterval);
    const id = setInterval(() => {
      setRestSeconds((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          clearInterval(id);
          setRestTimerState(null);
        } else {
          setRestTimerState({
            secondsRemaining: next,
            startedAt: new Date().toISOString(),
            autoStart,
          });
        }
        return next;
      });
    }, 1000);
    setRestTimerInterval(id);
  }, [restTimerInterval]);

  const pauseRestTimer = useCallback(() => {
    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      setRestTimerInterval(null);
    }
    setRestTimerState(null);
  }, [restTimerInterval]);

  return {
    session,
    setLogs,
    isLoading,
    isSaving,
    addSetLog,
    updateSetLog,
    completeWorkout,
    restTimer: {
      secondsRemaining: restSeconds,
      isRunning: restTimerInterval != null,
      start: startRestTimer,
      pause: pauseRestTimer,
    },
  };
}
