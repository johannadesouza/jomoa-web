import { supabase } from "../../config/supabase";

export interface WorkoutStats {
  weeklyWorkouts: number;
  streak: number;
}

export interface InsightStats {
  totalVolume: number;
  sessionsThisMonth: number;
  averageRpe: number | null;
  streak: number;
}

export async function fetchWeeklyStats(clientId: string): Promise<WorkoutStats> {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const { data: weeklyData } = await supabase
    .from("workout_sessions_log")
    .select("id, date")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("date", startOfWeek.toISOString().split("T")[0]);

  const weeklyWorkouts = weeklyData?.length ?? 0;

  const { data: allWorkouts } = await supabase
    .from("workout_sessions_log")
    .select("date")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(30);

  let streak = 0;
  if (allWorkouts && allWorkouts.length > 0) {
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];
    const workoutDates = new Set(allWorkouts.map((w) => w.date));

    if (workoutDates.has(todayStr) || workoutDates.has(yesterdayStr)) {
      let checkDate = workoutDates.has(todayStr)
        ? today
        : new Date(today.getTime() - 86400000);

      for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (workoutDates.has(dateStr)) {
          streak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }
  }

  return { weeklyWorkouts, streak };
}

export async function fetchInsightStats(clientId: string): Promise<InsightStats> {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: monthlySessions } = await supabase
    .from("workout_sessions_log")
    .select(`
      id,
      overall_rpe,
      set_logs (weight, reps)
    `)
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("date", startOfMonth);

  const sessionsThisMonth = monthlySessions?.length ?? 0;

  let totalVolume = 0;
  const rpeValues: number[] = [];

  for (const session of monthlySessions || []) {
    if (session.overall_rpe != null) {
      rpeValues.push(Number(session.overall_rpe));
    }
    const setLogs = (session as { set_logs?: { weight: number; reps: number }[] }).set_logs || [];
    for (const log of setLogs) {
      const weight = log?.weight ?? 0;
      const reps = log?.reps ?? 0;
      totalVolume += weight * reps;
    }
  }

  const averageRpe =
    rpeValues.length > 0
      ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length
      : null;

  const { streak } = await fetchWeeklyStats(clientId);

  return {
    totalVolume: Math.round(totalVolume),
    sessionsThisMonth,
    averageRpe: averageRpe != null ? Math.round(averageRpe * 10) / 10 : null,
    streak,
  };
}

export interface CompletedSet {
  exerciseId: string;
  count: number;
}

export interface SetLogInput {
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
}

export async function createWorkoutLogWithSets(
  clientId: string,
  programSessionId: string,
  setLogs: SetLogInput[],
  overallRpe?: number | null
): Promise<{ workoutLogId?: string; error: Error | null }> {
  const today = new Date().toISOString().split("T")[0];

  const existing = await fetchTodayCompletedSession(clientId, programSessionId);
  if (existing) {
    return {
      error: new Error("Detta pass är redan genomfört idag. Du kan inte logga samma pass flera gånger samma dag."),
    };
  }

  const { data: sessionLog, error: insertError } = await supabase
    .from("workout_sessions_log")
    .insert({
      client_id: clientId,
      program_session_id: programSessionId,
      date: today,
      status: "completed",
      overall_rpe: overallRpe ?? null,
    })
    .select("id")
    .single();

  if (insertError || !sessionLog) {
    return { error: insertError ?? new Error("Failed to create workout log") };
  }

  if (setLogs.length > 0) {
    const setLogRows = setLogs.map((s) => ({
      workout_session_log_id: sessionLog.id,
      exercise_id: s.exerciseId,
      set_number: s.setNumber,
      reps: s.reps ?? 0,
      weight: s.weight ?? null,
      rpe: s.rpe ?? null,
    }));

    const { error: setError } = await supabase.from("set_logs").insert(setLogRows);
    if (setError) {
      return { error: setError, workoutLogId: sessionLog.id };
    }
  }

  return { workoutLogId: sessionLog.id, error: null };
}

export async function createWorkoutLog(
  clientId: string,
  programSessionId: string,
  completedSets: CompletedSet[]
): Promise<{ error: Error | null }> {
  const existing = await fetchTodayCompletedSession(clientId, programSessionId);
  if (existing) {
    return {
      error: new Error("Detta pass är redan genomfört idag. Du kan inte logga samma pass flera gånger samma dag."),
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const { data: sessionLog, error: insertError } = await supabase
    .from("workout_sessions_log")
    .insert({
      client_id: clientId,
      program_session_id: programSessionId,
      date: today,
      status: "completed",
    })
    .select("id")
    .single();

  if (insertError || !sessionLog) {
    return { error: insertError ?? new Error("Failed to create workout log") };
  }

  const setLogRows: {
    workout_session_log_id: string;
    exercise_id: string;
    set_number: number;
    reps: number;
  }[] = [];

  for (const { exerciseId, count } of completedSets) {
    for (let setNum = 1; setNum <= count; setNum++) {
      setLogRows.push({
        workout_session_log_id: sessionLog.id,
        exercise_id: exerciseId,
        set_number: setNum,
        reps: 0,
      });
    }
  }

  if (setLogRows.length > 0) {
    const { error: setError } = await supabase.from("set_logs").insert(setLogRows);
    if (setError) {
      return { error: setError };
    }
  }

  return { error: null };
}

export interface LoggedWorkout {
  id: string;
  date: string;
  program_session_id: string | null;
  program_session?: { name: string } | null;
}

/** Check if client completed a specific program session today */
export async function fetchTodayCompletedSession(
  clientId: string,
  programSessionId: string
): Promise<{ id: string } | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("workout_sessions_log")
    .select("id")
    .eq("client_id", clientId)
    .eq("program_session_id", programSessionId)
    .eq("date", today)
    .eq("status", "completed")
    .maybeSingle();
  return data ? { id: data.id } : null;
}

export async function fetchLoggedWorkoutsForRange(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<LoggedWorkout[]> {
  const { data } = await supabase
    .from("workout_sessions_log")
    .select(`
      id,
      date,
      program_session_id,
      program_session:program_sessions (name)
    `)
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return (data || []) as unknown as LoggedWorkout[];
}
