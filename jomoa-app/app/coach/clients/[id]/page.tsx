"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

interface Client {
  id: string;
  profile_id: string | null;
  primary_coach_id: string | null;
  date_of_birth: string | null;
  gender: string;
  status: string;
  notes: string | null;
  created_at: string;
  profile: {
    full_name: string | null;
    id: string;
  } | null;
}

interface WorkoutLog {
  id: string;
  client_id: string;
  program_session_id: string;
  date: string;
  status: string;
  session: {
    id: string;
    name: string;
  } | null;
  setLogs: SetLog[];
}

interface SetLog {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  exercise: {
    id: string;
    name: string;
  } | null;
}

interface CycleSymptom {
  id: string;
  client_id: string;
  date: string;
  cramps_severity: number | null;
  bleeding_level: number | null;
  mood: string | null;
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  cravings: string | null;
  other_symptoms: string | null;
  created_at: string;
}

export default function ClientDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [latestWorkoutLog, setLatestWorkoutLog] = useState<WorkoutLog | null>(null);
  const [recentSymptoms, setRecentSymptoms] = useState<CycleSymptom[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [cycleStatus, setCycleStatus] = useState<{
    cycleDay: number;
    phase: string;
    phaseEnum: string | null;
    confidence: number;
    isManual: boolean;
  } | null>(null);
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [manualPhase, setManualPhase] = useState<string | null>(null);
  const [adjustingPhase, setAdjustingPhase] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClient();
      fetchLatestWorkoutLog();
      fetchRecentSymptoms();
      fetchLatestPeriodStart();
      fetchTodayPhaseAdjustment();
    }
  }, [user, authLoading, clientId]);

  // Beräkna cycle status när period start eller manual phase ändras
  useEffect(() => {
    if (latestPeriodStart !== null || manualPhase !== null) {
      updateCycleStatus();
    }
  }, [latestPeriodStart, manualPhase, clientId]);

  const fetchClient = async () => {
    if (!user?.id || !clientId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(`
          id,
          profile_id,
          primary_coach_id,
          date_of_birth,
          gender,
          status,
          notes,
          created_at,
          profile:profiles!clients_profile_id_fkey (
            full_name,
            id
          )
        `)
        .eq("id", clientId)
        .eq("primary_coach_id", user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error("Klienten hittades inte");
      }

              // Normalize profile data (Supabase returns nested relations as arrays)
              const normalizedData = {
                ...data,
                profile: Array.isArray(data.profile) ? data.profile[0] : data.profile,
              };
              const normalizedClient: Client = {
                id: normalizedData.id,
                profile_id: normalizedData.profile_id,
                primary_coach_id: normalizedData.primary_coach_id,
                date_of_birth: normalizedData.date_of_birth,
                gender: normalizedData.gender,
                status: normalizedData.status,
                notes: normalizedData.notes,
                created_at: normalizedData.created_at,
                profile: normalizeRelation(normalizedData.profile),
              };
              setClient(normalizedClient);
    } catch (err) {
      console.error("Error fetching client:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta klient. Försök igen senare.");
      setLoading(false);
    }
  };

  const fetchLatestWorkoutLog = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      // Hämta senaste workout log (påbörjad eller genomfört)
      const { data: workoutLogData, error: workoutLogError } = await supabase
        .from("workout_sessions_log")
        .select(`
          id,
          client_id,
          program_session_id,
          date,
          status,
          session:program_sessions!workout_sessions_log_program_session_id_fkey (
            id,
            name
          )
        `)
        .eq("client_id", clientId)
        .in("status", ["påbörjad", "genomfört"])
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (workoutLogError) {
        // Om ingen logg finns, det är okej
        if (workoutLogError.code === "PGRST116") {
          setLatestWorkoutLog(null);
          setLoading(false);
          return;
        }
        throw workoutLogError;
      }

      if (!workoutLogData) {
        setLatestWorkoutLog(null);
        setLoading(false);
        return;
      }

      // Hämta set logs för denna workout session
      const { data: setLogsData, error: setLogsError } = await supabase
        .from("workout_set_logs")
        .select(`
          id,
          workout_session_log_id,
          exercise_id,
          set_number,
          reps,
          weight,
          exercise:exercises!workout_set_logs_exercise_id_fkey (
            id,
            name
          )
        `)
        .eq("workout_session_log_id", workoutLogData.id)
        .order("set_number", { ascending: true });

      if (setLogsError) {
        throw setLogsError;
      }

      // Normalize session data (Supabase returns nested relations as arrays)
      const normalizedSession = Array.isArray(workoutLogData.session) 
        ? workoutLogData.session[0] 
        : workoutLogData.session;
      
      // Normalize setLogs exercise data
      const normalizedSetLogs = (setLogsData || []).map((setLog) => ({
        id: setLog.id,
        workout_session_log_id: setLog.workout_session_log_id,
        exercise_id: setLog.exercise_id,
        set_number: setLog.set_number,
        reps: setLog.reps,
        weight: setLog.weight,
        exercise: normalizeRelation(setLog.exercise) || { id: "", name: "" },
      }));
      
      setLatestWorkoutLog({
        ...workoutLogData,
        session: normalizedSession,
        setLogs: normalizedSetLogs as unknown as SetLog[],
      } as unknown as WorkoutLog);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching workout log:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta träningslogg. Försök igen senare.");
      setLoading(false);
    }
  };

  const fetchRecentSymptoms = async () => {
    if (!clientId) return;

    try {
      setLoadingSymptoms(true);
      // Hämta senaste 14 dagarnas symptom
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split("T")[0];

      const { data, error: fetchError } = await supabase
        .from("cycle_symptoms")
        .select("*")
        .eq("client_id", clientId)
        .gte("date", fourteenDaysAgoStr)
        .order("date", { ascending: false })
        .limit(14);

      if (fetchError) {
        throw fetchError;
      }

      const normalizedSymptoms: CycleSymptom[] = (data || []).map((symptom) => ({
        id: symptom.id,
        client_id: symptom.client_id,
        date: symptom.date,
        cramps_severity: symptom.cramps_severity,
        bleeding_level: symptom.bleeding_level,
        mood: symptom.mood,
        energy_level: symptom.energy_level,
        sleep_quality: symptom.sleep_quality,
        stress_level: symptom.stress_level,
        cravings: symptom.cravings,
        other_symptoms: symptom.other_symptoms,
        created_at: symptom.created_at,
      }));
      setRecentSymptoms(normalizedSymptoms);
    } catch (err) {
      console.error("Error fetching symptoms:", err);
      // Tyst fel - det är okej om det inte finns symptom
    } finally {
      setLoadingSymptoms(false);
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

  const fetchTodayPhaseAdjustment = async () => {
    if (!clientId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("cycle_phases")
        .select("*")
        .eq("client_id", clientId)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data && (data.source === "client" || data.source === "coach")) {
        setManualPhase(data.phase);
      } else {
        setManualPhase(null);
      }
    } catch (err) {
      console.error("Error fetching phase adjustment:", err);
      setManualPhase(null);
    }
  };

  const calculateConfidence = async (
    periodStartDate: string | null,
    cycleDay: number,
    calculatedPhase: string | null
  ): Promise<number> => {
    if (!periodStartDate || !calculatedPhase) {
      return 0;
    }

    let confidence = 50; // Bas-confidence

    // 1. Antal period_start events
    try {
      const { data: periodEvents } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(6);

      if (periodEvents && periodEvents.length >= 3) {
        confidence += 20;
      } else if (periodEvents && periodEvents.length >= 2) {
        confidence += 10;
      }
    } catch (err) {
      // Ignorera fel
    }

    // 2. Symptom-data som stödjer fasen
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySymptoms } = await supabase
        .from("cycle_symptoms")
        .select("*")
        .eq("client_id", clientId)
        .eq("date", today)
        .single();

      if (todaySymptoms) {
        if (calculatedPhase === "menstruation") {
          if (todaySymptoms.bleeding_level && todaySymptoms.bleeding_level >= 2) {
            confidence += 15;
          }
          if (todaySymptoms.cramps_severity && todaySymptoms.cramps_severity >= 2) {
            confidence += 10;
          }
        } else if (calculatedPhase === "ovulation") {
          if (todaySymptoms.energy_level && todaySymptoms.energy_level >= 4) {
            confidence += 10;
          }
        } else if (calculatedPhase === "luteal") {
          if (todaySymptoms.cravings) {
            confidence += 5;
          }
          if (cycleDay >= 24 && todaySymptoms.energy_level && todaySymptoms.energy_level <= 2) {
            confidence += 10;
          }
        }
      }
    } catch (err) {
      // Ignorera fel
    }

    // 3. Konsistens i cykellängd
    try {
      const { data: periodEvents } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(4);

      if (periodEvents && periodEvents.length >= 3) {
        const cycleLengths: number[] = [];
        for (let i = 0; i < periodEvents.length - 1; i++) {
          const date1 = new Date(periodEvents[i].date);
          const date2 = new Date(periodEvents[i + 1].date);
          const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
          cycleLengths.push(diffDays);
        }

        const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
        if (avgLength >= 25 && avgLength <= 35) {
          const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
          if (variance < 10) {
            confidence += 15;
          }
        }
      }
    } catch (err) {
      // Ignorera fel
    }

    return Math.min(100, Math.max(0, confidence));
  };

  const updateCycleStatus = async () => {
    if (!latestPeriodStart) {
      setCycleStatus(null);
      return;
    }

    try {
      const startDate = new Date(latestPeriodStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const cycleDay = diffDays + 1;

      let phase = "";
      let phaseEnum: string | null = null;
      if (cycleDay >= 1 && cycleDay <= 5) {
        phase = "Mens";
        phaseEnum = "menstruation";
      } else if (cycleDay >= 6 && cycleDay <= 13) {
        phase = "Follikulär";
        phaseEnum = "follicular";
      } else if (cycleDay >= 14 && cycleDay <= 16) {
        phase = "Ägglossning";
        phaseEnum = "ovulation";
      } else if (cycleDay >= 17 && cycleDay <= 28) {
        phase = "Luteal";
        phaseEnum = "luteal";
      } else {
        phase = "Okänd / behöver ny mensstart";
        phaseEnum = null;
      }

      let isManual = false;
      if (manualPhase && manualPhase !== "unknown") {
        const phaseMap: Record<string, { name: string; enum: string }> = {
          menstruation: { name: "Mens", enum: "menstruation" },
          follicular: { name: "Follikulär", enum: "follicular" },
          ovulation: { name: "Ägglossning", enum: "ovulation" },
          luteal: { name: "Luteal", enum: "luteal" },
        };

        if (phaseMap[manualPhase]) {
          phase = phaseMap[manualPhase].name;
          phaseEnum = phaseMap[manualPhase].enum;
          isManual = true;
        }
      }

      const confidence = await calculateConfidence(latestPeriodStart, cycleDay, phaseEnum);

      setCycleStatus({
        cycleDay,
        phase,
        phaseEnum,
        confidence,
        isManual,
      });
    } catch (err) {
      console.error("Error calculating cycle status:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const handleAdjustPhase = async (newPhase: string) => {
    if (!clientId) {
      setError("Klient-ID saknas.");
      return;
    }

    setAdjustingPhase(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const { error: saveError } = await supabase
        .from("cycle_phases")
        .upsert(
          {
            client_id: clientId,
            date: today,
            phase: newPhase,
            source: "coach",
            confidence: null,
          },
          {
            onConflict: "client_id,date",
            ignoreDuplicates: false,
          }
        );

      if (saveError) {
        throw saveError;
      }

      setManualPhase(newPhase);
      await updateCycleStatus();
      setError(null);
    } catch (err) {
      console.error("Error adjusting phase:", err);
      setError(getErrorMessage(err) || "Kunde inte justera fas. Försök igen senare.");
    } finally {
      setAdjustingPhase(false);
    }
  };

  const handleResetPhase = async () => {
    if (!clientId) return;

    setAdjustingPhase(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const { error: deleteError } = await supabase
        .from("cycle_phases")
        .delete()
        .eq("client_id", clientId)
        .eq("date", today)
        .in("source", ["coach", "client"]);

      if (deleteError) {
        throw deleteError;
      }

      setManualPhase(null);
      await updateCycleStatus();
      setError(null);
    } catch (err) {
      console.error("Error resetting phase:", err);
      setError(getErrorMessage(err) || "Kunde inte återställa fas. Försök igen senare.");
    } finally {
      setAdjustingPhase(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Klientdetaljer" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Klientdetaljer" />
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => router.push("/coach/clients")}>
          Tillbaka till klienter
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Klientdetaljer" />
        <EmptyState
          title="Klienten hittades inte"
          action={{
            label: "Tillbaka till klienter",
            onClick: () => router.push("/coach/clients"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={client.profile?.full_name || "Namnlös klient"}
        subtitle="Klientprofil"
        breadcrumbs={[
          { label: "Klienter", href: "/coach/clients" },
          { label: client.profile?.full_name || "Klient" },
        ]}
      />

      {/* Hero Card */}
      <Card variant="hero">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-the-seasons font-semibold text-[#5A6B5D]">
                {client.profile?.full_name || "Namnlös klient"}
              </h2>
              <Chip 
                variant={
                  client.status === "active" 
                    ? "success" 
                    : client.status === "paused" 
                    ? "warning" 
                    : "default"
                }
              >
                {client.status === "active"
                  ? "Aktiv"
                  : client.status === "paused"
                  ? "Pausad"
                  : "Arkiverad"}
              </Chip>
            </div>
            {client.date_of_birth && (
              <p className="text-sm text-[#5A6B5D]/70">
                Födelsedatum: {new Date(client.date_of_birth).toLocaleDateString("sv-SE")}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="training">Träning</TabsTrigger>
          <TabsTrigger value="nutrition">Kost</TabsTrigger>
          <TabsTrigger value="insights">Insikter</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
        </TabsList>

        {/* Översikt Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Senaste pass */}
          <Card>
            <CardHeader>
              <CardTitle>Senaste pass</CardTitle>
            </CardHeader>
            <CardContent>
          {!latestWorkoutLog ? (
            <EmptyState
              title="Inga passloggar ännu"
              description="När klienten startar och loggar pass kommer de att visas här. Se till att klienten har ett tilldelat program med pass, och be dem logga in och starta sitt första pass."
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-[#5A6B5D] mb-2">
                  {latestWorkoutLog.session?.name || "Pass"}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Chip 
                    variant={
                      latestWorkoutLog.status === "genomfört" 
                        ? "success" 
                        : latestWorkoutLog.status === "påbörjad" 
                        ? "warning" 
                        : "default"
                    }
                  >
                    {latestWorkoutLog.status === "genomfört"
                      ? "Genomfört"
                      : latestWorkoutLog.status === "påbörjad"
                      ? "Påbörjad"
                      : latestWorkoutLog.status}
                  </Chip>
                  <span className="text-sm text-[#5A6B5D]/70">
                    {new Date(latestWorkoutLog.date).toLocaleDateString("sv-SE")}
                  </span>
                </div>
              </div>

              {latestWorkoutLog.setLogs.length === 0 ? (
                <EmptyState
                  title="Inga set-loggar ännu"
                  description="När klienten loggar reps och vikt för övningarna kommer de att visas här."
                />
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#5A6B5D]">
                    Loggade övningar:
                  </h4>
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Övning</TableHead>
                            <TableHead>Set</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Vikt (kg)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {latestWorkoutLog.setLogs.map((setLog) => (
                            <TableRow key={setLog.id}>
                              <TableCell className="text-[#5A6B5D]">
                                {setLog.exercise?.name || "Okänd övning"}
                              </TableCell>
                              <TableCell className="text-[#5A6B5D]/70">
                                Set {setLog.set_number}
                              </TableCell>
                              <TableCell className="text-[#5A6B5D]/70">
                                {setLog.reps || "-"}
                              </TableCell>
                              <TableCell className="text-[#5A6B5D]/70">
                                {setLog.weight || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
            </CardContent>
          </Card>

          {/* Cycle Status & Phase Adjustment */}
          {cycleStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Cykelstatus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A6B5D]/70">Cykeldag:</span>
                    <span className="text-sm font-medium text-[#5A6B5D]">
                      {cycleStatus.cycleDay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A6B5D]/70">Fas:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#5A6B5D]">{cycleStatus.phase}</span>
                      {cycleStatus.isManual && (
                        <Chip variant="info">Justerad</Chip>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5A6B5D]/70">Tillförlitlighet:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[rgba(232,229,224,0.4)] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            cycleStatus.confidence >= 70
                              ? "bg-green-500"
                              : cycleStatus.confidence >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${cycleStatus.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#5A6B5D]">
                        {cycleStatus.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phase Adjustment */}
                <div className="pt-4 border-t border-[rgba(232,229,224,0.4)]">
                  <h3 className="text-sm font-medium text-[#5A6B5D] mb-3">
                    {cycleStatus.isManual ? "Fas justerad manuellt" : "Justera fas"}
                  </h3>
                  {cycleStatus.isManual ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[#5A6B5D]/70">
                        Du har justerat fasen manuellt. Den beräknade fasen är {cycleStatus.phase}.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetPhase}
                        disabled={adjustingPhase}
                      >
                        {adjustingPhase ? "Återställer..." : "Återställ till beräknad fas"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[#5A6B5D]/70">
                        Om den beräknade fasen inte stämmer kan du justera den manuellt.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustPhase("menstruation")}
                          disabled={adjustingPhase}
                          className="bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-300"
                        >
                          Mens
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustPhase("follicular")}
                          disabled={adjustingPhase}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                        >
                          Follikulär
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustPhase("ovulation")}
                          disabled={adjustingPhase}
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                        >
                          Ägglossning
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustPhase("luteal")}
                          disabled={adjustingPhase}
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300"
                        >
                          Luteal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Träning Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Träningsdata</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => router.push(`/coach/clients/${clientId}/workouts`)}
              >
                Öppna träningsöversikt →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kost Tab */}
        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>Kostplan</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => router.push(`/coach/clients/${clientId}/nutrition`)}
              >
                Öppna kostplan editor →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insikter Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Insikter</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => router.push(`/coach/clients/${clientId}/insights`)}
              >
                Öppna insikter →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="checkins">
          <Card>
            <CardHeader>
              <CardTitle>Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => router.push(`/coach/clients/${clientId}/checkins`)}
              >
                Visa alla check-ins →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

