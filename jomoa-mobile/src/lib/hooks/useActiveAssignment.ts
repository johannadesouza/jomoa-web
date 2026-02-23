import { useEffect, useState, useCallback } from "react";
import { fetchActiveAssignment } from "../services/programService";
import type { ProgramAssignmentData } from "../services/programService";

const LOAD_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

export function useActiveAssignment(clientId: string | undefined) {
  const [assignment, setAssignment] = useState<ProgramAssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) {
      setAssignment(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await withTimeout(
        fetchActiveAssignment(clientId),
        LOAD_TIMEOUT_MS
      );
      setAssignment(data);
    } catch {
      setAssignment(null);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => load(), [load]);

  return { assignment, isLoading, refetch };
}
