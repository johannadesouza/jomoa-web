import { useEffect, useState, useCallback } from "react";
import {
  fetchMeasurements,
  upsertMeasurement,
  deleteMeasurement,
  type BodyMeasurementRecord,
} from "../services/measurementsService";

export function useMeasurements(clientId: string | undefined, limit = 30) {
  const [records, setRecords] = useState<BodyMeasurementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) {
      setRecords([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchMeasurements(clientId, limit);
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (
      date: string,
      measurements: Record<string, number>,
      note?: string | null
    ): Promise<{ error: Error | null }> => {
      if (!clientId) return { error: new Error("No client") };
      const { error } = await upsertMeasurement(clientId, date, measurements, note);
      if (!error) {
        await load();
      }
      return { error };
    },
    [clientId, load]
  );

  const remove = useCallback(
    async (date: string): Promise<{ error: Error | null }> => {
      if (!clientId) return { error: new Error("No client") };
      const { error } = await deleteMeasurement(clientId, date);
      if (!error) {
        setRecords((prev) => prev.filter((r) => r.date !== date));
      }
      return { error };
    },
    [clientId]
  );

  return { records, isLoading, refetch: load, save, remove };
}
