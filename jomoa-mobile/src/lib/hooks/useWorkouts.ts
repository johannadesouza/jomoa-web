import { useEffect, useState } from "react";
import { fetchSessionsForWorkouts } from "../services/workoutService";
import { ProgramSessionData } from "../services/workoutService";

export function useWorkouts(clientId: string | undefined) {
  const [sessions, setSessions] = useState<ProgramSessionData[]>([]);
  const [programName, setProgramName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [clientId]);

  async function load() {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const { sessions: data, programName: name } = await fetchSessionsForWorkouts(clientId);
      setSessions(data);
      setProgramName(name);
    } catch {
      setSessions([]);
      setProgramName(null);
    } finally {
      setIsLoading(false);
    }
  }

  return { sessions, programName, isLoading, refetch: load };
}
