"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { calculateDailyTarget } from "@/lib/services/nutritionService";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { ReadinessLogging } from "@/components/ui/ReadinessLogging";
import { Button } from "@/components/ui/Button";
import { Check, Lightbulb } from "lucide-react";
import { useTodayTips, markTipAsRead, isTipRead } from "@/hooks/useTips";

interface TrainingProgram {
  id: string;
  name: string;
  description: string | null;
}

interface ProgramSession {
  id: string;
  name: string;
  day_of_week: number;
  focus: string | null;
  exercises: SessionExercise[];
  workoutLog?: WorkoutLog | null;
}

interface WorkoutLog {
  id: string;
  client_id: string;
  program_session_id: string;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number | null;
  reps_planned: number | null;
  rest_seconds: number | null;
  tempo: string | null;
  intensity_type: "none" | "rpe" | "percent";
  intensity_value: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
  };
  setLog?: {
    id: string;
    reps: number | null;
    weight: number | null;
  } | null;
}

interface ProgramAssignment {
  id: string;
  program_id: string;
  start_date: string;
  program: TrainingProgram;
}

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<ProgramAssignment | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Readiness state (read-only på dashboard)
  const [readiness, setReadiness] = useState({
    sleep_quality: "",
    energy_level: "",
    stress_level: "",
    soreness: "",
  });
  const [readinessLoaded, setReadinessLoaded] = useState(false);
  const [readinessDrawerOpen, setReadinessDrawerOpen] = useState(false);
  
  // Cycle state (read-only på dashboard)
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [cycleStatus, setCycleStatus] = useState<{
    cycleDay: number;
    phase: string;
    phaseEnum: string | null;
    periodStartDate: string;
    confidence: number;
    isManual: boolean;
  } | null>(null);
  const [loadingCycleStatus, setLoadingCycleStatus] = useState(false);

  // Client name state
  const [clientName, setClientName] = useState<string | null>(null);

  // Onboarding state
  interface OnboardingTask {
    id: string;
    key: string;
    title: string;
    description: string | null;
    order_index: number;
    status: "completed" | "pending";
    completed_at: string | null;
  }
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  // Tips state
  const currentPhase = cycleStatus?.phaseEnum as "menstruation" | "follicular" | "ovulation" | "luteal" | null;
  const { todayTips, loading: tipsLoading } = useTodayTips(currentPhase);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClientId();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.id && !clientName) {
      fetchClientName();
    }
  }, [user?.id, clientName]);

  useEffect(() => {
    if (clientId) {
      fetchTodayReadiness();
      fetchLatestPeriodStart();
      fetchTodayPhaseAdjustment();
      fetchOnboardingTasks();
    }
  }, [clientId]);

  useEffect(() => {
    if (latestPeriodStart !== null) {
      updateCycleStatus();
    }
  }, [latestPeriodStart, clientId]);

  useEffect(() => {
    if (clientId) {
      fetchActiveProgram();
    }
  }, [clientId]);

  useEffect(() => {
    if (assignment?.program_id && clientId) {
      fetchSessions();
    }
  }, [assignment?.program_id, clientId]);

  const fetchClientName = async () => {
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
  };

  const fetchClientId = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // First, verify user has client role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Kunde inte verifiera användarroll. Försök igen senare.");
        setLoading(false);
        return;
      }

      if (profileData?.role !== "client") {
        console.error("User is not a client, role is:", profileData?.role);
        setError("Du har inte rätt behörighet. Kontakta support.");
        setLoading(false);
        return;
      }

      // Now fetch client record - try without status filter first
      let { data, error: fetchError } = await supabase
        .from("clients")
        .select("id, status")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (fetchError) {
        // Log full error for debugging
        console.error("Error fetching client ID (full error):", {
          error: fetchError,
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          fullError: JSON.stringify(fetchError, null, 2),
        });
        
        // Check if it's a permission error (RLS)
        if (fetchError.code === "42501" || fetchError.message?.includes("permission") || fetchError.message?.includes("policy")) {
          setError("Åtkomst nekad. Kontrollera att RLS policies är korrekt konfigurerade.");
        } else {
          setError("Kunde inte hämta klientinformation. Försök igen senare.");
        }
        setLoading(false);
        return;
      }

      // If no client record found
      if (!data) {
        console.log("No client record found for user:", user.id);
        setClientId(null);
        setLoading(false);
        return;
      }

      // Check if client is active
      if (data.status !== "active") {
        console.log("Client found but status is not active:", data.status);
        setError("Din klientprofil är inte aktiv. Kontakta din coach.");
        setLoading(false);
        return;
      }

      setClientId(data.id);
    } catch (err) {
      console.error("Error fetching client ID:", err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setError("Kunde inte hämta klientinformation. Försök igen senare.");
      setLoading(false);
    }
  };

  const fetchActiveProgram = async () => {
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

      // Fix type: program should be a single object, not array
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
  };

  const fetchSessions = async () => {
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

      if (fetchError) {
        throw fetchError;
      }

      // Normalize data: Supabase returns nested relations as arrays, need to convert to objects
      const sessionsData: ProgramSession[] = (data || []).map((session) => {
        const normalizedExercises: SessionExercise[] = (session.exercises || []).map((ex) => ({
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

      // Hämta workout logs för idag
      const today = new Date().toISOString().split("T")[0];
      const sessionIds = sessionsData.map((s) => s.id);

      if (sessionIds.length > 0) {
        const { data: logsData } = await supabase
          .from("workout_sessions_log")
          .select("*")
          .eq("client_id", clientId)
          .eq("date", today)
          .in("program_session_id", sessionIds);

        sessionsData.forEach((session) => {
          const log = logsData?.find(
            (l) => l.program_session_id === session.id
          );
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
  };

  const fetchTodayReadiness = async () => {
    if (!clientId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
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
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchLatestPeriodStart = async () => {
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

      if (fetchError) {
        // Om det inte finns någon period start är det okej
        if (fetchError.code === "PGRST116") {
          setLatestPeriodStart(null);
          return;
        }
        throw fetchError;
      }

      if (data) {
        setLatestPeriodStart(data.date);
      } else {
        setLatestPeriodStart(null);
      }
    } catch (err) {
      // Tyst hantera - det är okej om ingen period start finns
      setLatestPeriodStart(null);
    }
  };

  const fetchTodayPhaseAdjustment = async () => {
    if (!clientId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("cycle_phases")
        .select("phase")
        .eq("client_id", clientId)
        .eq("date", today)
        .single();

      // Om manuell justering finns, använd den
      if (data) {
        // Phase kommer från updateCycleStatus
      }
    } catch (err) {
      // Ingen manuell justering = okej
    }
  };

  const updateCycleStatus = () => {
    if (!latestPeriodStart) {
      setCycleStatus(null);
      return;
    }

    const today = new Date();
    const periodStart = new Date(latestPeriodStart);
    const diffTime = today.getTime() - periodStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let phase = "";
    let phaseEnum: string | null = null;

    if (diffDays >= 1 && diffDays <= 5) {
      phase = "Mens";
      phaseEnum = "menstruation";
    } else if (diffDays >= 6 && diffDays <= 13) {
      phase = "Follikulär";
      phaseEnum = "follicular";
    } else if (diffDays >= 14 && diffDays <= 16) {
      phase = "Ägglossning";
      phaseEnum = "ovulation";
    } else if (diffDays >= 17 && diffDays <= 28) {
      phase = "Luteal";
      phaseEnum = "luteal";
    } else {
      phase = "Okänd / behöver ny mensstart";
      phaseEnum = null;
    }

    setCycleStatus({
      cycleDay: diffDays,
      phase,
      phaseEnum,
      periodStartDate: latestPeriodStart,
      confidence: 70, // Simplified
      isManual: false, // Simplified
    });
  };

  const fetchOnboardingTasks = async () => {
    if (!user?.id || !clientId) {
      setOnboardingLoaded(true);
      return;
    }

    try {
      // Hämta onboarding tasks för client
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

      // Hämta task status för klienten
      const { data: taskStatusData } = await supabase
        .from("profile_onboarding_task_status")
        .select("task_id, status, completed_at")
        .eq("profile_id", user.id);

      const taskStatusMap = new Map(
        taskStatusData?.map((ts) => [ts.task_id, ts]) || []
      );

      // Kombinera tasks med status
      const tasks: OnboardingTask[] = (tasksData || []).map((task) => {
        const status = taskStatusMap.get(task.id);
        return {
          ...task,
          status: status?.status === "completed" ? "completed" : "pending",
          completed_at: status?.completed_at || null,
        };
      });

      // Uppdatera task status baserat på faktisk data
      for (const task of tasks) {
        if (task.status === "completed") continue;

        let isCompleted = false;

        if (task.key === "log_readiness") {
          // Kontrollera om klienten har loggat readiness
          const { data: readinessData } = await supabase
            .from("daily_readiness")
            .select("id")
            .eq("client_id", clientId)
            .limit(1);
          isCompleted = (readinessData?.length || 0) > 0;
        } else if (task.key === "log_period_start") {
          // Kontrollera om klienten har loggat mensstart
          const { data: periodData } = await supabase
            .from("cycle_events")
            .select("id")
            .eq("client_id", clientId)
            .eq("event_type", "period_start")
            .limit(1);
          isCompleted = (periodData?.length || 0) > 0;
        } else if (task.key === "start_workout") {
          // Kontrollera om klienten har startat ett pass
          const { data: workoutData } = await supabase
            .from("workout_sessions_log")
            .select("id")
            .eq("client_id", clientId)
            .limit(1);
          isCompleted = (workoutData?.length || 0) > 0;
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

      setOnboardingTasks(tasks);

      // Kontrollera om alla tasks är klara
      const allCompleted = tasks.every((t) => t.status === "completed");
      if (allCompleted && tasks.length > 0) {
        // Uppdatera onboarding_stage till 'completed'
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
  };

  const handleStartSession = async (sessionId: string) => {
    if (!clientId) {
      setError("Klient-ID saknas.");
      return;
    }

    setStartingSession(sessionId);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];

      const { error: createError } = await supabase
        .from("workout_sessions_log")
        .insert({
          client_id: clientId,
          program_session_id: sessionId,
          date: today,
          status: "påbörjad",
        });

      if (createError) {
        throw createError;
      }

      await fetchSessions();
      setStartingSession(null);
      router.push(`/client/workouts?session=${sessionId}`);
    } catch (err) {
      console.error("Error starting session:", err);
      setError(getErrorMessage(err) || "Kunde inte starta pass. Försök igen senare.");
      setStartingSession(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <p className="text-[#FEFCF8]/70">Laddar...</p>
      </div>
    );
  }

  if (error && !clientId) {
    return (
      <div className="min-h-screen bg-sage p-6">
        <div className="max-w-[480px] mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-cream">Klient – Dashboard</h1>
          <Card>
            <p className="text-sm text-accent">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // Beräkna dagens pass och readiness-status
  const today = new Date().toISOString().split("T")[0];
  const todaySession = assignment && sessions.length > 0 
    ? sessions.find((s) => s.workoutLog && s.workoutLog.date === today)
    : null;
  const nextSession = assignment && sessions.length > 0
    ? sessions.find((s) => !s.workoutLog || s.workoutLog.date !== today)
    : null;
  const displaySession = todaySession || nextSession || (sessions.length > 0 ? sessions[0] : null);
  const hasReadiness = readiness.energy_level && readiness.sleep_quality;

  // Bestäm primär CTA
  const primaryCTA = displaySession && !todaySession?.workoutLog
    ? { label: "Starta pass", onClick: () => handleStartSession(displaySession.id), disabled: startingSession === displaySession.id }
    : !hasReadiness
    ? { label: "Logga hur du mår", onClick: () => setReadinessDrawerOpen(true), disabled: false }
    : null;

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        {/* Hälsning */}
        <div className="mb-10">
          <h1 className="text-4xl font-the-seasons font-bold text-[#FEFCF8] mb-3 leading-tight">
            Hej {clientName || "där"}! 👋
          </h1>
          <p className="text-sm text-[#FEFCF8]/70">
            Här är din dag i JOMOA
          </p>
        </div>

        {/* Hero card: Dagens fokus */}
        <Card variant="hero">
          <h2 className="text-xl font-the-seasons font-semibold text-[#5A6B5D] mb-5">Dagens fokus</h2>
          
          {primaryCTA ? (
            <div className="space-y-4">
              <p className="text-sm text-[#5A6B5D]/70 leading-relaxed">
                {displaySession && !todaySession?.workoutLog
                  ? `Dagens pass: ${displaySession.name}`
                  : "Logga din readiness för att hjälpa din coach förstå din dagsform."}
              </p>
              <button
                onClick={primaryCTA.onClick}
                disabled={primaryCTA.disabled}
                className="w-full py-4 px-6 bg-[#8B6F47] text-[#FEFCF8] rounded-[20px] font-medium hover:bg-[#7A5F3D] focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 disabled:bg-[#5A6B5D]/40 disabled:cursor-not-allowed transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                {primaryCTA.disabled ? "Bearbetar..." : primaryCTA.label}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#5A6B5D]/70 leading-relaxed">
              {todaySession?.workoutLog?.status === "genomfört"
                ? `Bra jobbat! Du har genomfört ${todaySession.name} idag.`
                : "Allt är klart för idag. Bra jobbat!"}
            </p>
          )}
        </Card>

        {/* Tre små status-cards */}
        <div className="grid grid-cols-1 gap-5">
          {/* Nästa pass */}
          <Card
            onClick={displaySession ? () => router.push(`/client/workouts?session=${displaySession.id}`) : undefined}
            className={displaySession ? "cursor-pointer" : ""}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">Nästa pass</p>
                <p className="text-base font-semibold text-[#5A6B5D] mb-2">
                  {displaySession ? displaySession.name : "Inget pass planerat"}
                </p>
                {displaySession?.workoutLog && (
                  <Chip variant={displaySession.workoutLog.status === "genomfört" ? "success" : "warning"} className="mt-2">
                    {displaySession.workoutLog.status === "genomfört" ? "Genomfört" : "Påbörjad"}
                  </Chip>
                )}
              </div>
              {displaySession && (
                <span className="text-sm text-[#8B6F47] ml-3">→</span>
              )}
            </div>
          </Card>

          {/* Readiness */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">Readiness</p>
                {hasReadiness ? (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${
                              i <= parseInt(readiness.energy_level || "0")
                                ? "bg-[#8B6F47]"
                                : "bg-[rgba(232,229,224,0.6)]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#5A6B5D]/70">Energi: {readiness.energy_level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${
                              i <= parseInt(readiness.sleep_quality || "0")
                                ? "bg-[#8B6F47]"
                                : "bg-[rgba(232,229,224,0.6)]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#5A6B5D]/70">Sömn: {readiness.sleep_quality}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#5A6B5D]/70">Inte ifyllt idag</p>
                )}
              </div>
              <button
                onClick={() => setReadinessDrawerOpen(true)}
                className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline ml-3"
              >
                Uppdatera
              </button>
            </div>
          </Card>

          {/* Cykel */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">Cykel</p>
                {cycleStatus ? (
                  <div className="mt-1">
                    <p className="text-base font-semibold text-[#5A6B5D] mb-1">
                      Dag {cycleStatus.cycleDay} • {cycleStatus.phase}
                    </p>
                    <p className="text-xs text-[#5A6B5D]/70 mt-1">
                      Senaste mensstart: {new Date(cycleStatus.periodStartDate).toLocaleDateString("sv-SE", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#5A6B5D]/70">Ingen cykeldata</p>
                )}
              </div>
              <button
                onClick={() => router.push("/client/cycle")}
                className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline ml-3"
              >
                {cycleStatus ? "Justera" : "Logga"}
              </button>
            </div>
          </Card>
        </div>

        {/* Dagens tips */}
        {!tipsLoading && todayTips.length > 0 && (
          <Card className="bg-amber-50/30 border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <CardTitle>Dagens tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayTips.map((tip) => {
                const isRead = isTipRead(tip.id);
                return (
                  <div
                    key={tip.id}
                    className={`p-4 rounded-card border ${
                      isRead ? "bg-[#FEFCF8]/50 border-[rgba(232,229,224,0.4)]" : "bg-[#FEFCF8] border-amber-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#5A6B5D] mb-1">{tip.title}</h4>
                        <p className="text-xs text-[#5A6B5D]/70 leading-relaxed">{tip.body}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Chip variant="outline" className="text-xs px-2 py-0.5">
                            {tip.category === "training" && "Träning"}
                            {tip.category === "nutrition" && "Kost"}
                            {tip.category === "cycle" && "Cykel"}
                            {tip.category === "mindset" && "Mindset"}
                          </Chip>
                          {tip.phase && (
                            <Chip variant="outline" className="text-xs px-2 py-0.5">
                              {tip.phase === "menstruation" && "Mens"}
                              {tip.phase === "follicular" && "Follikulär"}
                              {tip.phase === "ovulation" && "Ägglossning"}
                              {tip.phase === "luteal" && "Luteal"}
                            </Chip>
                          )}
                        </div>
                      </div>
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markTipAsRead(tip.id)}
                          className="flex-shrink-0 text-xs"
                        >
                          ✓
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              <Button
                variant="link"
                onClick={() => router.push("/client/tips")}
                className="w-full text-xs text-[#8B6F47] hover:text-[#7A5F3D]"
              >
                Visa alla tips →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sekundärt: Aktivt program */}
        {assignment && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">Aktivt program</p>
                <p className="text-base font-semibold text-[#5A6B5D] mb-1">{assignment.program.name}</p>
                <p className="text-xs text-[#5A6B5D]/70 mt-1">
                  Start: {new Date(assignment.start_date).toLocaleDateString("sv-SE")}
                </p>
              </div>
              <button
                onClick={() => router.push("/client/workouts")}
                className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline ml-3"
              >
                Visa program
              </button>
            </div>
          </Card>
        )}

        {/* Onboarding Checklista */}
        {onboardingLoaded && onboardingTasks.length > 0 && !onboardingTasks.every((t) => t.status === "completed") && (
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle>Kom igång</CardTitle>
              <p className="text-sm text-[#5A6B5D]/70 mt-2">
                Följ dessa steg för att komma igång med JOMOA:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onboardingTasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  const getTaskAction = () => {
                    switch (task.key) {
                      case "log_readiness":
                        return { label: "Logga readiness →", onClick: () => setReadinessDrawerOpen(true) };
                      case "log_period_start":
                        return { label: "Logga mensstart →", onClick: () => router.push("/client/insights") };
                      case "start_workout":
                        return displaySession
                          ? { label: "Starta pass →", onClick: () => handleStartSession(displaySession.id) }
                          : null;
                      default:
                        return null;
                    }
                  };

                  const action = getTaskAction();

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-card ${
                        isCompleted ? "bg-[#FEFCF8]/50" : "bg-[#FEFCF8]"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                          isCompleted
                            ? "bg-[#8B6F47] text-[#FEFCF8]"
                            : "bg-[#E8E5E0] text-[#5A6B5D]/40"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{onboardingTasks.indexOf(task) + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? "text-[#5A6B5D]/70 line-through" : "text-[#5A6B5D]"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-[#5A6B5D]/60 mt-1">{task.description}</p>
                        )}
                        {!isCompleted && action && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={action.onClick}
                            className="mt-2"
                          >
                            {action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error/Success messages */}
        {error && (
          <Card>
            <p className="text-sm text-[#8B6F47]">{error}</p>
          </Card>
        )}

        {successMessage && (
          <Card>
            <p className="text-sm text-[#5A6B5D]">{successMessage}</p>
          </Card>
        )}
      </div>

      {/* Readiness Logging Drawer */}
      {clientId && (
        <ReadinessLogging
          clientId={clientId}
          open={readinessDrawerOpen}
          onOpenChange={setReadinessDrawerOpen}
          onSave={() => {
            fetchTodayReadiness();
            setSuccessMessage("Readiness sparad!");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
          initialValues={{
            sleep_quality: readiness.sleep_quality ? parseInt(readiness.sleep_quality) : null,
            energy_level: readiness.energy_level ? parseInt(readiness.energy_level) : null,
            stress_level: readiness.stress_level ? parseInt(readiness.stress_level) : null,
            soreness: readiness.soreness ? parseInt(readiness.soreness) : null,
            notes: null, // TODO: Lägg till notes i readiness state om det behövs
          }}
        />
      )}
    </div>
  );
}
