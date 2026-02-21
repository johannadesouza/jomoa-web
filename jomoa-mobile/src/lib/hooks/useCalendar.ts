import { useEffect, useState, useCallback } from "react";
import { fetchActiveAssignment, getFirstWeekId } from "../services/programService";
import { fetchSessionsByWeekId } from "../services/workoutService";
import {
  fetchLoggedWorkoutsForRange,
  type LoggedWorkout,
} from "../services/workoutLogService";
import { getLatestPeriodStart } from "../services/cycleService";
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

    const [assignmentData, loggedWorkouts, { data: latestPeriodStart }] =
      await withTimeout(
        Promise.all([
          fetchActiveAssignment(clientId),
          fetchLoggedWorkoutsForRange(clientId, startDate, endDate),
          getLatestPeriodStart(clientId),
        ]),
        LOAD_TIMEOUT_MS
      );

    const logMap = new Map(loggedWorkouts.map((w) => [w.date, w]));

    let sessions: ProgramSessionData[] = [];
    if (assignmentData) {
      const weekId = await getFirstWeekId(assignmentData.program_id);
      if (weekId) {
        sessions = await fetchSessionsByWeekId(weekId);
      }
    }

    const todayStr = getLocalDateString();
    const calendarDays: CalendarDay[] = weekDates.map((dateStr, i) => {
      const d = new Date(dateStr);
      const jsDay = d.getDay();
      const dbDayOfWeek = jsDay === 0 ? 7 : jsDay;
      const planned = sessions.find((s) => s.day_of_week === dbDayOfWeek);
      const { phase: cyclePhase } = calculateCyclePhase(latestPeriodStart ?? null, d);
      return {
        date: dateStr,
        dateNum: d.getDate(),
        dayName: DAY_NAMES[i],
        isToday: dateStr === todayStr,
        plannedSession: planned ?? null,
        loggedWorkout: logMap.get(dateStr) ?? null,
        cyclePhase,
      };
    });

    setDays(calendarDays);
    } catch {
    setDays([]);
    } finally {
    setIsLoading(false);
    }
  }, [clientId, weekStart]);

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
