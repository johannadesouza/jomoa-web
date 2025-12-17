/**
 * Main hook for Client Dashboard data fetching
 * Consolidates all data fetching logic with cancellation guards
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { getLocalDateString } from "@/lib/utils/date";
import type {
  ProgramAssignment,
  ProgramSession,
  CycleStatus,
  ReadinessState,
  OnboardingTask,
} from "../domain/types";
import { ONBOARDING_TASK_KEYS } from "../domain/constants";
import { calculateCyclePhase, getCycleColorClasses } from "@/lib/utils/cycleColors";

export function useClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<ProgramAssignment | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [readiness, setReadiness] = useState<ReadinessState>({
    sleep_quality: "",
    energy_level: "",
    stress_level: "",
    soreness: "",
  });
  const [readinessLoaded, setReadinessLoaded] = useState(false);
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [cycleStatus, setCycleStatus] = useState<CycleStatus | null>(null);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation refs for async operations
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch client ID
  const fetchClientId = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (abortControllerRef.current?.signal.aborted) return;

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Kunde inte verifiera användarroll. Försök igen senare.");
        setLoading(false);
        return;
      }

      if (profileData?.role !== "client") {
        setError("Du har inte rätt behörighet. Kontakta support.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("id, status")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (abortControllerRef.current?.signal.aborted) return;

      if (fetchError) {
        if (fetchError.code === "42501") {
          setError("Åtkomst nekad. Kontrollera att RLS policies är korrekt konfigurerade.");
        } else {
          setError("Kunde inte hämta klientinformation. Försök igen senare.");
        }
        setLoading(false);
        return;
      }

      if (!data) {
        setClientId(null);
        setLoading(false);
        return;
      }

      if (data.status !== "active") {
        setError("Din klientprofil är inte aktiv. Kontakta din coach.");
        setLoading(false);
        return;
      }

      setClientId(data.id);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error("Error fetching client ID:", err);
      setError("Kunde inte hämta klientinformation. Försök igen senare.");
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch client name
  const fetchClientName = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data?.full_name) {
        setClientName(data.full_name.split(" ")[0]);
      }
    } catch (err) {
      console.error("Error fetching client name:", err);
    }
  }, [user?.id]);

  // Fetch active program
  const fetchActiveProgram = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("client_program_assignments")
        .select(`
          id,
          program_id,
          start_date,
          program:training_programs!client_program_assignments_program_id_fkey (
            id,
            name,
            description
          )
        `)
        .eq("client_id", clientId)
        .eq("is_active", true)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setAssignment(null);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      const assignmentData = {
        ...data,
        program: Array.isArray(data.program) ? data.program[0] : data.program,
      };
      const normalizedAssignment: ProgramAssignment = {
        id: assignmentData.id,
        program_id: assignmentData.program_id,
        start_date: assignmentData.start_date,
        program: normalizeRelation(assignmentData.program) || { id: "", name: "", description: null },
      };
      setAssignment(normalizedAssignment);
    } catch (err) {
      console.error("Error fetching active program:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta program. Försök igen senare.");
      setLoading(false);
    }
  }, [clientId]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!assignment?.program_id || !clientId) {
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("program_sessions")
        .select(`
          id,
          name,
          day_of_week,
          focus,
          exercises:session_exercises (
            id,
            session_id,
            exercise_id,
            order_index,
            sets_planned,
            reps_planned,
            rest_seconds,
            tempo,
            intensity_type,
            intensity_value,
            notes,
            exercise:exercises!session_exercises_exercise_id_fkey (
              id,
              name
            )
          )
        `)
        .eq("program_id", assignment.program_id)
        .order("day_of_week", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      const sessionsData: ProgramSession[] = (data || []).map((session) => {
        const normalizedExercises = (session.exercises || []).map((ex: any) => ({
          id: ex.id,
          session_id: ex.session_id || session.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          sets_planned: ex.sets_planned,
          reps_planned: ex.reps_planned,
          rest_seconds: ex.rest_seconds,
          tempo: ex.tempo || null,
          intensity_type: (ex.intensity_type || "none") as "none" | "rpe" | "percent",
          intensity_value: ex.intensity_value || null,
          notes: ex.notes || null,
          exercise: normalizeRelation(ex.exercise) || { id: "", name: "" },
        }));
        return {
          id: session.id,
          name: session.name,
          day_of_week: session.day_of_week,
          focus: session.focus,
          exercises: normalizedExercises,
        };
      });

      // Fetch workout logs for today in one query
      const today = getLocalDateString();
      const sessionIds = sessionsData.map((s) => s.id);

      if (sessionIds.length > 0) {
        const { data: logsData } = await supabase
          .from("workout_sessions_log")
          .select("*")
          .eq("client_id", clientId)
          .eq("date", today)
          .in("program_session_id", sessionIds);

        sessionsData.forEach((session) => {
          const log = logsData?.find((l) => l.program_session_id === session.id);
          session.workoutLog = log || null;
        });
      }

      setSessions(sessionsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta pass. Försök igen senare.");
      setLoading(false);
    }
  }, [assignment?.program_id, clientId]);

  // Fetch today's readiness
  const fetchTodayReadiness = useCallback(async () => {
    if (!clientId) return;

    try {
      const today = getLocalDateString();
      const { data, error: fetchError } = await supabase
        .from("daily_readiness")
        .select("*")
        .eq("client_id", clientId)
        .eq("date", today)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        setReadiness({
          sleep_quality: data.sleep_quality?.toString() || "",
          energy_level: data.energy_level?.toString() || "",
          stress_level: data.stress_level?.toString() || "",
          soreness: data.soreness?.toString() || "",
        });
      }
      setReadinessLoaded(true);
    } catch (err) {
      console.error("Error fetching readiness:", err);
      setReadinessLoaded(true);
    }
  }, [clientId]);

  // Fetch latest period start
  const fetchLatestPeriodStart = useCallback(async () => {
    if (!clientId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      setLatestPeriodStart(data?.date || null);
    } catch (err) {
      setLatestPeriodStart(null);
    }
  }, [clientId]);

  // Update cycle status
  const updateCycleStatus = useCallback(() => {
    if (!latestPeriodStart) {
      setCycleStatus(null);
      return;
    }

    const { phase, cycleDay } = calculateCyclePhase(latestPeriodStart);
    const phaseLabel = phase ? getCycleColorClasses(phase).label : "Okänd / behöver ny mensstart";

    setCycleStatus({
      cycleDay,
      phase: phaseLabel,
      phaseEnum: phase,
      periodStartDate: latestPeriodStart,
      confidence: 70,
      isManual: false,
    });
  }, [latestPeriodStart]);

  // Optimized onboarding fetch - max 3 queries
  const fetchOnboardingTasks = useCallback(async () => {
    if (!user?.id || !clientId) {
      setOnboardingLoaded(true);
      return;
    }

    try {
      // Query 1: Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("target_role", "client")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (tasksError) {
        console.error("Error fetching onboarding tasks:", tasksError);
        setOnboardingLoaded(true);
        return;
      }

      // Query 2: Fetch task statuses
      const { data: taskStatusData } = await supabase
        .from("profile_onboarding_task_status")
        .select("task_id, status, completed_at")
        .eq("profile_id", user.id);

      const taskStatusMap = new Map(
        taskStatusData?.map((ts) => [ts.task_id, ts]) || []
      );

      // Combine tasks with status
      const tasks: OnboardingTask[] = (tasksData || []).map((task) => {
        const status = taskStatusMap.get(task.id);
        return {
          ...task,
          status: status?.status === "completed" ? "completed" : "pending",
          completed_at: status?.completed_at || null,
        };
      });

      // Query 3: Batch check completion status for all tasks in one query
      const pendingTasks = tasks.filter((t) => t.status === "pending");
      const taskKeys = pendingTasks.map((t) => t.key);

      // Single query to check all completion statuses
      const [readinessCheck, periodCheck, workoutCheck] = await Promise.all([
        taskKeys.includes(ONBOARDING_TASK_KEYS.LOG_READINESS)
          ? supabase
              .from("daily_readiness")
              .select("id")
              .eq("client_id", clientId)
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        taskKeys.includes(ONBOARDING_TASK_KEYS.LOG_PERIOD_START)
          ? supabase
              .from("cycle_events")
              .select("id")
              .eq("client_id", clientId)
              .eq("event_type", "period_start")
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        taskKeys.includes(ONBOARDING_TASK_KEYS.START_WORKOUT)
          ? supabase
              .from("workout_sessions_log")
              .select("id")
              .eq("client_id", clientId)
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      // Update task completion status
      const completionChecks = {
        [ONBOARDING_TASK_KEYS.LOG_READINESS]: !!readinessCheck.data,
        [ONBOARDING_TASK_KEYS.LOG_PERIOD_START]: !!periodCheck.data,
        [ONBOARDING_TASK_KEYS.START_WORKOUT]: !!workoutCheck.data,
      };

      const tasksToUpdate: Array<{ taskId: string; profileId: string }> = [];

      for (const task of tasks) {
        if (task.status === "completed") continue;

        const isCompleted = completionChecks[task.key as keyof typeof completionChecks] || false;

        if (isCompleted) {
          tasksToUpdate.push({ taskId: task.id, profileId: user.id });
          task.status = "completed";
          task.completed_at = new Date().toISOString();
        }
      }

      // Batch update task statuses
      if (tasksToUpdate.length > 0) {
        await Promise.all(
          tasksToUpdate.map(({ taskId, profileId }) =>
            supabase
              .from("profile_onboarding_task_status")
              .upsert(
                {
                  profile_id: profileId,
                  task_id: taskId,
                  status: "completed",
                  completed_at: new Date().toISOString(),
                },
                { onConflict: "profile_id,task_id" }
              )
          )
        );
      }

      setOnboardingTasks(tasks);

      // Check if all tasks are completed
      const allCompleted = tasks.every((t) => t.status === "completed");
      if (allCompleted && tasks.length > 0) {
        await supabase
          .from("profiles")
          .update({
            onboarding_stage: "completed",
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      setOnboardingLoaded(true);
    } catch (err) {
      console.error("Error fetching onboarding tasks:", err);
      setOnboardingLoaded(true);
    }
  }, [user?.id, clientId]);

  // Effects with cancellation guards
  useEffect(() => {
    if (!authLoading && user) {
      fetchClientId();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, authLoading, fetchClientId]);

  useEffect(() => {
    if (user?.id && !clientName) {
      fetchClientName();
    }
  }, [user?.id, clientName, fetchClientName]);

  useEffect(() => {
    if (clientId) {
      fetchTodayReadiness();
      fetchLatestPeriodStart();
      fetchOnboardingTasks();
    }
  }, [clientId, fetchTodayReadiness, fetchLatestPeriodStart, fetchOnboardingTasks]);

  useEffect(() => {
    if (latestPeriodStart !== null) {
      updateCycleStatus();
    }
  }, [latestPeriodStart, updateCycleStatus]);

  useEffect(() => {
    if (clientId) {
      fetchActiveProgram();
    }
  }, [clientId, fetchActiveProgram]);

  useEffect(() => {
    if (assignment?.program_id && clientId) {
      fetchSessions();
    }
  }, [assignment?.program_id, clientId, fetchSessions]);

  return {
    clientId,
    clientName,
    assignment,
    sessions,
    readiness,
    readinessLoaded,
    cycleStatus,
    onboardingTasks,
    onboardingLoaded,
    loading: authLoading || loading,
    error,
    refetchReadiness: fetchTodayReadiness,
    refetchSessions: fetchSessions,
  };
}

