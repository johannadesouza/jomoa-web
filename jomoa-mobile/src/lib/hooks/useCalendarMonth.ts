import { useEffect, useState, useCallback, useRef } from "react";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useAssignment } from "../../shared/context/AssignmentContext";
import { fetchActiveAssignment, getWeekIdForDate } from "../services/programService";
import { fetchSessionsByWeekId, fetchSessionById } from "../services/workoutService";
import { fetchSessionTemplateById } from "../services/sessionTemplateService";
import { getEntriesForRange } from "../services/calendarEntryService";
import {
  fetchLoggedWorkoutsForRange,
  type LoggedWorkout,
} from "../services/workoutLogService";
import { type CyclePhase } from "../utils/cycleUtils";
import type { ProgramSessionData } from "../services/workoutService";
import { getLocalDateString } from "../utils/date";

const LOAD_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

export interface CalendarMonthDay {
  date: string;
  dateNum: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  plannedSession: ProgramSessionData | null;
  loggedWorkout: LoggedWorkout | null;
  cyclePhase: CyclePhase;
  note: string | null;
}

function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getMonthStart(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Get all date strings for the visible month grid (Mon–Sun, 6 rows) */
function getMonthGridDates(monthStart: Date): string[] {
  const mondayOfFirstWeek = getWeekStart(new Date(monthStart));
  const dates: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(mondayOfFirstWeek);
    d.setDate(mondayOfFirstWeek.getDate() + i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December",
];

export function useCalendarMonth(clientId: string | undefined) {
  const cycleCtx = useCycleContext();
  const getPhaseForDateRef = useRef(cycleCtx.getPhaseForDate);
  getPhaseForDateRef.current = cycleCtx.getPhaseForDate;

  const ctx = useAssignment();
  const assignmentRef = useRef(ctx?.assignment ?? null);
  assignmentRef.current = ctx?.assignment ?? null;

  const [monthStart, setMonthStart] = useState<Date>(() =>
    getMonthStart(new Date())
  );
  const [days, setDays] = useState<CalendarMonthDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const gridDates = getMonthGridDates(monthStart);
      const startDate = gridDates[0];
      const endDate = gridDates[41];

      const fromContext = assignmentRef.current;
      const [assignmentData, loggedWorkouts, calendarEntries] =
        await withTimeout(
          Promise.all([
            fromContext ? Promise.resolve(fromContext) : fetchActiveAssignment(clientId),
            fetchLoggedWorkoutsForRange(clientId, startDate, endDate),
            getEntriesForRange(clientId, startDate, endDate),
          ]),
          LOAD_TIMEOUT_MS
        );

      const logMap = new Map(loggedWorkouts.map((w) => [w.date, w]));
      const entryMap = new Map(calendarEntries.map((e) => [e.date, e]));

      const firstOfMonth = new Date(monthStart);
      const lastOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const todayStr = getLocalDateString();

      let sessions: ProgramSessionData[] = [];
      if (assignmentData) {
        const weekId = await getWeekIdForDate(
          assignmentData.program_id,
          assignmentData.start_date,
          startDate
        );
        if (weekId) {
          sessions = await fetchSessionsByWeekId(weekId);
        }
      }

      const calendarDays: CalendarMonthDay[] = await Promise.all(
        gridDates.map(async (dateStr) => {
          const d = new Date(dateStr + "T12:00:00");
          const jsDay = d.getDay();
          const dbDayOfWeek = jsDay === 0 ? 7 : jsDay;
          const programPlanned = sessions.find((s) => s.day_of_week === dbDayOfWeek);
          const entry = entryMap.get(dateStr);
          let customSession: ProgramSessionData | null = null;
          if (entry?.program_session_id) {
            customSession = await fetchSessionById(entry.program_session_id);
          } else if (entry?.session_template_id) {
            const tmpl = await fetchSessionTemplateById(entry.session_template_id);
            customSession = tmpl ? { ...tmpl, day_of_week: 0 } : null;
          }
          const plannedSession = customSession ?? programPlanned ?? null;
          const { phase: cyclePhase } = getPhaseForDateRef.current(d);
          const isCurrentMonth =
            d >= firstOfMonth && d <= lastOfMonth;
          return {
            date: dateStr,
            dateNum: d.getDate(),
            isToday: dateStr === todayStr,
            isCurrentMonth,
            plannedSession,
            loggedWorkout: logMap.get(dateStr) ?? null,
            cyclePhase,
            note: entry?.note ?? null,
          };
        })
      );

      setDays(calendarDays);
    } catch {
      setDays([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, monthStart]);

  useEffect(() => {
    if (clientId) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [clientId, load]);

  const goToPrevMonth = () => {
    const next = new Date(monthStart);
    next.setMonth(next.getMonth() - 1);
    setMonthStart(getMonthStart(next));
  };

  const goToNextMonth = () => {
    const next = new Date(monthStart);
    next.setMonth(next.getMonth() + 1);
    setMonthStart(getMonthStart(next));
  };

  const goToToday = () => {
    setMonthStart(getMonthStart(new Date()));
  };

  const monthLabel = `${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;

  return {
    days,
    grid: days.length ? chunk(days, 7) : [],
    monthLabel,
    isLoading,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    refetch: load,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
