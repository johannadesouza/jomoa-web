import { useState, useCallback } from "react";
import { useCycle } from "./useCycle";
import { getCycleSymptomsForRange, saveCycleSymptom } from "../services/cycleSymptomService";
import type { CycleSymptomInput } from "../services/cycleSymptomService";

export function useCyclePhase(clientId: string | undefined) {
  const cycle = useCycle(clientId);
  const [symptoms, setSymptoms] = useState<Record<string, unknown>>({});

  const loadSymptomsForRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (!clientId) return [];
      const data = await getCycleSymptomsForRange(clientId, startDate, endDate);
      const byDate: Record<string, unknown> = {};
      data.forEach((s) => {
        if (s.date) byDate[s.date] = s;
      });
      setSymptoms(byDate);
      return data;
    },
    [clientId]
  );

  const logSymptom = useCallback(
    async (input: CycleSymptomInput) => {
      if (!clientId) return { error: new Error("No client") };
      const { error } = await saveCycleSymptom(clientId, input);
      return { error };
    },
    [clientId]
  );

  return {
    ...cycle,
    symptoms,
    loadSymptomsForRange,
    logSymptom,
  };
}
