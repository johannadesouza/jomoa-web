import { useEffect, useState, useCallback } from "react";
import {
  getEntriesForRange,
  upsertEntry,
  deleteEntry,
  type CalendarEntry,
  type UpsertCalendarEntryInput,
} from "../services/calendarEntryService";
import { getLocalDateString } from "../utils/date";

function getDateRange(days: number, weekStart: Date): { start: string; end: string } {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + days - 1);
  return {
    start: getLocalDateString(start),
    end: getLocalDateString(end),
  };
}

export function useCalendarEntries(clientId: string | undefined, weekStart: Date) {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { start, end } = getDateRange(7, weekStart);
      const data = await getEntriesForRange(clientId, start, end);
      setEntries(data);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const upsert = useCallback(
    async (input: Omit<UpsertCalendarEntryInput, "client_id">): Promise<CalendarEntry | null> => {
      if (!clientId) return null;
      const result = await upsertEntry({ ...input, client_id: clientId });
      if (result) await load();
      return result;
    },
    [clientId, load]
  );

  const remove = useCallback(
    async (date: string): Promise<boolean> => {
      if (!clientId) return false;
      const ok = await deleteEntry(clientId, date);
      if (ok) await load();
      return ok;
    },
    [clientId, load]
  );

  return { entries, isLoading, refetch: load, upsert, remove };
}
