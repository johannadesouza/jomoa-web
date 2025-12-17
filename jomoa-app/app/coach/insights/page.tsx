"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChartCard } from "@/components/ui/ChartCard";
import { StatCard } from "@/components/ui/StatCard";

export default function CoachInsights() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    completedWorkouts: 0,
    avgCompliance: 0,
  });

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

      // Hämta antal klienter
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, status")
        .eq("primary_coach_id", user.id);

      if (clientsError) throw clientsError;

      const totalClients = clientsData?.length || 0;
      const activeClients = clientsData?.filter((c) => c.status === "active").length || 0;

      // Hämta antal genomförda pass (senaste 30 dagarna)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      const { data: workoutsData } = await supabase
        .from("workout_sessions_log")
        .select("id")
        .eq("status", "genomfört")
        .gte("date", thirtyDaysAgoStr)
        .in(
          "client_id",
          clientsData?.map((c) => c.id) || []
        );

      const completedWorkouts = workoutsData?.length || 0;

      // Beräkna genomsnittlig compliance (förenklad - antal genomförda pass / totala pass)
      const { data: allWorkoutsData } = await supabase
        .from("workout_sessions_log")
        .select("id, status")
        .gte("date", thirtyDaysAgoStr)
        .in(
          "client_id",
          clientsData?.map((c) => c.id) || []
        );

      const totalWorkouts = allWorkoutsData?.length || 0;
      const avgCompliance = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

      setStats({
        totalClients,
        activeClients,
        completedWorkouts,
        avgCompliance,
      });
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta insikter. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Insikter" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Insikter" />
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Insikter"
        subtitle="Översikt och analyser för dina klienter"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Totalt klienter"
          value={stats.totalClients}
          description="Alla klienter"
        />
        <StatCard
          label="Aktiva klienter"
          value={stats.activeClients}
          description="Status: Aktiv"
        />
        <StatCard
          label="Genomförda pass"
          value={stats.completedWorkouts}
          description="Senaste 30 dagarna"
        />
        <StatCard
          label="Genomsnittlig compliance"
          value={`${stats.avgCompliance}%`}
          description="Senaste 30 dagarna"
          trend={
            stats.avgCompliance >= 80
              ? { value: 0, isPositive: true }
              : stats.avgCompliance >= 60
              ? { value: 0, isPositive: false }
              : { value: 0, isPositive: false }
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Träningsaktivitet"
          description="Genomförda pass per vecka"
        >
          <EmptyState
            title="Ingen data ännu"
            description="Grafer kommer att visas här när mer data har samlats in."
          />
        </ChartCard>

        <ChartCard
          title="Klientcompliance"
          description="Andel genomförda pass per klient"
        >
          <EmptyState
            title="Ingen data ännu"
            description="Grafer kommer att visas här när mer data har samlats in."
          />
        </ChartCard>
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insikter och rekommendationer</CardTitle>
          <CardDescription>Baserat på dina klienters aktivitet</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.totalClients === 0 ? (
            <EmptyState
              title="Inga klienter ännu"
              description="När du har klienter kommer insikter och rekommendationer att visas här."
            />
          ) : stats.avgCompliance < 60 ? (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-[20px]">
                <p className="text-sm font-medium text-[#5A6B5D] mb-1">
                  Låg compliance detekterad
                </p>
                <p className="text-xs text-[#5A6B5D]/70">
                  Genomsnittlig compliance är under 60%. Överväg att kontakta klienter med låg träningsaktivitet.
                </p>
              </div>
            </div>
          ) : stats.avgCompliance >= 80 ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50/50 border border-green-200 rounded-[20px]">
                <p className="text-sm font-medium text-[#5A6B5D] mb-1">
                  Utmärkt compliance
                </p>
                <p className="text-xs text-[#5A6B5D]/70">
                  Dina klienter har en genomsnittlig compliance på över 80%. Bra jobbat!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-[20px]">
                <p className="text-sm font-medium text-[#5A6B5D] mb-1">
                  God compliance
                </p>
                <p className="text-xs text-[#5A6B5D]/70">
                  Dina klienter har en genomsnittlig compliance på {stats.avgCompliance}%. Fortsätt så!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

