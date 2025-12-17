"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { calculateDailyTarget } from "@/lib/services/nutritionService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface NutritionPlan {
  id: string;
  client_id: string;
  name: string;
  goal: "fat_loss" | "muscle_gain" | "recomp" | "maintenance";
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface NutritionPeriod {
  id: string;
  nutrition_plan_id: string;
  name: string;
  period_type: "deficit" | "maintenance" | "surplus";
  start_date: string;
  end_date: string;
  target_rate_kg_per_week: number | null;
}

interface DailyTarget {
  target_kcal: number;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  period_id: string | null;
  is_auto_adjusted_from_cycle: boolean;
}

export default function ClientNutritionPage() {
  const { user, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [periods, setPeriods] = useState<NutritionPeriod[]>([]);
  const [todayTarget, setTodayTarget] = useState<DailyTarget | null>(null);
  const [cyclePhase, setCyclePhase] = useState<string | null>(null);
  const [enableCycleAdjustments, setEnableCycleAdjustments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClientId();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (clientId) {
      fetchNutritionPlan();
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchCyclePhase();
      fetchCycleAdjustmentSetting();
    }
  }, [clientId]);

  useEffect(() => {
    if (nutritionPlan && periods.length > 0) {
      calculateTodayTarget();
    }
  }, [nutritionPlan, periods, cyclePhase, enableCycleAdjustments]);

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

  const fetchNutritionPlan = async () => {
    if (!clientId) return;

    try {
      // Hämta aktiv nutrition plan
      const { data: planData, error: planError } = await supabase
        .from("nutrition_plans")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planError && planError.code !== "PGRST116") {
        throw planError;
      }

      if (planData) {
        setNutritionPlan(planData as NutritionPlan);
        fetchPeriods(planData.id);
      } else {
        setNutritionPlan(null);
        setPeriods([]);
        setTodayTarget(null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching nutrition plan:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta nutrition plan. Försök igen senare.");
      setLoading(false);
    }
  };

  const fetchPeriods = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from("nutrition_periods")
        .select("*")
        .eq("nutrition_plan_id", planId)
        .order("start_date", { ascending: true });

      if (error) {
        throw error;
      }

      setPeriods((data || []) as NutritionPeriod[]);
    } catch (err) {
      console.error("Error fetching periods:", err);
    }
  };

  const fetchCyclePhase = async () => {
    if (!clientId) return;

    try {
      // Hämta senaste period start
      const { data: periodEvent } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (!periodEvent) {
        setCyclePhase(null);
        return;
      }

      // Beräkna cykelfas
      const startDate = new Date(periodEvent.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const cycleDay = diffDays + 1;

      let phase: string | null = null;
      if (cycleDay >= 1 && cycleDay <= 5) {
        phase = "menstruation";
      } else if (cycleDay >= 6 && cycleDay <= 13) {
        phase = "follicular";
      } else if (cycleDay >= 14 && cycleDay <= 16) {
        phase = "ovulation";
      } else if (cycleDay >= 17 && cycleDay <= 28) {
        phase = "luteal";
      }

      // Kontrollera om det finns manuell justering för idag
      const todayStr = today.toISOString().split("T")[0];
      const { data: manualPhase } = await supabase
        .from("cycle_phases")
        .select("phase")
        .eq("client_id", clientId)
        .eq("date", todayStr)
        .in("source", ["client", "coach"])
        .single();

      if (manualPhase && manualPhase.phase !== "unknown") {
        setCyclePhase(manualPhase.phase);
      } else {
        setCyclePhase(phase);
      }
    } catch (err) {
      console.error("Error fetching cycle phase:", err);
      setCyclePhase(null);
    }
  };

  const fetchCycleAdjustmentSetting = async () => {
    if (!nutritionPlan?.id) return;

    try {
      // För nu, låt oss anta att cycle adjustments är aktiverade om klienten har cycle data
      // I framtiden kan detta vara en inställning i nutrition_plan
      // För MVP, aktivera om klienten har period start
      const { data: hasPeriodStart } = await supabase
        .from("cycle_events")
        .select("id")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .limit(1)
        .single();

      setEnableCycleAdjustments(!!hasPeriodStart);
    } catch (err) {
      setEnableCycleAdjustments(false);
    }
  };

  const calculateTodayTarget = async () => {
    if (!periods.length || !nutritionPlan) {
      setTodayTarget(null);
      return;
    }

    const today = new Date();
    
    // Först kolla om det finns ett manuellt justerat target för idag
    const todayStr = today.toISOString().split("T")[0];
    try {
      const { data: existingTarget } = await supabase
        .from("nutrition_targets")
        .select("*")
        .eq("nutrition_plan_id", nutritionPlan.id)
        .eq("date", todayStr)
        .single();

      if (existingTarget && !existingTarget.is_auto_adjusted_from_cycle) {
        // Det finns ett manuellt justerat target, använd det
        setTodayTarget({
          target_kcal: existingTarget.target_kcal,
          target_protein_g: existingTarget.target_protein_g,
          target_carbs_g: existingTarget.target_carbs_g,
          target_fat_g: existingTarget.target_fat_g,
          period_id: existingTarget.period_id,
          is_auto_adjusted_from_cycle: false,
        });
        return;
      }
    } catch (err) {
      // Ingen befintlig target, fortsätt med beräkning
    }

    // Beräkna target med cycle-aware adjustments
    const target = calculateDailyTarget(
      periods,
      today,
      2000, // Placeholder maintenance kcal
      cyclePhase,
      enableCycleAdjustments
    );

    if (target) {
      setTodayTarget(target);
      
      // Spara target i databasen (upsert)
      try {
        await supabase
          .from("nutrition_targets")
          .upsert(
            {
              nutrition_plan_id: nutritionPlan.id,
              period_id: target.period_id,
              date: todayStr,
              target_kcal: target.target_kcal,
              target_protein_g: target.target_protein_g,
              target_carbs_g: target.target_carbs_g,
              target_fat_g: target.target_fat_g,
              is_auto_adjusted_from_cycle: target.is_auto_adjusted_from_cycle,
            },
            {
              onConflict: "nutrition_plan_id,date",
            }
          );
      } catch (err) {
        console.error("Error saving nutrition target:", err);
        // Fortsätt ändå, target visas i UI
      }
    } else {
      setTodayTarget(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Kost" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error && !clientId) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Kost" />
          <Card className="border-red-200 bg-red-50/50">
            <CardContent>
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const goalLabels: Record<string, string> = {
    fat_loss: "Viktnedgång",
    muscle_gain: "Viktuppgång",
    recomp: "Recomposition",
    maintenance: "Vikthållning",
  };

  const periodTypeLabels: Record<string, string> = {
    deficit: "Underskott",
    maintenance: "Balans",
    surplus: "Överskott",
  };

  return (
    <div className="min-h-screen bg-sage pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader 
          title="Kost" 
          subtitle="Dina nutrition-mål och perioder"
        />

        {!nutritionPlan ? (
          <EmptyState
            title="Ingen aktiv nutrition plan"
            description="Du har ingen aktiv nutrition plan ännu. Kontakta din coach för att få en plan."
          />
        ) : (
          <div className="space-y-6">
            {/* Plan Info */}
            <Card>
              <CardHeader>
                <CardTitle>{nutritionPlan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#5A6B5D]/70">
                  Mål: {goalLabels[nutritionPlan.goal]}
                </p>
              </CardContent>
            </Card>

            {/* Today's Target */}
            {todayTarget ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Dagens mål</CardTitle>
                    {todayTarget.is_auto_adjusted_from_cycle && (
                      <Chip variant="info">Justerat för cykel</Chip>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#5A6B5D]/70">Kalorier:</span>
                      <span className="text-lg font-bold text-[#5A6B5D]">{todayTarget.target_kcal} kcal</span>
                    </div>
                    {cyclePhase && enableCycleAdjustments && todayTarget.is_auto_adjusted_from_cycle && (
                      <p className="text-xs text-[#5A6B5D]/60 mt-1">
                        Justerat baserat på {cyclePhase === "luteal" ? "lutealfas" : cyclePhase === "menstruation" ? "mensfas" : cyclePhase === "follicular" ? "follikulärfas" : "ägglossningsfas"}
                      </p>
                    )}
                    {todayTarget.target_protein_g && (
                      <div className="flex justify-between items-center">
                      <span className="text-sm text-[#5A6B5D]/70">Protein:</span>
                      <span className="text-sm font-medium text-[#5A6B5D]">{todayTarget.target_protein_g} g</span>
                      </div>
                    )}
                    {todayTarget.target_carbs_g && (
                      <div className="flex justify-between items-center">
                      <span className="text-sm text-[#5A6B5D]/70">Kolhydrater:</span>
                      <span className="text-sm font-medium text-[#5A6B5D]">{todayTarget.target_carbs_g} g</span>
                      </div>
                    )}
                    {todayTarget.target_fat_g && (
                      <div className="flex justify-between items-center">
                      <span className="text-sm text-[#5A6B5D]/70">Fett:</span>
                      <span className="text-sm font-medium text-[#5A6B5D]">{todayTarget.target_fat_g} g</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Dagens mål</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#5A6B5D]/70">
                    Ingen period aktiv för idag. Kontakta din coach.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Periods Overview */}
            {periods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Perioder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {periods.map((period) => {
                      const today = new Date();
                      const periodStart = new Date(period.start_date);
                      const periodEnd = new Date(period.end_date);
                      const isActive = today >= periodStart && today <= periodEnd;

                      return (
                        <Card
                          key={period.id}
                          className={isActive ? "bg-blue-50/50 border-blue-200" : ""}
                        >
                          <CardContent>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-semibold text-[#5A6B5D]">
                                    {period.name}
                                  </h3>
                                  {isActive && (
                                    <Chip variant="info">Aktiv</Chip>
                                  )}
                                </div>
                                <p className="text-sm text-[#5A6B5D]/70 mt-1">
                                  {periodTypeLabels[period.period_type]}
                                </p>
                                <p className="text-xs text-[#5A6B5D]/60 mt-1">
                                  {new Date(period.start_date).toLocaleDateString("sv-SE")} -{" "}
                                  {new Date(period.end_date).toLocaleDateString("sv-SE")}
                                </p>
                                {period.target_rate_kg_per_week && (
                                  <p className="text-xs text-[#5A6B5D]/70 mt-1">
                                    Mål: {period.target_rate_kg_per_week > 0 ? "+" : ""}
                                    {period.target_rate_kg_per_week} kg/vecka
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

