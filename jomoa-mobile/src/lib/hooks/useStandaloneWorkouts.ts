import { useEffect, useState, useCallback } from "react";
import { fetchStandaloneSessions } from "../services/sessionTemplateService";
import type { SessionTemplateData } from "../services/sessionTemplateService";

const LOAD_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout – kunde inte ladda")), ms)
    ),
  ]);
}

export function useStandaloneWorkouts(focusFilter?: string | null) {
  const [sessions, setSessions] = useState<SessionTemplateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const data = await withTimeout(
          fetchStandaloneSessions(focusFilter ?? undefined),
          LOAD_TIMEOUT_MS
        );
        setSessions(data);
      } catch {
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [focusFilter]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refetch = useCallback(() => load(true), [load]);

  return { sessions, isLoading, refetch };
}
