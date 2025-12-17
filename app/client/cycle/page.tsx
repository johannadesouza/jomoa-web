"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CycleIndicator } from "@/components/ui/CycleIndicator";
import { calculateCyclePhase, getCycleColorClasses, CyclePhase } from "@/lib/utils/cycleColors";
import { Input } from "@/components/ui/Input";
import { Calendar, CalendarDays, TrendingUp } from "lucide-react";

export default function ClientCyclePage() {
  const { user, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [cycleStatus, setCycleStatus] = useState<{
    cycleDay: number;
    phase: string;
    phaseEnum: CyclePhase | null;
    periodStartDate: string;
    confidence: number;
    isManual: boolean;
  } | null>(null);
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentPeriodStarts, setRecentPeriodStarts] = useState<Array<{ date: string }>>([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClientId();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (clientId) {
      fetchLatestPeriodStart();
      fetchRecentPeriodStarts();
    }
  }, [clientId]);

  useEffect(() => {
    if (latestPeriodStart) {
      updateCycleStatus();
    } else {
      setCycleStatus(null);
    }
  }, [latestPeriodStart]);

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
        throw fetchError;
      }

      setClientId(data.id);
    } catch (err) {
      console.error("Error fetching client ID:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta klient-ID. Försök igen senare.");
      setLoading(false);
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

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        setLatestPeriodStart(data.date);
      } else {
        setLatestPeriodStart(null);
      }
    } catch (err) {
      console.error("Error fetching period start:", err);
      setLatestPeriodStart(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPeriodStarts = async () => {
    if (!clientId) return;

    try {
      const { data } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(6);

      const normalizedPeriodStarts: Array<{ date: string }> = (data || []).map((p) => ({
        date: p.date,
      }));
      setRecentPeriodStarts(normalizedPeriodStarts);
    } catch (err) {
      console.error("Error fetching recent period starts:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const updateCycleStatus = async () => {
    if (!latestPeriodStart || !clientId) {
      setCycleStatus(null);
      return;
    }

    // Använd utility-funktion för att beräkna fas
    const { phase, cycleDay } = calculateCyclePhase(latestPeriodStart);
    const phaseLabel = phase ? getCycleColorClasses(phase).label : "Okänd / behöver ny mensstart";

    // Kontrollera om det finns manuell justering för idag
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const { data: manualPhase, error: manualPhaseError } = await supabase
        .from("cycle_phases")
        .select("phase, source")
        .eq("client_id", clientId)
        .eq("date", todayStr)
        .in("source", ["client", "coach"])
        .maybeSingle();

      if (manualPhaseError) {
        throw manualPhaseError;
      }

      let finalPhase: CyclePhase = phase;
      let finalPhaseLabel = phaseLabel;
      let isManual = false;
      let confidence = 70;

      if (manualPhase?.phase && manualPhase.phase !== "unknown") {
        // Validera att manualPhase.phase är en giltig CyclePhase
        if (["menstruation", "follicular", "ovulation", "luteal"].includes(manualPhase.phase)) {
          finalPhase = manualPhase.phase as CyclePhase;
          finalPhaseLabel = getCycleColorClasses(finalPhase).label;
          isManual = true;
          confidence = 100;
        }
      }

      setCycleStatus({
        cycleDay,
        phase: finalPhaseLabel,
        phaseEnum: finalPhase,
        periodStartDate: latestPeriodStart,
        confidence,
        isManual,
      });
    } catch (err) {
      // Om query misslyckas, använd beräknad fas
      console.error("Error checking manual phase adjustment:", err);
      setCycleStatus({
        cycleDay,
        phase: phaseLabel,
        phaseEnum: phase,
        periodStartDate: latestPeriodStart,
        confidence: 70,
        isManual: false,
      });
    }
  };

  const handleLogPeriodStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !periodStartDate) {
      setError("Välj ett datum.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: insertError } = await supabase
        .from("cycle_events")
        .insert({
          client_id: clientId,
          event_type: "period_start",
          date: periodStartDate,
        });

      if (insertError) throw insertError;

      setSuccessMessage("Mensstart loggad!");
      setPeriodStartDate("");
      await fetchLatestPeriodStart();
      await fetchRecentPeriodStarts();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error logging period start:", err);
      setError(getErrorMessage(err) || "Kunde inte logga mensstart. Försök igen senare.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustPhase = async () => {
    if (!clientId || !cycleStatus) return;

    const today = new Date().toISOString().split("T")[0];
    setSaving(true);
    setError(null);

    try {
      // För nu, visa bara ett meddelande
      // I framtiden kan vi lägga till en modal för att välja fas
      alert("Funktion för manuell justering kommer snart. Kontakta din coach för att justera fas.");
    } catch (err) {
      console.error("Error adjusting phase:", err);
      setError(getErrorMessage(err) || "Kunde inte justera fas.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Cykel" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const colorClasses = getCycleColorClasses(cycleStatus?.phaseEnum ?? null);

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader 
          title="Cykel" 
          subtitle="Logga och följ din cykel"
        />

        {error && (
          <Card className="bg-red-50/50 border-red-200">
            <CardContent>
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card className="bg-green-50/50 border-green-200">
            <CardContent>
              <p className="text-sm text-green-600">{successMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Current Cycle Status */}
        <Card>
          <CardHeader>
            <CardTitle>Nuvarande cykel</CardTitle>
          </CardHeader>
          <CardContent>
            {cycleStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CycleIndicator phase={cycleStatus.phaseEnum} />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-[#5A6B5D]">{cycleStatus.phase}</p>
                    <p className="text-sm text-[#5A6B5D]/70">
                      Dag {cycleStatus.cycleDay} av cykeln
                    </p>
                  </div>
                  {cycleStatus.isManual && (
                    <Chip variant="info" className="text-xs">Manuell justering</Chip>
                  )}
                </div>
                <div className="pt-4 border-t border-[rgba(232,229,224,0.4)]">
                  <p className="text-xs text-[#5A6B5D]/70 mb-1">Senaste mensstart</p>
                  <p className="text-sm font-medium text-[#5A6B5D]">
                    {new Date(cycleStatus.periodStartDate).toLocaleDateString("sv-SE")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdjustPhase}
                  className="w-full"
                >
                  Justera fas
                </Button>
              </div>
            ) : (
              <EmptyState
                title="Ingen cykeldata ännu"
                description="Logga din första mensstart för att börja följa din cykel."
              />
            )}
          </CardContent>
        </Card>

        {/* Log Period Start */}
        <Card>
          <CardHeader>
            <CardTitle>Logga mensstart</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogPeriodStart} className="space-y-4">
              <div>
                <label htmlFor="periodStartDate" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                  Datum <span className="text-red-500">*</span>
                </label>
                <Input
                  id="periodStartDate"
                  type="date"
                  value={periodStartDate}
                  onChange={(e) => setPeriodStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Sparar..." : "Logga mensstart"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Period Starts */}
        {recentPeriodStarts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Senaste mensstarter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentPeriodStarts.map((period, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#FEFCF8]/50 rounded-card"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#5A6B5D]/70" />
                      <span className="text-sm text-[#5A6B5D]">
                        {new Date(period.date).toLocaleDateString("sv-SE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {index === 0 && (
                      <Chip variant="info" className="text-xs">Senaste</Chip>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Link to Insights */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5A6B5D]">Se cykel-trender</p>
                <p className="text-xs text-[#5A6B5D]/70 mt-1">
                  Analysera din cykel över tid
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/client/insights"}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Insikter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

