import { useEffect, useState } from "react";
import { getReadinessHistory } from "../services/readinessService";
import type { ReadinessRecord } from "../services/readinessService";
import { getLocalDateString } from "../utils/date";

/** Last N days for trend */
const DEFAULT_DAYS = 14;

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: getLocalDateString(start),
    end: getLocalDateString(end),
  };
}

export function useReadinessHistory(
  clientId: string | undefined,
  days = DEFAULT_DAYS
) {
  const [records, setRecords] = useState<ReadinessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = async () => {
    if (!clientId) {
      setRecords([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { start, end } = getDateRange(days);
      const data = await getReadinessHistory(clientId, start, end);
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [clientId, days]);

  return { records, isLoading, refetch };
}
