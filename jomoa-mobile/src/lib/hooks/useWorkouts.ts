import { useEffect, useState, useCallback } from "react";
import { fetchSessionsForWorkouts } from "../services/workoutService";
import { ProgramSessionData } from "../services/workoutService";

const LOAD_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout – kunde inte ladda")), ms)
    ),
  ]);
}

export function useWorkouts(clientId: string | undefined) {
  const [sessions, setSessions] = useState<ProgramSessionData[]>([]);
  const [programName, setProgramName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      if (!clientId) return;

      if (!silent) {
        setIsLoading(true);
      }
      try {
        const { sessions: data, programName: name } = await withTimeout(
          fetchSessionsForWorkouts(clientId),
          LOAD_TIMEOUT_MS
        );
        setSessions(data);
        setProgramName(name);
      } catch {
        setSessions([]);
        setProgramName(null);
      } finally {
        setIsLoading(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    if (clientId) {
      load(false);
    } else {
      setIsLoading(false);
    }
  }, [clientId, load]);

  const refetch = useCallback(() => load(true), [load]);

  return { sessions, programName, isLoading, refetch };
}
