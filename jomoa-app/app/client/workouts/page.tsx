"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CycleIndicator } from "@/components/ui/CycleIndicator";
import { calculateCyclePhase, getCycleColorClasses } from "@/lib/utils/cycleColors";

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
  status: string;
  date: string;
  program_session_id: string;
}

interface SessionExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number | null;
  reps_planned: number | null;
  exercise: {
    id: string;
    name: string;
  } | null;
}

interface ProgramAssignment {
  id: string;
  program_id: string;
  start_date: string;
  program: TrainingProgram;
}

export default function ClientWorkouts() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<ProgramAssignment | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClientId();
    }
  }, [user, authLoading]);

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

  useEffect(() => {
    if (clientId) {
      fetchLatestPeriodStart();
    }
  }, [clientId]);

  const fetchClientId = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setClientId(null);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      setClientId(data?.id || null);
    } catch (err) {
      console.error("Error fetching client:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta klientinformation.");
      setLoading(false);
    }
  };

  const fetchActiveProgram = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
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

      // Normalize program data (Supabase returns nested relations as arrays)
      const normalizedData = {
        ...data,
        program: Array.isArray(data.program) ? data.program[0] : data.program,
      };
      setAssignment(normalizedData as ProgramAssignment);
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
            exercise_id,
            order_index,
            sets_planned,
            reps_planned,
            rest_seconds,
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
      interface SessionExercise {
        id: string;
        exercise_id: string;
        order_index: number;
        sets_planned: number | null;
        reps_planned: number | null;
        exercise?: {
          id: string;
          name: string;
        } | null;
      }

      interface SessionData {
        id: string;
        name: string;
        day_of_week: number;
        exercises: SessionExercise[];
        workoutLog?: WorkoutLog | null;
      }

      const sessionsData: SessionData[] = (data || []).map((session) => {
        const normalizedExercises: SessionExercise[] = (session.exercises || []).map((ex) => ({
          id: ex.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          sets_planned: ex.sets_planned,
          reps_planned: ex.reps_planned,
          rest_seconds: ex.rest_seconds,
          exercise: Array.isArray(ex.exercise) ? ex.exercise[0] : ex.exercise,
        }));
        return {
          id: session.id,
          name: session.name,
          day_of_week: session.day_of_week,
          focus: session.focus,
          exercises: normalizedExercises,
        };
      }) as unknown as ProgramSession[];

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

      setSessions(sessionsData as unknown as ProgramSession[]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta pass. Försök igen senare.");
      setLoading(false);
    }
  };

  const fetchLatestPeriodStart = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setLatestPeriodStart(data?.date || null);
    } catch (err) {
      console.error("Error fetching period start:", err);
      setLatestPeriodStart(null);
    }
  };

  const handleStartSession = (sessionId: string) => {
    router.push(`/client/workouts/${sessionId}`);
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
    return days[dayOfWeek] || `Dag ${dayOfWeek}`;
  };

  // Beräkna vilken dag passet kommer att vara (baserat på program start + vecka + dag)
  const calculateSessionDate = (session: ProgramSession): Date | null => {
    if (!assignment?.start_date) return null;

    const startDate = new Date(assignment.start_date);
    // För nu, anta att det är vecka 1 (kan förbättras senare)
    const weekNumber = 1;
    const daysToAdd = (weekNumber - 1) * 7 + (session.day_of_week - 1);
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + daysToAdd);
    return sessionDate;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
          <SectionHeader title="Träning" subtitle="Dina träningsprogram och pass" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
          <SectionHeader title="Träning" subtitle="Dina träningsprogram och pass" />
          <Card className="bg-red-50/50 border-red-200">
            <CardContent>
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader 
          title="Träning" 
          subtitle="Dina träningsprogram och pass"
        />

        {!assignment ? (
          <EmptyState
            title="Inga träningsprogram ännu"
            description="Din coach kommer att tilldela dig ett träningsprogram snart."
          />
        ) : (
          <>
            {/* Program Info */}
            <Card variant="hero">
              <CardHeader>
                <CardTitle>{assignment.program.name}</CardTitle>
                {assignment.program.description && (
                  <p className="text-sm text-[#5A6B5D]/70 mt-1">
                    {assignment.program.description}
                  </p>
                )}
              </CardHeader>
            </Card>

            {/* Sessions */}
            {sessions.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState
                    title="Inga pass i programmet"
                    description="Ditt program innehåller inga pass ännu."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  // Beräkna cykelfas för detta pass
                  const sessionDate = calculateSessionDate(session);
                  const cyclePhase = sessionDate && latestPeriodStart
                    ? calculateCyclePhase(latestPeriodStart, sessionDate).phase
                    : null;
                  const cycleColors = getCycleColorClasses(cyclePhase);

                  return (
                    <Card
                      key={session.id}
                      className={`relative ${cyclePhase ? `border-l-4 ${cycleColors.border}` : ""}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle>{session.name}</CardTitle>
                              {cyclePhase && (
                                <CycleIndicator phase={cyclePhase} size="sm" showLabel={false} />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-[#5A6B5D]/70">
                                {getDayName(session.day_of_week)}
                                {session.focus && ` • ${session.focus}`}
                              </p>
                              {cyclePhase && (
                                <CycleIndicator phase={cyclePhase} size="sm" showDot={false} />
                              )}
                            </div>
                          </div>
                          {session.workoutLog && (
                            <Chip
                              variant={session.workoutLog.status === "genomfört" ? "success" : "warning"}
                            >
                              {session.workoutLog.status === "genomfört" ? "Genomfört" : "Påbörjad"}
                            </Chip>
                          )}
                        </div>
                      </CardHeader>
                    <CardContent>
                      {session.exercises.length === 0 ? (
                        <p className="text-sm text-[#5A6B5D]/70">Inga övningar i detta pass.</p>
                      ) : (
                        <>
                          <div className="mb-4">
                            <p className="text-xs font-medium text-[#5A6B5D]/70 mb-2 uppercase tracking-wide">
                              Övningar ({session.exercises.length})
                            </p>
                            <div className="space-y-2">
                              {session.exercises.slice(0, 3).map((exercise) => (
                                <div key={exercise.id} className="text-sm text-[#5A6B5D]">
                                  • {exercise.exercise?.name || "Okänd övning"}
                                  {exercise.sets_planned && exercise.reps_planned && (
                                    <span className="text-[#5A6B5D]/70 ml-2">
                                      ({exercise.sets_planned}x{exercise.reps_planned})
                                    </span>
                                  )}
                                </div>
                              ))}
                              {session.exercises.length > 3 && (
                                <p className="text-xs text-[#5A6B5D]/70">
                                  + {session.exercises.length - 3} fler övningar
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleStartSession(session.id)}
                            className="w-full"
                          >
                            {session.workoutLog ? "Fortsätt pass" : "Starta pass"}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
