"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChartCard } from "@/components/ui/ChartCard";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, Activity, Calendar, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from "recharts";

export default function ClientInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [clientName, setClientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    avgRPE: null as number | null,
    compliance: 0,
    readinessAvg: null as number | null,
  });
  const [chartData, setChartData] = useState<{
    volumeWithCycle: Array<{ date: string; tonnage: number; phase: string | null }>;
    readinessTrend: Array<{ date: string; energy: number; sleep: number; stress: number }>;
    performanceByPhase: Array<{ phase: string; avgTonnage: number; count: number }>;
  }>({
    volumeWithCycle: [],
    readinessTrend: [],
    performanceByPhase: [],
  });

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClientName();
      fetchInsights();
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

  const fetchInsights = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Hämta träningsstatistik
      const { data: workoutsData } = await supabase
        .from("workout_sessions_log")
        .select("id, status")
        .eq("client_id", clientId);

      const totalWorkouts = workoutsData?.length || 0;
      const completedWorkouts = workoutsData?.filter((w) => w.status === "genomfört").length || 0;
      const compliance = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

      // Hämta readiness-data (senaste 30 dagarna)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      const { data: readinessData } = await supabase
        .from("daily_readiness")
        .select("energy_level")
        .eq("client_id", clientId)
        .gte("date", thirtyDaysAgoStr);

      const readinessAvg =
        readinessData && readinessData.length > 0
          ? Math.round(
              (readinessData.reduce((sum, r) => sum + (r.energy_level || 0), 0) / readinessData.length) * 10
            ) / 10
          : null;

      setStats({
        totalWorkouts,
        avgRPE: null, // TODO: Beräkna från workout_set_logs om RPE finns
        compliance,
        readinessAvg,
      });

      // Hämta data för grafer
      await fetchChartData();
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta insikter. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    if (!clientId) return;

    try {
      // Hämta workout data med tonnage (senaste 60 dagarna)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split("T")[0];

      const { data: workoutsData } = await supabase
        .from("workout_sessions_log")
        .select(
          `
          id,
          date,
          status,
          setLogs:workout_set_logs (
            weight,
            reps
          )
        `
        )
        .eq("client_id", clientId)
        .eq("status", "genomfört")
        .gte("date", sixtyDaysAgoStr)
        .order("date", { ascending: true });

      // Hämta cycle phases för samma period
      const { data: cyclePhases } = await supabase
        .from("cycle_phases")
        .select("date, phase")
        .eq("client_id", clientId)
        .gte("date", sixtyDaysAgoStr)
        .order("date", { ascending: true });

      // Hämta readiness data
      const { data: readinessData } = await supabase
        .from("daily_readiness")
        .select("date, energy_level, sleep_quality, stress_level")
        .eq("client_id", clientId)
        .gte("date", sixtyDaysAgoStr)
        .order("date", { ascending: true });

      // Beräkna volym med cycle-overlay
      const volumeMap = new Map<string, { tonnage: number; phase: string | null }>();
      const phaseMap = new Map<string, string>();
      
      (cyclePhases || []).forEach((cp) => {
        phaseMap.set(cp.date, cp.phase);
      });

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

      // Readiness trend
      const readinessTrend = (readinessData || []).map((r) => ({
        date: new Date(r.date).toLocaleDateString("sv-SE", { month: "short", day: "numeric" }),
        energy: r.energy_level || 0,
        sleep: r.sleep_quality || 0,
        stress: r.stress_level || 0,
      })).slice(-30);

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
        avgTonnage: Math.round(data.totalTonnage / data.count),
        count: data.count,
      }));

      setChartData({
        volumeWithCycle,
        readinessTrend,
        performanceByPhase,
      });
    } catch (err) {
      console.error("Error fetching chart data:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Insikter" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Insikter ${clientName ? `– ${clientName}` : ""}`}
        subtitle="Djupgående analyser och mönster för klienten"
        breadcrumbs={[
          { label: "Klienter", href: "/coach/clients" },
          { label: clientName || "Klient", href: `/coach/clients/${clientId}` },
          { label: "Insikter" },
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Totalt pass"
          value={stats.totalWorkouts}
          description="Alla loggade pass"
        />
        <StatCard
          label="Compliance"
          value={`${stats.compliance}%`}
          description="Andel genomförda pass"
          trend={
            stats.compliance >= 80
              ? { value: 0, isPositive: true }
              : stats.compliance >= 60
              ? { value: 0, isPositive: false }
              : { value: 0, isPositive: false }
          }
        />
        <StatCard
          label="Genomsnittlig RPE"
          value={stats.avgRPE ? stats.avgRPE.toFixed(1) : "N/A"}
          description="Snitt RPE per pass"
        />
        <StatCard
          label="Readiness (30d)"
          value={stats.readinessAvg ? stats.readinessAvg.toFixed(1) : "N/A"}
          description="Genomsnittlig energi"
        />
      </div>

      {/* Tabs för olika insights */}
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="training">
            <Activity className="h-4 w-4 mr-2" /> Träning
          </TabsTrigger>
          <TabsTrigger value="cycle">
            <Calendar className="h-4 w-4 mr-2" /> Cykel
          </TabsTrigger>
          <TabsTrigger value="readiness">
            <TrendingUp className="h-4 w-4 mr-2" /> Readiness
          </TabsTrigger>
          <TabsTrigger value="correlations">
            <BarChart3 className="h-4 w-4 mr-2" /> Korrelationer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Volymtrender"
              description="Sets, reps och tonnage över tid"
            >
              <EmptyState
                title="Ingen data ännu"
                description="Grafer kommer att visas här när mer träningsdata har samlats in."
              />
            </ChartCard>

            <ChartCard
              title="RPE-genomsnitt"
              description="Genomsnittlig RPE per pass över tid"
            >
              <EmptyState
                title="Ingen data ännu"
                description="Grafer kommer att visas här när RPE-data har loggats."
              />
            </ChartCard>

            <ChartCard
              title="Följsamhet per block"
              description="Andel genomförda pass per träningsblock"
            >
              <EmptyState
                title="Ingen data ännu"
                description="Grafer kommer att visas här när programdata finns tillgänglig."
              />
            </ChartCard>

            <ChartCard
              title="Träningsfrekvens"
              description="Antal pass per vecka"
            >
              <EmptyState
                title="Ingen data ännu"
                description="Grafer kommer att visas här när mer data har samlats in."
              />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="cycle" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Volym med cykel-overlay"
              description="Träningsvolym överlagrat med cykelfaser"
            >
              {chartData.volumeWithCycle.length === 0 ? (
                <EmptyState
                  title="Ingen data ännu"
                  description="Grafer kommer att visas här när både tränings- och cykeldata finns tillgänglig."
                />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData.volumeWithCycle}>
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
                    <Bar dataKey="tonnage" fill="#8B6F47" radius={[8, 8, 0, 0]} name="Tonnage (kg)" />
                    {chartData.volumeWithCycle.some((d) => d.phase) && (
                      <Area
                        type="monotone"
                        dataKey="phase"
                        fill="rgba(139, 111, 71, 0.1)"
                        stroke="rgba(139, 111, 71, 0.3)"
                        name="Cykelfas"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Prestation per fas"
              description="Genomsnittlig tonnage per cykelfas"
            >
              {chartData.performanceByPhase.length === 0 ? (
                <EmptyState
                  title="Ingen data ännu"
                  description="Grafer kommer att visas här när data för olika cykelfaser har samlats in."
                />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.performanceByPhase}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,229,224,0.4)" />
                    <XAxis 
                      dataKey="phase" 
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
                    <Bar dataKey="avgTonnage" fill="#8B6F47" radius={[8, 8, 0, 0]} name="Genomsnittlig tonnage (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="readiness" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Readiness-trend"
              description="Energi, sömn och stress över tid"
            >
              {chartData.readinessTrend.length === 0 ? (
                <EmptyState
                  title="Ingen data ännu"
                  description="Grafer kommer att visas här när readiness-data har loggats."
                />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.readinessTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,229,224,0.4)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: "#5A6B5D", fontSize: 12 }}
                      stroke="rgba(232,229,224,0.4)"
                    />
                    <YAxis 
                      domain={[0, 10]}
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
                      dataKey="energy" 
                      stroke="#8B6F47" 
                      strokeWidth={2}
                      dot={{ fill: "#8B6F47", r: 4 }}
                      name="Energi"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sleep" 
                      stroke="#5A6B5D" 
                      strokeWidth={2}
                      dot={{ fill: "#5A6B5D", r: 4 }}
                      name="Sömn"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stress" 
                      stroke="#D96D46" 
                      strokeWidth={2}
                      dot={{ fill: "#D96D46", r: 4 }}
                      name="Stress"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Readiness vs träning"
              description="Korrelation mellan readiness och träningsprestation"
            >
              <EmptyState
                title="Kommer snart"
                description="Denna graf kommer att visa korrelation mellan readiness och träningsprestation när tillräckligt med data finns."
              />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatiska insikter</CardTitle>
              <CardDescription>Systemgenererade mönster och rekommendationer</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Inga insikter ännu"
                description="När tillräckligt med data har samlats in kommer automatiska insikter att visas här, t.ex. 'Klient dippar konsekvent 2-3 dagar innan mens' eller 'Starkaste prestationer i sena follikulärperioden'."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk för överbelastning</CardTitle>
              <CardDescription>Systemdetekterade varningar</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Inga varningar"
                description="Systemet kommer att varna om risk för överbelastning baserat på träningsvolym, readiness och cykel."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rekommenderad deload</CardTitle>
              <CardDescription>Systemrekommendationer för återhämtning</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Inga rekommendationer ännu"
                description="Systemet kommer att föreslå deload-veckor baserat på träningsvolym, readiness och prestationstrender."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

