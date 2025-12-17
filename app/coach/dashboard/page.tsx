"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";
import { ERROR_MESSAGES, getUserFriendlyErrorMessage } from "@/lib/utils/errorMessages";

interface ClientNeedingAttention {
  id: string;
  name: string;
  reason: string;
  details?: string;
  workoutLogId?: string;
}

interface OnboardingTask {
  id: string;
  key: string;
  title: string;
  description: string | null;
  order_index: number;
  status?: "pending" | "completed";
  completed_at?: string | null;
}

interface DashboardStats {
  totalClients: number;
  clientsTrainedLast7Days: number;
  clientsWithoutReadinessToday: number;
  recentWorkouts: Array<{
    id: string;
    client_name: string;
    session_name: string;
    date: string;
    status: string;
  }>;
  onboardingTasks: OnboardingTask[];
  clientsNeedingAttention: {
    lowReadiness: ClientNeedingAttention[];
    notTrainedRecently: ClientNeedingAttention[];
    incompleteWorkouts: ClientNeedingAttention[];
  };
}

export default function CoachDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifications = [], unreadCount = 0 } = useNotifications("coach");

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardStats();
    }
  }, [user, authLoading]);

  const fetchDashboardStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Antal klienter
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("primary_coach_id", user.id)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      const totalClients = clientsData?.length || 0;
      const clientIds = clientsData?.map((c) => c.id) || [];

      // 2. Klienter som tränat senaste 7 dagarna
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

      const { data: workoutsLast7Days } = await supabase
        .from("workout_sessions_log")
        .select("client_id")
        .in("client_id", clientIds)
        .gte("date", sevenDaysAgoStr);

      const uniqueClientsTrained = new Set(workoutsLast7Days?.map((w) => w.client_id) || []);
      const clientsTrainedLast7Days = uniqueClientsTrained.size;

      // 3. Klienter utan readiness idag
      const today = new Date().toISOString().split("T")[0];
      const { data: readinessToday } = await supabase
        .from("daily_readiness")
        .select("client_id")
        .in("client_id", clientIds)
        .eq("date", today);

      const clientsWithReadiness = new Set(readinessToday?.map((r) => r.client_id) || []);
      const clientsWithoutReadinessToday = totalClients - clientsWithReadiness.size;

      // 4. Senaste genomförda pass (top 5)
      const { data: recentWorkoutsData } = await supabase
        .from("workout_sessions_log")
        .select(`
          id,
          date,
          status,
          client:clients!workout_sessions_log_client_id_fkey (
            id,
            profile:profiles!clients_profile_id_fkey (
              full_name
            )
          ),
          session:program_sessions!workout_sessions_log_program_session_id_fkey (
            name
          )
        `)
        .in("client_id", clientIds)
        .eq("status", "genomfört")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      const recentWorkouts =
        recentWorkoutsData?.map((w) => {
          const client = normalizeRelation(w.client);
          const session = normalizeRelation(w.session);
          const profile = client ? normalizeRelation(client.profile) : null;
          const sessionName = session?.name || null;
          
          return {
            id: w.id,
            client_name: profile?.full_name || "Okänd klient",
            session_name: sessionName || "Okänt pass",
            date: w.date,
            status: w.status,
          };
        }) || [];

      // Hämta onboarding tasks för coach
      const { data: tasksData } = await supabase
        .from("onboarding_tasks")
        .select("id, key, title, description, order_index, is_active, target_role")
        .eq("target_role", "coach")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      // Hämta task status för coachen
      const { data: taskStatusData } = await supabase
        .from("profile_onboarding_task_status")
        .select("task_id, status, completed_at")
        .eq("profile_id", user.id);

      const taskStatusMap = new Map(
        taskStatusData?.map((ts) => [ts.task_id, ts]) || []
      );

      // Kombinera tasks med status
      const onboardingTasks: OnboardingTask[] = (tasksData || []).map((task) => {
        const status = taskStatusMap.get(task.id);
        return {
          ...task,
          status: status?.status === "completed" ? "completed" : "pending",
          completed_at: status?.completed_at || null,
        };
      });

      // Uppdatera task status baserat på faktisk data
      for (const task of onboardingTasks) {
        if (task.status === "completed") continue;

        let isCompleted = false;

        if (task.key === "create_client") {
          isCompleted = totalClients > 0;
        } else if (task.key === "create_program") {
          const { data: programsData } = await supabase
            .from("training_programs")
            .select("id")
            .eq("created_by_coach_id", user.id)
            .limit(1);
          isCompleted = (programsData?.length || 0) > 0;
        } else if (task.key === "add_sessions") {
          const { data: programsData } = await supabase
            .from("training_programs")
            .select("id")
            .eq("created_by_coach_id", user.id);
          if (programsData && programsData.length > 0) {
            const { data: sessionsData } = await supabase
              .from("program_sessions")
              .select("id")
              .in("program_id", programsData.map((p) => p.id))
              .limit(1);
            isCompleted = (sessionsData?.length || 0) > 0;
          }
        } else if (task.key === "assign_program") {
          if (clientIds.length > 0) {
            const { data: assignmentsData } = await supabase
              .from("client_program_assignments")
              .select("id")
              .in("client_id", clientIds)
              .eq("is_active", true)
              .limit(1);
            isCompleted = (assignmentsData?.length || 0) > 0;
          }
        } else if (task.key === "client_first_workout") {
          isCompleted = recentWorkouts.length > 0;
        }

        // Om task är klar men inte markerad, markera den
        if (isCompleted && task.status === "pending") {
          await supabase
            .from("profile_onboarding_task_status")
            .upsert(
              {
                profile_id: user.id,
                task_id: task.id,
                status: "completed",
                completed_at: new Date().toISOString(),
              },
              { onConflict: "profile_id,task_id" }
            );
          task.status = "completed";
          task.completed_at = new Date().toISOString();
        }
      }

      // Hämta klienter som behöver attention
      const clientsNeedingAttention = {
        lowReadiness: [] as ClientNeedingAttention[],
        notTrainedRecently: [] as ClientNeedingAttention[],
        incompleteWorkouts: [] as ClientNeedingAttention[],
      };

      if (clientIds.length > 0) {
        // 1. Låg readiness idag (energi <=2 eller sömn <=2)
        const { data: lowReadinessData } = await supabase
          .from("daily_readiness")
          .select(`
            client_id,
            energy_level,
            sleep_quality,
            client:clients!daily_readiness_client_id_fkey (
              id,
              profile:profiles!clients_profile_id_fkey (
                full_name
              )
            )
          `)
          .in("client_id", clientIds)
          .eq("date", today)
          .or("energy_level.lte.2,sleep_quality.lte.2");

        if (lowReadinessData) {
          clientsNeedingAttention.lowReadiness = lowReadinessData
            .filter((r) => {
              const client = normalizeRelation(r.client);
              const profile = client ? normalizeRelation(client.profile) : null;
              return profile?.full_name;
            })
            .map((r) => {
              const client = normalizeRelation(r.client);
              const profile = client ? normalizeRelation(client.profile) : null;
              const reasons = [];
              if (r.energy_level && r.energy_level <= 2) {
                reasons.push(`Energi: ${r.energy_level}`);
              }
              if (r.sleep_quality && r.sleep_quality <= 2) {
                reasons.push(`Sömn: ${r.sleep_quality}`);
              }
              return {
                id: r.client_id,
                name: profile?.full_name || "Okänd klient",
                reason: "Låg readiness",
                details: reasons.join(", "),
              };
            });
        }

        // 2. Inte tränat senaste 7 dagarna (men har aktivt program)
        const { data: activeAssignmentsData } = await supabase
          .from("client_program_assignments")
          .select(`
            client_id,
            client:clients!client_program_assignments_client_id_fkey (
              id,
              profile:profiles!clients_profile_id_fkey (
                full_name
              )
            )
          `)
          .in("client_id", clientIds)
          .eq("is_active", true);

        const clientsWithActivePrograms = new Set(
          activeAssignmentsData?.map((a) => a.client_id) || []
        );

        if (clientsWithActivePrograms.size > 0) {
          const { data: recentWorkoutsData } = await supabase
            .from("workout_sessions_log")
            .select("client_id")
            .in("client_id", Array.from(clientsWithActivePrograms))
            .gte("date", sevenDaysAgoStr);

          const clientsTrainedRecently = new Set(
            recentWorkoutsData?.map((w) => w.client_id) || []
          );

          clientsNeedingAttention.notTrainedRecently = Array.from(
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
        }

        // 3. Påbörjat men ej avslutat pass (status påbörjad)
        const { data: incompleteWorkoutsData } = await supabase
          .from("workout_sessions_log")
          .select(`
            id,
            client_id,
            date,
            status,
            client:clients!workout_sessions_log_client_id_fkey (
              id,
              profile:profiles!clients_profile_id_fkey (
                full_name
              )
            ),
            session:program_sessions!workout_sessions_log_program_session_id_fkey (
              name
            )
          `)
          .in("client_id", clientIds)
          .eq("status", "påbörjad")
          .order("date", { ascending: false });

        if (incompleteWorkoutsData) {
          clientsNeedingAttention.incompleteWorkouts = incompleteWorkoutsData
            .filter((w) => {
              const client = normalizeRelation(w.client);
              const profile = Array.isArray(client?.profile) ? client.profile[0] : client?.profile;
              return profile?.full_name;
            })
            .map((w) => {
              const client = normalizeRelation(w.client);
              const profile = client ? normalizeRelation(client.profile) : null;
              const session = normalizeRelation(w.session);
              const sessionName = session?.name || null;
              return {
                id: w.client_id,
                name: profile?.full_name || "Okänd klient",
                reason: "Påbörjat pass ej avslutat",
                details: `${sessionName || "Pass"} - ${new Date(w.date).toLocaleDateString("sv-SE")}`,
                workoutLogId: w.id,
              };
            });
        }
      }

      setStats({
        totalClients,
        clientsTrainedLast7Days,
        clientsWithoutReadinessToday,
        recentWorkouts,
        onboardingTasks,
        clientsNeedingAttention,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.FETCH_FAILED));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <LoadingState 
        title="Dashboard" 
        subtitle="Översikt över dina klienter och aktivitet"
        showHeader={true}
        height="h-64"
      />
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeader title="Dashboard" subtitle="Översikt över dina klienter och aktivitet" />
        <ErrorState 
          title="Kunde inte ladda dashboard" 
          message={error}
          onRetry={fetchDashboardStats}
        />
      </div>
    );
  }

  const incompleteTasks = stats?.onboardingTasks.filter((t) => t.status !== "completed") || [];
  const allCompleted = stats?.onboardingTasks.every((t) => t.status === "completed") || false;

  // Hämta första program ID för navigation
  const getFirstProgramId = async () => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from("training_programs")
      .select("id")
      .eq("created_by_coach_id", user.id)
      .limit(1)
      .single();
    return data?.id || null;
  };

  const getTaskAction = (task: OnboardingTask) => {
    switch (task.key) {
      case "create_client":
        return { label: "Gå till Klienter →", path: "/coach/clients" };
      case "create_program":
        return { label: "Gå till Program →", path: "/coach/programs" };
      case "add_sessions":
        return { label: "Öppna program →", path: null }; // Will be set dynamically
      case "assign_program":
        return { label: "Tilldela program →", path: null }; // Will be set dynamically
      default:
        return null;
    }
  };

  return (
    <div>
      <SectionHeader 
        title="Dashboard" 
        subtitle="Översikt över dina klienter och aktivitet"
      />

      {/* Onboarding Checklista */}
      {!allCompleted && incompleteTasks.length > 0 && (
        <Card className="mb-6 bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle>Kom igång</CardTitle>
            <p className="text-sm text-[#5A6B5D]/70 mt-2">
              Följ dessa steg för att komma igång med JOMOA:
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incompleteTasks.map((task) => {
                const action = getTaskAction(task);
                return (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FEFCF8] flex items-center justify-center mt-0.5 border border-[rgba(232,229,224,0.4)]">
                      <span className="text-xs font-medium text-[#5A6B5D]">{task.order_index}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#5A6B5D]">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-[#5A6B5D]/70 mt-0.5">{task.description}</p>
                      )}
                      {action && (
                        <button
                          onClick={async () => {
                            if (action.path) {
                              router.push(action.path);
                            } else if (task.key === "add_sessions" || task.key === "assign_program") {
                              const programId = await getFirstProgramId();
                              if (programId) {
                                router.push(`/coach/programs/${programId}`);
                              }
                            }
                          }}
                          className="mt-1 text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
                        >
                          {action.label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behöver din attention */}
      {((stats?.clientsNeedingAttention.lowReadiness?.length || 0) > 0 ||
        (stats?.clientsNeedingAttention.notTrainedRecently?.length || 0) > 0 ||
        (stats?.clientsNeedingAttention.incompleteWorkouts?.length || 0) > 0) && (
        <Card className="mb-6 bg-yellow-50/50 border-yellow-200">
          <CardHeader>
            <CardTitle>Behöver din attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Låg readiness */}
              {(stats?.clientsNeedingAttention?.lowReadiness?.length || 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Låg readiness idag ({stats?.clientsNeedingAttention?.lowReadiness?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats?.clientsNeedingAttention?.lowReadiness?.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => router.push(`/coach/clients/${client.id}`)}
                          className="p-2 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] cursor-pointer transition-colors"
                        >
                          <p className="text-sm font-medium text-[#5A6B5D] truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-[#5A6B5D]/70 mt-0.5">
                            {client.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inte tränat nyligen */}
              {(stats?.clientsNeedingAttention?.notTrainedRecently?.length || 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Inte tränat senaste 7 dagarna ({stats?.clientsNeedingAttention?.notTrainedRecently?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats?.clientsNeedingAttention?.notTrainedRecently?.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => router.push(`/coach/clients/${client.id}`)}
                          className="p-2 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] cursor-pointer transition-colors"
                        >
                          <p className="text-sm font-medium text-[#5A6B5D] truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-[#5A6B5D]/70 mt-0.5">
                            {client.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Påbörjat men ej avslutat pass */}
              {(stats?.clientsNeedingAttention?.incompleteWorkouts?.length || 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Påbörjat pass ej avslutat ({stats?.clientsNeedingAttention?.incompleteWorkouts?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats?.clientsNeedingAttention?.incompleteWorkouts?.map((client) => (
                        <div
                          key={`${client.id}-${client.workoutLogId}`}
                          onClick={() => router.push(`/coach/clients/${client.id}`)}
                          className="p-2 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] cursor-pointer transition-colors"
                        >
                          <p className="text-sm font-medium text-[#5A6B5D] truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-[#5A6B5D]/70 mt-0.5">
                            {client.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notiscenter */}
      {notifications && notifications.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#5A6B5D]/70" />
                <CardTitle>Notiscenter</CardTitle>
                {unreadCount > 0 && (
                  <Chip variant="default" className="text-xs px-2 py-0.5">
                    {unreadCount} olästa
                  </Chip>
                )}
              </div>
              <Button
                variant="link"
                onClick={() => router.push("/coach/notifications")}
                className="text-xs text-[#8B6F47] hover:text-[#7A5F3D]"
              >
                Visa alla →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => {
                const getIcon = () => {
                  switch (notification.type) {
                    case "client_workout_logged":
                    case "session_logged":
                      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
                    case "readiness_missing":
                      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
                    case "coach_comment":
                      return <MessageSquare className="h-4 w-4 text-blue-600" />;
                    default:
                      return <Bell className="h-4 w-4 text-gray-600" />;
                  }
                };

                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (notification.link) {
                        router.push(notification.link);
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-card border border-[rgba(232,229,224,0.4)] ${
                      notification.link ? "cursor-pointer hover:bg-[#FEFCF8]/80" : ""
                    } ${!notification.is_read ? "bg-[#FEFCF8]" : "bg-[#FEFCF8]/50"}`}
                  >
                    <div className="flex-shrink-0 mt-1">{getIcon()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#5A6B5D] truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-[#5A6B5D]/70 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#5A6B5D]/60 mt-2">
                        {new Date(notification.created_at).toLocaleDateString("sv-SE", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#8B6F47] mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
            {notifications.length > 5 && (
              <div className="mt-4 pt-4 border-t border-[rgba(232,229,224,0.4)]">
                <Button
                  variant="link"
                  onClick={() => router.push("/coach/notifications")}
                  className="w-full text-sm text-[#8B6F47] hover:text-[#7A5F3D]"
                >
                  Visa alla {notifications.length} notiser →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Antal klienter"
          value={stats?.totalClients || 0}
        />
        <StatCard
          label="Tränat senaste 7 dagarna"
          value={stats?.clientsTrainedLast7Days || 0}
          description={stats && stats.totalClients > 0 ? `av ${stats.totalClients} klienter` : undefined}
        />
        <StatCard
          label="Utan readiness idag"
          value={stats?.clientsWithoutReadinessToday || 0}
          description={stats && stats.totalClients > 0 ? `av ${stats.totalClients} klienter` : undefined}
        />
      </div>

      {/* Senaste genomförda pass */}
      <Card>
        <CardHeader>
          <CardTitle>Senaste genomförda pass</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentWorkouts && stats.recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#5A6B5D]">{workout.client_name}</p>
                    <p className="text-xs text-[#5A6B5D]/70 mt-1">
                      {workout.session_name} • {new Date(workout.date).toLocaleDateString("sv-SE")}
                    </p>
                  </div>
                  <Chip variant="success">Genomfört</Chip>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#5A6B5D]/70">Inga genomförda pass ännu</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
