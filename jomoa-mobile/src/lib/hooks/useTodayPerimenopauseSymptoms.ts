import { useEffect, useState, useCallback } from "react";
import { useAppNow } from "../../shared/context/AppNowContext";
import {
  getTodayPerimenopauseSymptoms,
  type PerimenopauseSymptoms,
} from "../services/cycleEngineService";

export function useTodayPerimenopauseSymptoms(
  clientId: string | undefined
): PerimenopauseSymptoms | null {
  const appNow = useAppNow();
  const [symptoms, setSymptoms] = useState<PerimenopauseSymptoms | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setSymptoms(null);
      return;
    }
    const data = await getTodayPerimenopauseSymptoms(clientId, appNow.todayString());
    setSymptoms(data);
  }, [clientId, appNow]);

  useEffect(() => {
    load();
  }, [load]);

  return symptoms;
}
