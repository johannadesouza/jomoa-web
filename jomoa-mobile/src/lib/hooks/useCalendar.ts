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
import { calculateCyclePhase, type CyclePhase } from "../utils/cycleUtils";
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

export interface CalendarDay {
  date: string;
  dateNum: number;
  dayName: string;
  isToday: boolean;
  plannedSession: ProgramSessionData | null;
  loggedWorkout: LoggedWorkout | null;
  cyclePhase: CyclePhase;
  note: string | null;
  customSession: ProgramSessionData | null;
}

function getWeekDays(weekStart: Date): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(getLocalDateString(d));
  }
  return days;
}

function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const DAY_NAMES = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

export function useCalendar(clientId: string | undefined) {
  const { latestPeriodStart, getPhaseForDate } = useCycleContext();
  const ctx = useAssignment();
  const assignmentRef = useRef(ctx?.assignment ?? null);
  assignmentRef.current = ctx?.assignment ?? null;

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(new Date())
  );
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
    const weekDates = getWeekDays(weekStart);
    const startDate = weekDates[0];
    const endDate = weekDates[6];

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

    const todayStr = getLocalDateString();
    const calendarDays: CalendarDay[] = await Promise.all(
      weekDates.map(async (dateStr, i) => {
        const d = new Date(dateStr);
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
        const { phase: cyclePhase } = getPhaseForDate(d);
        return {
          date: dateStr,
          dateNum: d.getDate(),
          dayName: DAY_NAMES[i],
          isToday: dateStr === todayStr,
          plannedSession,
          loggedWorkout: logMap.get(dateStr) ?? null,
          cyclePhase,
          note: entry?.note ?? null,
          customSession,
        };
      })
    );

    setDays(calendarDays);
    } catch {
    setDays([]);
    } finally {
    setIsLoading(false);
    }
  }, [clientId, weekStart, latestPeriodStart, getPhaseForDate]);

  useEffect(() => {
    if (clientId) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [clientId, load]);

  const goToPrevWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() - 7);
    setWeekStart(next);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const goToToday = () => {
    setWeekStart(getWeekStart(new Date()));
  };

  const weekLabel =
    weekStart.getMonth() + 1 +
    "/" +
    weekStart.getFullYear() +
    " v" +
    getWeekNumber(weekStart);

  return {
    days,
    weekLabel,
    isLoading,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    refetch: load,
  };
}

function getWeekNumber(d: Date): number {
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDays = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
}
