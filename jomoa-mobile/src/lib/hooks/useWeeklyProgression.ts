import { useEffect, useState, useCallback } from "react";
import {
  fetchWeeklyCompletion,
  type WeeklyCompletion,
} from "../services/progressionService";

export function useWeeklyProgression(
  clientId: string | undefined
): WeeklyCompletion | null {
  const [data, setData] = useState<WeeklyCompletion | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setData(null);
      return;
    }
    try {
      const result = await fetchWeeklyCompletion(clientId);
      setData(result);
    } catch {
      setData(null);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  return data;
}
