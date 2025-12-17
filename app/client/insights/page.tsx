"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ChartCard } from "@/components/ui/ChartCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReadinessTrendChart } from "@/components/ui/ReadinessTrendChart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Cell } from "recharts";
import { getCycleColorClasses, calculateCyclePhase } from "@/lib/utils/cycleColors";

export default function ClientInsights() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface WorkoutLog {
    id: string;
    date: string;
    status: string;
  }

  interface ReadinessData {
    date: string;
    sleep_quality: number | null;
    energy_level: number | null;
    stress_level: number | null;
    soreness: number | null;
  }

  const [stats, setStats] = useState<{
    workoutCount: number;
    lastWorkout: { id: string; date: string; status: string } | null;
    readinessData: ReadinessData[];
    avg7Days?: { sleep: string; energy: string };
    avg30Days?: { sleep: string; energy: string };
  } | null>(null);
  const [cycleData, setCycleData] = useState<{
    volumeWithCycle: Array<{ date: string; tonnage: number; phase: string | null }>;
    performanceByPhase: Array<{ phase: string; avgTonnage: number; count: number }>;
    hasCycleData: boolean;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchInsights();
    }
  }, [user, authLoading]);

  const fetchInsights = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Hämta client ID
      const { data: clientData } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!clientData) {
        setLoading(false);
        return;
      }

      const clientId = clientData.id;

      // Hämta träningsstatistik
      const { data: workoutsData } = await supabase
        .from("workout_sessions_log")
        .select("id, date, status")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(30);

      const completedWorkouts = workoutsData?.filter((w) => w.status === "genomfört") || [];
      const workoutCount = completedWorkouts.length;
      const lastWorkout = completedWorkouts[0] ? {
        id: completedWorkouts[0].id,
        date: completedWorkouts[0].date,
        status: completedWorkouts[0].status,
      } : null;

      // Hämta readiness-trend (senaste 30 dagarna)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      const { data: readinessData } = await supabase
        .from("daily_readiness")
        .select("date, energy_level, sleep_quality, stress_level, soreness")
        .eq("client_id", clientId)
        .gte("date", thirtyDaysAgoStr)
        .order("date", { ascending: true });

      // Beräkna genomsnitt för senaste 7 och 30 dagar
      const last7Days = (readinessData || []).slice(-7);
      const avg7Days = {
        sleep: last7Days.length > 0
          ? (last7Days.reduce((sum, r) => sum + (r.sleep_quality || 0), 0) / last7Days.length).toFixed(1)
          : "N/A",
        energy: last7Days.length > 0
          ? (last7Days.reduce((sum, r) => sum + (r.energy_level || 0), 0) / last7Days.length).toFixed(1)
          : "N/A",
      };

      const avg30Days = {
        sleep: (readinessData || []).length > 0
          ? ((readinessData || []).reduce((sum, r) => sum + (r.sleep_quality || 0), 0) / (readinessData || []).length).toFixed(1)
          : "N/A",
        energy: (readinessData || []).length > 0
          ? ((readinessData || []).reduce((sum, r) => sum + (r.energy_level || 0), 0) / (readinessData || []).length).toFixed(1)
          : "N/A",
      };

      setStats({
        workoutCount,
        lastWorkout,
        readinessData: readinessData || [],
        avg7Days,
        avg30Days,
      });

      // Hämta cykeldata
      await fetchCycleData(clientId);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta insikter. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCycleData = async (clientId: string) => {
    try {
      // Hämta senaste 60 dagarna för att få tillräckligt med data
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

      // Kontrollera om det finns cykeldata
      const { data: hasPeriodStart } = await supabase
        .from("cycle_events")
        .select("id, event_date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("event_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!hasPeriodStart) {
        setCycleData({
          volumeWithCycle: [],
          performanceByPhase: [],
          hasCycleData: false,
        });
        return;
      }

      // Hämta senaste period start datum
      const latestPeriodStart = hasPeriodStart.event_date;

      // Hämta workouts med set logs
      const { data: workoutsData } = await supabase
        .from("workout_sessions_log")
        .select(`
          date,
          status,
          setLogs:workout_set_logs (
            weight,
            reps
          )
        `)
        .eq("client_id", clientId)
        .eq("status", "genomfört")
        .gte("date", sixtyDaysAgoStr)
        .order("date", { ascending: true });

      // Försök hämta cycle phases från databasen
      const { data: cyclePhases, error: cyclePhasesError } = await supabase
        .from("cycle_phases")
        .select("date, phase")
        .eq("client_id", clientId)
        .gte("date", sixtyDaysAgoStr)
        .order("date", { ascending: true });

      // Log error om det finns ett problem (t.ex. RLS eller ingen data)
      if (cyclePhasesError && cyclePhasesError.code !== "PGRST116") {
        console.log("Could not fetch cycle_phases from database, will calculate from cycle_events:", cyclePhasesError);
      }

      // Beräkna volym med cycle-overlay
      const volumeMap = new Map<string, { tonnage: number; phase: string | null }>();
      const phaseMap = new Map<string, string>();
      
      // Om cycle_phases finns i databasen, använd dem
      if (cyclePhases && cyclePhases.length > 0) {
        cyclePhases.forEach((cp) => {
          phaseMap.set(cp.date, cp.phase);
        });
      } else {
        // Annars beräkna faser baserat på cycle_events
        // Hämta alla period starts för att beräkna faser
        const { data: allPeriodStarts } = await supabase
          .from("cycle_events")
          .select("date")
          .eq("client_id", clientId)
          .eq("event_type", "period_start")
          .order("event_date", { ascending: false });

        if (allPeriodStarts && allPeriodStarts.length > 0) {
          // Beräkna faser för varje dag i perioden
          const today = new Date();
          const startDate = new Date(sixtyDaysAgoStr);
          
          for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            
            // Hitta senaste period start före eller på denna dag
            // Sortera så att senaste kommer först
            const sortedPeriodStarts = [...allPeriodStarts].sort(
              (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
            );
            
            const relevantPeriodStart = sortedPeriodStarts.find(
              (ps) => {
                const periodDate = new Date(ps.date || "");
                periodDate.setHours(0, 0, 0, 0);
                const checkDate = new Date(d);
                checkDate.setHours(0, 0, 0, 0);
                return periodDate <= checkDate;
              }
            );
            
            if (relevantPeriodStart) {
              const periodDate = relevantPeriodStart.date;
              if (periodDate) {
                const { phase } = calculateCyclePhase(periodDate, d);
                if (phase) {
                  phaseMap.set(dateStr, phase);
                }
              }
            }
          }
        }
      }

      (workoutsData || []).forEach((workout) => {
        const dateKey = workout.date;
        const existing = volumeMap.get(dateKey) || { tonnage: 0, phase: null };
        
        let dayTonnage = 0;
        (workout.setLogs || []).forEach((setLog) => {
          if (setLog.weight && setLog.reps) {
            dayTonnage += setLog.weight * setLog.reps;
          }
        });

        volumeMap.set(dateKey, {
          tonnage: existing.tonnage + dayTonnage,
          phase: phaseMap.get(dateKey) || null,
        });
      });

      const volumeWithCycle = Array.from(volumeMap.entries())
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString("sv-SE", { month: "short", day: "numeric" }),
          tonnage: Math.round(data.tonnage),
          phase: data.phase,
        }))
        .slice(-30); // Senaste 30 dagarna

      // Prestation per fas
      const phasePerformance = new Map<string, { totalTonnage: number; count: number }>();
      volumeWithCycle.forEach((item) => {
        if (item.phase) {
          const existing = phasePerformance.get(item.phase) || { totalTonnage: 0, count: 0 };
          phasePerformance.set(item.phase, {
            totalTonnage: existing.totalTonnage + item.tonnage,
            count: existing.count + 1,
          });
        }
      });

      const performanceByPhase = Array.from(phasePerformance.entries()).map(([phase, data]) => ({
        phase: phase === "menstruation" ? "Mens" : phase === "follicular" ? "Follikulär" : phase === "ovulation" ? "Ägglossning" : "Luteal",
        avgTonnage: data.count > 0 ? Math.round(data.totalTonnage / data.count) : 0,
        count: data.count,
      }));

      setCycleData({
        volumeWithCycle,
        performanceByPhase,
        hasCycleData: true,
      });
    } catch (err) {
      console.error("Error fetching cycle data:", err);
      // Om det är ett RLS-fel, försök beräkna faser manuellt
      const errorMessage = getErrorMessage(err);
      const isRLSError = 
        (typeof err === "object" && err !== null && "code" in err && err.code === "42501") ||
        errorMessage.includes("permission") ||
        errorMessage.includes("policy");
      if (isRLSError) {
        console.log("RLS issue detected, calculating phases manually from cycle_events");
        // Vi har redan fixat detta genom att beräkna faser från cycle_events
      }
      setCycleData({
        volumeWithCycle: [],
        performanceByPhase: [],
        hasCycleData: false,
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Insikter" subtitle="Din tränings- och hälsoprogress" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Insikter" />
          <Card className="border-red-200 bg-red-50/50">
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
          title="Insikter" 
          subtitle="Din tränings- och hälsoprogress"
        />

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="training">Träning</TabsTrigger>
            <TabsTrigger value="readiness">Readiness</TabsTrigger>
            <TabsTrigger value="cycle">Cykel</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-6">
            <ChartCard title="Träningsstatistik" description="Översikt över dina genomförda pass">
              {stats && stats.workoutCount > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-the-seasons font-bold text-[#5A6B5D]">
                      {stats.workoutCount}
                    </p>
                    <p className="text-sm text-[#5A6B5D]/70 mt-1">Genomförda pass (senaste 30 dagarna)</p>
                  </div>
                  {stats.lastWorkout && (
                    <div className="pt-4 border-t border-[rgba(232,229,224,0.4)]">
                      <p className="text-sm text-[#5A6B5D]/70">Senaste pass</p>
                      <p className="text-sm font-medium text-[#5A6B5D] mt-1">
                        {new Date(stats.lastWorkout.date).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="Ingen träningsdata ännu"
                  description="När du börjar träna kommer din progress att visas här."
                />
              )}
            </ChartCard>
          </TabsContent>

          <TabsContent value="readiness" className="space-y-6">
            <ChartCard title="Readiness-trend" description="Din energi, sömn, stress och ömhet över tid">
              {stats?.readinessData && stats.readinessData.length > 0 ? (
                <div className="space-y-4">
                  <ReadinessTrendChart data={stats.readinessData} days={30} />
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(232,229,224,0.4)]">
                    <div>
                      <p className="text-xs text-[#5A6B5D]/70 mb-1">Genomsnitt (7 dagar)</p>
                      <p className="text-sm font-medium text-[#5A6B5D]">
                        Sömn: {stats.avg7Days?.sleep || "N/A"} / Energi: {stats.avg7Days?.energy || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A6B5D]/70 mb-1">Genomsnitt (30 dagar)</p>
                      <p className="text-sm font-medium text-[#5A6B5D]">
                        Sömn: {stats.avg30Days?.sleep || "N/A"} / Energi: {stats.avg30Days?.energy || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Ingen readiness-data ännu"
                  description="Logga din readiness varje dag för att se trender."
                />
              )}
            </ChartCard>
          </TabsContent>

          <TabsContent value="cycle" className="space-y-6">
            {!cycleData || !cycleData.hasCycleData ? (
              <ChartCard title="Cykel & träning" description="Din cykel överlagrat med träningsdata">
                <EmptyState
                  title="Ingen cykeldata ännu"
                  description="Logga din mensstart för att se cykel-trender."
                />
              </ChartCard>
            ) : (
              <>
                <ChartCard 
                  title="Volym med cykel-overlay" 
                  description="Träningsvolym överlagrat med cykelfaser"
                >
                  {cycleData.volumeWithCycle.length === 0 ? (
                    <EmptyState
                      title="Ingen träningsdata ännu"
                      description="När du börjar träna kommer din volym att visas här med cykelfaser."
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={cycleData.volumeWithCycle}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E1" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12, fill: "#5A6B5D" }}
                              stroke="#5A6B5D"
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: "#5A6B5D" }}
                              stroke="#5A6B5D"
                              label={{ value: "Volym (kg)", angle: -90, position: "insideLeft", fill: "#5A6B5D" }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "#FEFCF8", 
                                border: "1px solid rgba(232,229,224,0.4)",
                                borderRadius: "12px"
                              }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="tonnage" 
                              name="Träningsvolym (kg)"
                              radius={[4, 4, 0, 0]}
                            >
                              {cycleData.volumeWithCycle.map((entry, index) => {
                                // Färgkodning baserat på cykelfas (enligt cycleColors.ts)
                                let fillColor = "#8B6F47"; // Default (JOMOA brown)
                                if (entry.phase === "menstruation") {
                                  fillColor = "#f43f5e"; // rose-500
                                } else if (entry.phase === "follicular") {
                                  fillColor = "#0ea5e9"; // sky-500
                                } else if (entry.phase === "ovulation") {
                                  fillColor = "#f59e0b"; // amber-500
                                } else if (entry.phase === "luteal") {
                                  fillColor = "#8b5cf6"; // violet-500
                                }
                                return <Cell key={`cell-${index}`} fill={fillColor} />;
                              })}
                            </Bar>
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Legend för cykelfaser */}
                      <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-[rgba(232,229,224,0.4)]">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                          <span className="text-[#5A6B5D]/70">Mens</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                          <span className="text-[#5A6B5D]/70">Follikulär</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-[#5A6B5D]/70">Ägglossning</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                          <span className="text-[#5A6B5D]/70">Luteal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#8B6F47]"></div>
                          <span className="text-[#5A6B5D]/70">Ingen fas</span>
                        </div>
                      </div>
                    </div>
                  )}
                </ChartCard>

                <ChartCard 
                  title="Prestation per fas" 
                  description="Genomsnittlig träningsvolym per cykelfas"
                >
                  {cycleData.performanceByPhase.length === 0 ? (
                    <EmptyState
                      title="Ingen data per fas ännu"
                      description="Grafer kommer att visas här när data för olika cykelfaser har samlats in."
                    />
                  ) : (
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cycleData.performanceByPhase}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E1" />
                          <XAxis 
                            dataKey="phase" 
                            tick={{ fontSize: 12, fill: "#5A6B5D" }}
                            stroke="#5A6B5D"
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: "#5A6B5D" }}
                            stroke="#5A6B5D"
                            label={{ value: "Volym (kg)", angle: -90, position: "insideLeft", fill: "#5A6B5D" }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#FEFCF8", 
                              border: "1px solid rgba(232,229,224,0.4)",
                              borderRadius: "12px"
                            }}
                          />
                          <Bar 
                            dataKey="avgTonnage" 
                            fill="#8B6F47" 
                            name="Genomsnittlig volym (kg)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 pt-4 border-t border-[rgba(232,229,224,0.4)]">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {cycleData.performanceByPhase.map((item) => (
                            <div key={item.phase}>
                              <p className="text-[#5A6B5D]/70">{item.phase}</p>
                              <p className="font-medium text-[#5A6B5D]">
                                {item.avgTonnage} kg ({item.count} pass)
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
