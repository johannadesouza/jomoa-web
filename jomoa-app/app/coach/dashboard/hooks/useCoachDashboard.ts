/**
 * Main hook for Coach Dashboard data fetching
 * Consolidates all data fetching logic with cancellation guards and optimized queries
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { getLocalDateString } from "@/lib/utils/date";
import { ERROR_MESSAGES, getUserFriendlyErrorMessage } from "@/lib/utils/errorMessages";
import type {
  DashboardStats,
  OnboardingTask,
  ClientNeedingAttention,
  RecentWorkout,
} from "../domain/types";
import {
  ONBOARDING_TASK_KEYS,
  WORKOUT_STATUS,
  READINESS_THRESHOLD,
  DAYS_FOR_RECENT_TRAINING,
} from "../domain/constants";

export function useCoachDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation guard
  const abortControllerRef = useRef<AbortController | null>(null);

  // Optimized onboarding fetch - max 3 queries
  const fetchOnboardingTasksOptimized = useCallback(
    async (
      profileId: string,
      totalClients: number,
      clientIds: string[],
      recentWorkoutsCount: number
    ): Promise<OnboardingTask[]> => {
      // Query 1: Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("onboarding_tasks")
        .select("id, key, title, description, order_index, is_active, target_role")
        .eq("target_role", "coach")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (tasksError) {
        console.error("Error fetching onboarding tasks:", tasksError);
        return [];
      }

      // Query 2: Fetch task statuses
      const { data: taskStatusData } = await supabase
        .from("profile_onboarding_task_status")
        .select("task_id, status, completed_at")
        .eq("profile_id", profileId);

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

      // Query 3: Batch check completion status for all pending tasks
      const pendingTasks = tasks.filter((t) => t.status !== "completed");
      const taskKeys = pendingTasks.map((t) => t.key);

      // Single batch query to check all completion statuses
      const [programsCheck, sessionsCheck, assignmentsCheck] = await Promise.all([
        taskKeys.includes(ONBOARDING_TASK_KEYS.CREATE_PROGRAM) ||
        taskKeys.includes(ONBOARDING_TASK_KEYS.ADD_SESSIONS)
          ? supabase
              .from("training_programs")
              .select("id")
              .eq("created_by_coach_id", profileId)
          : Promise.resolve({ data: [], error: null }),
        taskKeys.includes(ONBOARDING_TASK_KEYS.ADD_SESSIONS)
          ? supabase
              .from("program_sessions")
              .select("id")
              .limit(1)
          : Promise.resolve({ data: [], error: null }),
        taskKeys.includes(ONBOARDING_TASK_KEYS.ASSIGN_PROGRAM) && clientIds.length > 0
          ? supabase
              .from("client_program_assignments")
              .select("id")
              .in("client_id", clientIds)
              .eq("is_active", true)
              .limit(1)
          : Promise.resolve({ data: [], error: null }),
      ]);

      // Update task completion status
      const completionChecks = {
        [ONBOARDING_TASK_KEYS.CREATE_CLIENT]: totalClients > 0,
        [ONBOARDING_TASK_KEYS.CREATE_PROGRAM]: (programsCheck.data?.length || 0) > 0,
        [ONBOARDING_TASK_KEYS.ADD_SESSIONS]: (sessionsCheck.data?.length || 0) > 0,
        [ONBOARDING_TASK_KEYS.ASSIGN_PROGRAM]: (assignmentsCheck.data?.length || 0) > 0,
        [ONBOARDING_TASK_KEYS.CLIENT_FIRST_WORKOUT]: recentWorkoutsCount > 0,
      };

      const tasksToUpdate: Array<{ taskId: string; profileId: string }> = [];

      for (const task of tasks) {
        if (task.status === "completed") continue;

        const isCompleted =
          completionChecks[task.key as keyof typeof completionChecks] || false;

        if (isCompleted) {
          tasksToUpdate.push({ taskId: task.id, profileId });
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

      // Update onboarding_stage if all tasks completed
      const allCompleted = tasks.every((t) => t.status === "completed");
      if (allCompleted && tasks.length > 0) {
        await supabase
          .from("profiles")
          .update({
            onboarding_stage: "completed",
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq("id", profileId);
      }

      return tasks;
    },
    []
  );

  // Process clients needing attention
  const processClientsNeedingAttention = useCallback(
    async (
      clientIds: string[],
      today: string,
      sevenDaysAgoStr: string,
      readinessData: any[],
      incompleteWorkoutsData: any[],
      clientsTrainedRecently: Set<string>
    ): Promise<{
      lowReadiness: ClientNeedingAttention[];
      notTrainedRecently: ClientNeedingAttention[];
      incompleteWorkouts: ClientNeedingAttention[];
    }> => {
      // Process low readiness
      const lowReadiness: ClientNeedingAttention[] = readinessData
        .filter(
          (r) =>
            (r.energy_level && r.energy_level <= READINESS_THRESHOLD) ||
            (r.sleep_quality && r.sleep_quality <= READINESS_THRESHOLD)
        )
        .map((r) => {
          const client = normalizeRelation(r.client);
          const profile = client ? normalizeRelation(client.profile) : null;
          const reasons = [];
          if (r.energy_level && r.energy_level <= READINESS_THRESHOLD) {
            reasons.push(`Energi: ${r.energy_level}`);
          }
          if (r.sleep_quality && r.sleep_quality <= READINESS_THRESHOLD) {
            reasons.push(`Sömn: ${r.sleep_quality}`);
          }
          return {
            id: r.client_id,
            name: profile?.full_name || "Okänd klient",
            reason: "Låg readiness",
            details: reasons.join(", "),
          };
        });

      // Process not trained recently
      const { data: activeAssignmentsData } = await supabase
        .from("client_program_assignments")
        .select(`
          client_id,
          client:clients!client_program_assignments_client_id_fkey (
            id,
            profile:profiles!clients_profile_id_fkey (full_name)
          )
        `)
        .in("client_id", clientIds)
        .eq("is_active", true);

      const clientsWithActivePrograms = new Set(
        activeAssignmentsData?.map((a) => a.client_id) || []
      );

      const notTrainedRecently: ClientNeedingAttention[] = Array.from(
        clientsWithActivePrograms
      )
        .filter((clientId) => !clientsTrainedRecently.has(clientId))
        .map((clientId) => {
          const assignment = activeAssignmentsData?.find(
            (a) => a.client_id === clientId
          );
          const client = assignment ? normalizeRelation(assignment.client) : null;
          const profile = client ? normalizeRelation(client.profile) : null;
          return {
            id: clientId,
            name: profile?.full_name || "Okänd klient",
            reason: "Inte tränat senaste 7 dagarna",
            details: "Har aktivt program men inga passloggar",
          };
        });

      // Process incomplete workouts
      const incompleteWorkouts: ClientNeedingAttention[] = incompleteWorkoutsData
        .filter((w) => {
          const client = normalizeRelation(w.client);
          const profile = client ? normalizeRelation(client.profile) : null;
          return profile?.full_name;
        })
        .map((w) => {
          const client = normalizeRelation(w.client);
          const session = normalizeRelation(w.session);
          const profile = client ? normalizeRelation(client.profile) : null;
          return {
            id: w.client_id,
            name: profile?.full_name || "Okänd klient",
            reason: "Påbörjat pass ej avslutat",
            details: `${session?.name || "Pass"} - ${new Date(w.date).toLocaleDateString("sv-SE")}`,
            workoutLogId: w.id,
          };
        });

      return {
        lowReadiness,
        notTrainedRecently,
        incompleteWorkouts,
      };
    },
    []
  );

  const fetchDashboardStats = useCallback(async () => {
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
      setLoading(true);
      setError(null);

      // Query 1: Get all active clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("primary_coach_id", user.id)
        .eq("status", "active");

      if (abortControllerRef.current?.signal.aborted) return;
      if (clientsError) throw clientsError;

      const totalClients = clientsData?.length || 0;
      const clientIds = clientsData?.map((c) => c.id) || [];

      if (clientIds.length === 0) {
        setStats({
          totalClients: 0,
          clientsTrainedLast7Days: 0,
          clientsWithoutReadinessToday: 0,
          recentWorkouts: [],
          onboardingTasks: [],
          clientsNeedingAttention: {
            lowReadiness: [],
            notTrainedRecently: [],
            incompleteWorkouts: [],
          },
        });
        setLoading(false);
        return;
      }

      // Calculate date ranges using local date utility
      const today = getLocalDateString();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - DAYS_FOR_RECENT_TRAINING);
      const sevenDaysAgoStr = getLocalDateString(sevenDaysAgo);

      // Query 2-4: Batch fetch workout and readiness data
      const [
        workoutsLast7DaysResult,
        recentWorkoutsResult,
        incompleteWorkoutsResult,
        readinessResult,
      ] = await Promise.all([
        supabase
          .from("workout_sessions_log")
          .select("client_id")
          .in("client_id", clientIds)
          .gte("date", sevenDaysAgoStr),
        supabase
          .from("workout_sessions_log")
          .select(`
            id,
            date,
            status,
            client:clients!workout_sessions_log_client_id_fkey (
              id,
              profile:profiles!clients_profile_id_fkey (full_name)
            ),
            session:program_sessions!workout_sessions_log_program_session_id_fkey (name)
          `)
          .in("client_id", clientIds)
          .eq("status", WORKOUT_STATUS.COMPLETED)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("workout_sessions_log")
          .select(`
            id,
            client_id,
            date,
            status,
            client:clients!workout_sessions_log_client_id_fkey (
              id,
              profile:profiles!clients_profile_id_fkey (full_name)
            ),
            session:program_sessions!workout_sessions_log_program_session_id_fkey (name)
          `)
          .in("client_id", clientIds)
          .eq("status", WORKOUT_STATUS.STARTED)
          .order("date", { ascending: false }),
        supabase
          .from("daily_readiness")
          .select(`
            client_id,
            energy_level,
            sleep_quality,
            client:clients!daily_readiness_client_id_fkey (
              id,
              profile:profiles!clients_profile_id_fkey (full_name)
            )
          `)
          .in("client_id", clientIds)
          .eq("date", today)
          .or(`energy_level.lte.${READINESS_THRESHOLD},sleep_quality.lte.${READINESS_THRESHOLD}`),
      ]);

      if (abortControllerRef.current?.signal.aborted) return;

      const uniqueClientsTrained = new Set(
        workoutsLast7DaysResult.data?.map((w) => w.client_id) || []
      );
      const clientsTrainedLast7Days = uniqueClientsTrained.size;

      // Get all readiness data (not just low)
      const { data: allReadinessData } = await supabase
        .from("daily_readiness")
        .select("client_id")
        .in("client_id", clientIds)
        .eq("date", today);

      if (abortControllerRef.current?.signal.aborted) return;

      const clientsWithReadiness = new Set(
        allReadinessData?.map((r) => r.client_id) || []
      );
      const clientsWithoutReadinessToday = totalClients - clientsWithReadiness.size;

      // Process recent workouts
      const recentWorkouts: RecentWorkout[] = (recentWorkoutsResult.data || []).map(
        (w) => {
          const client = normalizeRelation(w.client);
          const session = normalizeRelation(w.session);
          const profile = client ? normalizeRelation(client.profile) : null;
          return {
            id: w.id,
            client_name: profile?.full_name || "Okänd klient",
            session_name: session?.name || "Okänt pass",
            date: w.date,
            status: w.status,
          };
        }
      );

      // Process clients needing attention
      const clientsNeedingAttention = await processClientsNeedingAttention(
        clientIds,
        today,
        sevenDaysAgoStr,
        readinessResult.data || [],
        incompleteWorkoutsResult.data || [],
        uniqueClientsTrained
      );

      // Optimized onboarding fetch (max 3 queries)
      const onboardingTasks = await fetchOnboardingTasksOptimized(
        user.id,
        totalClients,
        clientIds,
        recentWorkouts.length
      );

      if (abortControllerRef.current?.signal.aborted) return;

      setStats({
        totalClients,
        clientsTrainedLast7Days,
        clientsWithoutReadinessToday,
        recentWorkouts,
        onboardingTasks,
        clientsNeedingAttention,
      });
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error("Error fetching dashboard stats:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.FETCH_FAILED));
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchOnboardingTasksOptimized, processClientsNeedingAttention]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardStats();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, authLoading, fetchDashboardStats]);

  return {
    stats,
    loading: authLoading || loading,
    error,
    refetch: fetchDashboardStats,
  };
}

