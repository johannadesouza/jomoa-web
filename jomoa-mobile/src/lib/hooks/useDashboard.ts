import { useEffect, useState, useCallback, useRef } from "react";
import { useAssignment } from "../../shared/context/AssignmentContext";
import { fetchActiveAssignment, getWeekIdForDate } from "../services/programService";
import { fetchWeeklyStats, fetchCompletedSessionForDate } from "../services/workoutLogService";
import { fetchSessionsByWeekId } from "../services/workoutService";
import { getLocalDateString } from "../utils/date";
import { ProgramAssignmentData } from "../services/programService";
import { ProgramSessionData } from "../services/workoutService";

const LOAD_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout – kunde inte ladda")), ms)
    ),
  ]);
}

/** Get ISO day of week (1=Mon, 7=Sun) from YYYY-MM-DD string */
function getDayOfWeekFromDateStr(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

export interface WeekDay {
  name: string;
  shortName: string;
  dayOfWeek: number;
  session: ProgramSessionData | null;
  isToday: boolean;
}

export function useDashboard(clientId: string | undefined, viewDate?: string) {
  const viewDateStr = viewDate ?? getLocalDateString();
  const todayStr = getLocalDateString();
  const isViewingToday = viewDateStr === todayStr;

  const ctx = useAssignment();
  const assignmentRef = useRef<ProgramAssignmentData | null>(ctx?.assignment ?? null);
  assignmentRef.current = ctx?.assignment ?? null;

  const [assignment, setAssignment] = useState<ProgramAssignmentData | null>(null);
  const [todaySession, setTodaySession] = useState<ProgramSessionData | null>(null);
  const [todaySessionCompleted, setTodaySessionCompleted] = useState(false);
  const [todayCompletedSessionId, setTodayCompletedSessionId] = useState<string | null>(null);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!clientId) return;

      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const fromContext = assignmentRef.current;
        const [assignmentData, stats] = await withTimeout(
          Promise.all([
            fromContext ? Promise.resolve(fromContext) : fetchActiveAssignment(clientId),
            fetchWeeklyStats(clientId),
          ]),
          LOAD_TIMEOUT_MS
        );

        setWeeklyWorkouts(stats.weeklyWorkouts);
        setStreak(stats.streak);

        const todayDb = getDayOfWeekFromDateStr(todayStr);
        const baseDays: Omit<WeekDay, "session" | "isToday">[] = [
          { name: "Måndag", shortName: "M", dayOfWeek: 1 },
          { name: "Tisdag", shortName: "T", dayOfWeek: 2 },
          { name: "Onsdag", shortName: "O", dayOfWeek: 3 },
          { name: "Torsdag", shortName: "T", dayOfWeek: 4 },
          { name: "Fredag", shortName: "F", dayOfWeek: 5 },
          { name: "Lördag", shortName: "L", dayOfWeek: 6 },
          { name: "Söndag", shortName: "S", dayOfWeek: 7 },
        ];

        if (assignmentData) {
          setAssignment(assignmentData);

          const weekId = await getWeekIdForDate(
            assignmentData.program_id,
            assignmentData.start_date,
            viewDateStr
          );
          if (weekId) {
            const sessions = await fetchSessionsByWeekId(weekId);
            const viewDayDb = getDayOfWeekFromDateStr(viewDateStr);
            const session = sessions.find((s) => s.day_of_week === viewDayDb) || null;

            setTodaySession(session);

            if (session) {
              const completed = await fetchCompletedSessionForDate(clientId, session.id, viewDateStr);
              setTodaySessionCompleted(!!completed);
              setTodayCompletedSessionId(completed?.id ?? null);
            } else {
              setTodaySessionCompleted(false);
              setTodayCompletedSessionId(null);
            }

            const days: WeekDay[] = baseDays.map((day) => ({
              ...day,
              session: sessions.find((s) => s.day_of_week === day.dayOfWeek) || null,
              isToday: day.dayOfWeek === todayDb,
            }));

            setWeekDays(days);
          } else {
            setTodaySession(null);
            setTodaySessionCompleted(false);
            setTodayCompletedSessionId(null);
            setWeekDays(
              baseDays.map((day) => ({
                ...day,
                session: null,
                isToday: day.dayOfWeek === todayDb,
              }))
            );
          }
        } else {
          setAssignment(null);
          setTodaySession(null);
          setTodaySessionCompleted(false);
          setTodayCompletedSessionId(null);
          setWeekDays(
            baseDays.map((day) => ({
              ...day,
              session: null,
              isToday: day.dayOfWeek === todayDb,
            }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte ladda dashboard");
        setAssignment(null);
        setTodaySession(null);
        const todayDb = getDayOfWeekFromDateStr(getLocalDateString());
        setWeekDays(
          [
            { name: "Måndag", shortName: "M", dayOfWeek: 1 },
            { name: "Tisdag", shortName: "T", dayOfWeek: 2 },
            { name: "Onsdag", shortName: "O", dayOfWeek: 3 },
            { name: "Torsdag", shortName: "T", dayOfWeek: 4 },
            { name: "Fredag", shortName: "F", dayOfWeek: 5 },
            { name: "Lördag", shortName: "L", dayOfWeek: 6 },
            { name: "Söndag", shortName: "S", dayOfWeek: 7 },
          ].map((day) => ({
            ...day,
            session: null,
            isToday: day.dayOfWeek === todayDb,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    },
    [clientId, viewDateStr]
  );

  useEffect(() => {
    if (clientId) {
      load(false);
    } else {
      setIsLoading(false);
    }
  }, [clientId, viewDateStr, load]);

  const refetch = useCallback(() => load(true), [load]);

  return {
    assignment,
    todaySession,
    todaySessionCompleted,
    todayCompletedSessionId,
    weekDays,
    weeklyWorkouts,
    streak,
    isLoading,
    error,
    refetch,
    isViewingToday,
  };
}
