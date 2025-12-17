"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTips, markTipAsRead, isTipRead, Tip } from "@/hooks/useTips";
import { CyclePhase, calculateCyclePhase, getCycleColorClasses } from "@/lib/utils/cycleColors";
import { Lightbulb, Filter } from "lucide-react";
import { Select } from "@/components/ui/Select";

export default function ClientTips() {
  const { user, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<Tip["category"] | "all">("all");
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch client ID
  useEffect(() => {
    if (!authLoading && user?.id) {
      const fetchClientId = async () => {
        try {
          setFetchError(null);
          const { data, error } = await supabase
            .from("clients")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching client ID:", error);
            setFetchError("Kunde inte hämta klient-ID.");
            return;
          }
          
          if (data?.id) {
            setClientId(data.id);
          }
        } catch (err) {
          console.error("Unexpected error fetching client ID:", err);
          setFetchError("Ett oväntat fel uppstod.");
        }
      };
      fetchClientId();
    }
  }, [user, authLoading]);

  // Fetch latest period start
  useEffect(() => {
    if (clientId) {
      const fetchLatestPeriodStart = async () => {
        try {
          setFetchError(null);
          const { data, error: fetchError } = await supabase
            .from("cycle_events")
            .select("date")
            .eq("client_id", clientId)
            .eq("event_type", "period_start")
            .order("date", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            console.error("Error fetching period start:", fetchError);
            // Tyst fel - det är okej om ingen period start finns
            if (fetchError.code !== "PGRST116") {
              setFetchError("Kunde inte hämta cykeldata.");
            }
            return;
          }

          if (data?.date) {
            setLatestPeriodStart(data.date);
            // Calculate current phase using utility function
            const { phase } = calculateCyclePhase(data.date);
            setCurrentPhase(phase);
          } else {
            setLatestPeriodStart(null);
            setCurrentPhase(null);
          }
        } catch (err) {
          console.error("Unexpected error fetching period start:", err);
          setFetchError("Ett oväntat fel uppstod vid hämtning av cykeldata.");
        }
      };
      fetchLatestPeriodStart();
    }
  }, [clientId]);

  // Use tips hook with filters
  const phaseFilter: CyclePhase | null = selectedPhase === "all" ? null : selectedPhase;
  const categoryFilter: Tip["category"] | null = selectedCategory === "all" ? null : selectedCategory;
  const { tips, loading, error } = useTips(phaseFilter, categoryFilter);

  const getCategoryLabel = (category: Tip["category"]): string => {
    switch (category) {
      case "training":
        return "Träning";
      case "nutrition":
        return "Kost";
      case "cycle":
        return "Cykel";
      case "mindset":
        return "Mindset";
      default:
        return String(category);
    }
  };

  const getPhaseLabel = (phase: CyclePhase): string => {
    if (!phase) return "Okänd";
    return getCycleColorClasses(phase).label;
  };

  const getContextLabel = (context: Tip["context"]): string | null => {
    switch (context) {
      case "low_energy":
        return "Låg energi";
      case "general":
        return "Allmänt";
      case "cravings":
        return "Sug";
      case "high_stress":
        return "Hög stress";
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
          <SectionHeader title="Tips" subtitle="Tips och råd för din träning" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
          <SectionHeader title="Tips" subtitle="Tips och råd för din träning" />
          <Card className="bg-red-50/50 border-red-200">
            <CardContent>
              <p className="text-sm text-red-600">{error || fetchError}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader title="Tips" subtitle="Tips och råd för din träning" />

        {/* Current Phase Info */}
        {currentPhase && (
          <Card className="bg-amber-50/30 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-sm text-[#5A6B5D]">
                <span className="font-medium">Din nuvarande cykelfas:</span> {getPhaseLabel(currentPhase)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#5A6B5D]/70" />
              <CardTitle className="text-base">Filter</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="phase-select" className="block text-xs font-medium text-[#5A6B5D]/70 mb-2">
                Cykelfas
              </label>
              <Select
                id="phase-select"
                value={selectedPhase === null ? "all" : selectedPhase}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "all" || value === "menstruation" || value === "follicular" || value === "ovulation" || value === "luteal") {
                    setSelectedPhase(value === "all" ? "all" : (value as CyclePhase));
                  }
                }}
              >
                <option value="all">Alla faser</option>
                <option value="menstruation">Mens</option>
                <option value="follicular">Follikulär</option>
                <option value="ovulation">Ägglossning</option>
                <option value="luteal">Luteal</option>
              </Select>
            </div>
            <div>
              <label htmlFor="category-select" className="block text-xs font-medium text-[#5A6B5D]/70 mb-2">
                Kategori
              </label>
              <Select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "all" || value === "training" || value === "nutrition" || value === "cycle" || value === "mindset") {
                    setSelectedCategory(value);
                  }
                }}
              >
                <option value="all">Alla kategorier</option>
                <option value="training">Träning</option>
                <option value="nutrition">Kost</option>
                <option value="cycle">Cykel</option>
                <option value="mindset">Mindset</option>
              </Select>
            </div>
            {(selectedPhase !== "all" || selectedCategory !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPhase("all");
                  setSelectedCategory("all");
                }}
                className="w-full"
              >
                Rensa filter
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tips List */}
        {tips.length === 0 ? (
          <EmptyState
            title="Inga tips hittades"
            description="Prova att ändra filterinställningarna för att se fler tips."
          />
        ) : (
          <div className="space-y-4">
            {tips.map((tip) => {
              if (!tip.id) return null;
              const isRead = isTipRead(tip.id);
              return (
                <Card
                  key={tip.id}
                  className={isRead ? "bg-[#FEFCF8]/50" : "bg-[#FEFCF8]"}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <CardTitle className="text-base">{tip.title}</CardTitle>
                      </div>
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markTipAsRead(tip.id)}
                          className="flex-shrink-0 text-xs"
                        >
                          Markera som läst
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-[#5A6B5D]/70 leading-relaxed">{tip.body}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip variant="outline" className="text-xs px-2 py-0.5">
                        {getCategoryLabel(tip.category)}
                      </Chip>
                      {tip.phase && (
                        <Chip variant="outline" className="text-xs px-2 py-0.5">
                          {getPhaseLabel(tip.phase)}
                        </Chip>
                      )}
                      {(() => {
                        const contextLabel = tip.context ? getContextLabel(tip.context) : null;
                        return contextLabel ? (
                          <Chip variant="outline" className="text-xs px-2 py-0.5">
                            {contextLabel}
                          </Chip>
                        ) : null;
                      })()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

