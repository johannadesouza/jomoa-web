"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartCard } from "@/components/ui/ChartCard";
import { StatCard } from "@/components/ui/StatCard";
import { Dumbbell, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ProgramAssignment {
  id: string;
  program_id: string;
  start_date: string;
  program: {
    id: string;
    name: string;
  };
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
  setLogs: Array<{
    id: string;
    exercise_id: string;
    set_number: number;
    reps: number | null;
    weight: number | null;
    exercise: {
      id: string;
      name: string;
    } | null;
  }>;
}

export default function ClientWorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [clientName, setClientName] = useState<string | null>(null);
  const [programAssignment, setProgramAssignment] = useState<ProgramAssignment | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    lastWorkoutDate: null as string | null,
  });
  const [chartData, setChartData] = useState<{
    weeklyFrequency: Array<{ week: string; count: number }>;
    volumeTrend: Array<{ date: string; tonnage: number }>;
  }>({
    weeklyFrequency: [],
    volumeTrend: [],
  });

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClientName();
      fetchProgramAssignment();
      fetchWorkoutLogs();
    }
  }, [user, authLoading, clientId]);

  const fetchClientName = async () => {
    if (!clientId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(
          `
          profile:profiles!clients_profile_id_fkey (
            full_name
          )
        `
        )
        .eq("id", clientId)
        .single();

      if (fetchError) throw fetchError;
      const profile = Array.isArray(data?.profile) ? data.profile[0] : data?.profile;
      setClientName(profile?.full_name || null);
    } catch (err) {
      console.error("Error fetching client name:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchProgramAssignment = async () => {
    if (!clientId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("client_program_assignments")
        .select(
          `
          id,
          program_id,
          start_date,
          program:training_programs (
            id,
            name
          )
        `
        )
        .eq("client_id", clientId)
        .eq("is_active", true)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        const normalizedData: ProgramAssignment = {
          id: data.id,
          program_id: data.program_id,
          start_date: data.start_date,
          program: Array.isArray(data.program) ? data.program[0] : data.program,
        };
        setProgramAssignment(normalizedData);
      }
    } catch (err) {
      console.error("Error fetching program assignment:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchWorkoutLogs = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("workout_sessions_log")
        .select(
          `
          id,
          client_id,
          program_session_id,
          date,
          status,
          session:program_sessions!workout_sessions_log_program_session_id_fkey (
            id,
            name
          ),
          setLogs:workout_set_logs (
            id,
            exercise_id,
            set_number,
            reps,
            weight,
            exercise:exercises!workout_set_logs_exercise_id_fkey (
              id,
              name
            )
          )
        `
        )
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      // Normalize nested relations (Supabase returns arrays)
      const logs: WorkoutLog[] = (data || []).map((log) => {
        const normalizedLog: WorkoutLog = {
          id: log.id,
          client_id: log.client_id,
          program_session_id: log.program_session_id,
          date: log.date,
          status: log.status,
          session: Array.isArray(log.session) ? log.session[0] : log.session || null,
          setLogs: (log.setLogs || []).map((setLog) => ({
            id: setLog.id,
            exercise_id: setLog.exercise_id,
            set_number: setLog.set_number,
            reps: setLog.reps,
            weight: setLog.weight,
            exercise: Array.isArray(setLog.exercise) ? setLog.exercise[0] : setLog.exercise || null,
          })),
        };
        return normalizedLog;
      });
      setWorkoutLogs(logs);

      // Beräkna statistik
      const completed = logs.filter((log) => log.status === "genomfört");
      const lastWorkout = completed.length > 0 ? completed[0].date : null;

      setStats({
        totalWorkouts: logs.length,
        completedWorkouts: completed.length,
        lastWorkoutDate: lastWorkout,
      });

      // Beräkna grafer
      calculateChartData(logs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Kunde inte hämta träningsloggar. Försök igen senare.";
      console.error("Error fetching workout logs:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateChartData = (logs: WorkoutLog[]) => {
    // Beräkna veckofrekvens
    const weeklyFrequencyMap = new Map<string, number>();
    logs.forEach((log) => {
      if (log.status === "genomfört" && log.date) {
        const date = new Date(log.date);
        const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
        weeklyFrequencyMap.set(weekKey, (weeklyFrequencyMap.get(weekKey) || 0) + 1);
      }
    });

    const weeklyFrequency = Array.from(weeklyFrequencyMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // Senaste 12 veckorna

    // Beräkna volymtrend
    const volumeTrendMap = new Map<string, number>();
    logs.forEach((log) => {
      if (log.status === "genomfört" && log.date && log.setLogs) {
        const dateKey = log.date;
        let dayTonnage = 0;
        log.setLogs.forEach((setLog) => {
          if (setLog.weight && setLog.reps) {
            dayTonnage += setLog.weight * setLog.reps;
          }
        });
        if (dayTonnage > 0) {
          volumeTrendMap.set(dateKey, (volumeTrendMap.get(dateKey) || 0) + dayTonnage);
        }
      }
    });

    const volumeTrend = Array.from(volumeTrendMap.entries())
      .map(([date, tonnage]) => ({
        date: new Date(date).toLocaleDateString("sv-SE", { month: "short", day: "numeric" }),
        tonnage: Math.round(tonnage),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Senaste 30 dagarna

    setChartData({ weeklyFrequency, volumeTrend });
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Träning" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Träning ${clientName ? `– ${clientName}` : ""}`}
        subtitle="Träningshistorik, passloggar och statistik"
        breadcrumbs={[
          { label: "Klienter", href: "/coach/clients" },
          { label: clientName || "Klient", href: `/coach/clients/${clientId}` },
          { label: "Träning" },
        ]}
      />

      {error && (
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Totalt pass"
          value={stats.totalWorkouts}
          description="Alla loggade pass"
        />
        <StatCard
          label="Genomförda"
          value={stats.completedWorkouts}
          description="Status: Genomfört"
        />
        <StatCard
          label="Senaste pass"
          value={
            stats.lastWorkoutDate
              ? new Date(stats.lastWorkoutDate).toLocaleDateString("sv-SE")
              : "Inga"
          }
          description="Senaste genomförda pass"
        />
      </div>

      {/* Aktiva program */}
      {programAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Aktivt program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#5A6B5D]">
                {programAssignment.program.name}
              </p>
              <p className="text-xs text-[#5A6B5D]/70">
                Startdatum: {new Date(programAssignment.start_date).toLocaleDateString("sv-SE")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passlogg */}
      <Card>
        <CardHeader>
          <CardTitle>Passlogg</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {workoutLogs.length === 0 ? (
            <EmptyState
              icon={<Dumbbell size={48} />}
              title="Inga passloggar ännu"
              description="När klienten startar och loggar pass kommer de att visas här."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Pass</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Övningar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workoutLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    onClick={() => {
                      // Navigera till passdetaljer om det finns
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString("sv-SE")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-[#5A6B5D]">
                        {log.session?.name || "Okänt pass"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        variant={
                          log.status === "genomfört"
                            ? "success"
                            : log.status === "påbörjad"
                            ? "warning"
                            : "default"
                        }
                      >
                        {log.status === "genomfört"
                          ? "Genomfört"
                          : log.status === "påbörjad"
                          ? "Påbörjad"
                          : log.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]/70">
                        {log.setLogs.length} övningar
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Träningsfrekvens"
          description="Antal pass per vecka"
        >
          {chartData.weeklyFrequency.length === 0 ? (
            <EmptyState
              title="Ingen data ännu"
              description="Grafer kommer att visas här när mer data har samlats in."
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.weeklyFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,229,224,0.4)" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: "#5A6B5D", fontSize: 12 }}
                  stroke="rgba(232,229,224,0.4)"
                />
                <YAxis 
                  tick={{ fill: "#5A6B5D", fontSize: 12 }}
                  stroke="rgba(232,229,224,0.4)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FEFCF8", 
                    border: "1px solid rgba(232,229,224,0.4)",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" fill="#8B6F47" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Volymtrender"
          description="Tonnage (kg) över tid"
        >
          {chartData.volumeTrend.length === 0 ? (
            <EmptyState
              title="Ingen data ännu"
              description="Grafer kommer att visas här när mer data har samlats in."
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.volumeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,229,224,0.4)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#5A6B5D", fontSize: 12 }}
                  stroke="rgba(232,229,224,0.4)"
                />
                <YAxis 
                  tick={{ fill: "#5A6B5D", fontSize: 12 }}
                  stroke="rgba(232,229,224,0.4)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FEFCF8", 
                    border: "1px solid rgba(232,229,224,0.4)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tonnage" 
                  stroke="#8B6F47" 
                  strokeWidth={2}
                  dot={{ fill: "#8B6F47", r: 4 }}
                  name="Tonnage (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

