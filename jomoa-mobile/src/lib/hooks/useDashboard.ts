import { useEffect, useState, useCallback } from "react";
import { fetchActiveAssignment, getFirstWeekId } from "../services/programService";
import { fetchWeeklyStats, fetchTodayCompletedSession } from "../services/workoutLogService";
import { fetchSessionsByWeekId } from "../services/workoutService";
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

export interface WeekDay {
  name: string;
  shortName: string;
  dayOfWeek: number;
  session: ProgramSessionData | null;
  isToday: boolean;
}

export function useDashboard(clientId: string | undefined) {
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
        const [assignmentData, stats] = await withTimeout(
          Promise.all([
            fetchActiveAssignment(clientId),
            fetchWeeklyStats(clientId),
          ]),
          LOAD_TIMEOUT_MS
        );

        setWeeklyWorkouts(stats.weeklyWorkouts);
        setStreak(stats.streak);

        if (assignmentData) {
          setAssignment(assignmentData);

          const weekId = await getFirstWeekId(assignmentData.program_id);
          if (weekId) {
            const sessions = await fetchSessionsByWeekId(weekId);
            const todayJs = new Date().getDay();
            const todayDb = todayJs === 0 ? 7 : todayJs;
            const session = sessions.find((s) => s.day_of_week === todayDb) || null;

            setTodaySession(session);

            if (session) {
              const completed = await fetchTodayCompletedSession(clientId, session.id);
              setTodaySessionCompleted(!!completed);
              setTodayCompletedSessionId(completed?.id ?? null);
            } else {
              setTodaySessionCompleted(false);
              setTodayCompletedSessionId(null);
            }

            const days: WeekDay[] = [
              { name: "Måndag", shortName: "M", dayOfWeek: 1 },
              { name: "Tisdag", shortName: "T", dayOfWeek: 2 },
              { name: "Onsdag", shortName: "O", dayOfWeek: 3 },
              { name: "Torsdag", shortName: "T", dayOfWeek: 4 },
              { name: "Fredag", shortName: "F", dayOfWeek: 5 },
              { name: "Lördag", shortName: "L", dayOfWeek: 6 },
              { name: "Söndag", shortName: "S", dayOfWeek: 7 },
            ].map((day) => ({
              ...day,
              session: sessions.find((s) => s.day_of_week === day.dayOfWeek) || null,
              isToday: day.dayOfWeek === todayDb,
            }));

            setWeekDays(days);
          } else {
            setTodaySession(null);
            setTodaySessionCompleted(false);
            setTodayCompletedSessionId(null);
            setWeekDays([]);
          }
        } else {
          setAssignment(null);
          setTodaySession(null);
          setTodaySessionCompleted(false);
          setTodayCompletedSessionId(null);
          setWeekDays([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte ladda dashboard");
        setAssignment(null);
        setTodaySession(null);
        setWeekDays([]);
      } finally {
        setIsLoading(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    if (clientId) {
      load(false);
    } else {
      setIsLoading(false);
    }
  }, [clientId, load]);

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
  };
}
