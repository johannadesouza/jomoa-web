"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Chip } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { Calendar, Utensils, TrendingUp } from "lucide-react";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

interface NutritionPlan {
  id: string;
  client_id: string;
  name: string;
  goal: "fat_loss" | "muscle_gain" | "recomp" | "maintenance";
  start_date: string;
  end_date: string | null;
  created_by_coach_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  periods?: NutritionPeriod[];
}

interface NutritionPeriod {
  id: string;
  nutrition_plan_id: string;
  name: string;
  period_type: "deficit" | "maintenance" | "surplus";
  start_date: string;
  end_date: string;
  target_rate_kg_per_week: number | null;
  created_at: string;
}

export default function ClientNutritionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<any>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [periods, setPeriods] = useState<NutritionPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planGoal, setPlanGoal] = useState<"fat_loss" | "muscle_gain" | "recomp" | "maintenance">("maintenance");
  const [planStartDate, setPlanStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [planEndDate, setPlanEndDate] = useState<string>("");
  const [creatingPlan, setCreatingPlan] = useState(false);

  const [periodName, setPeriodName] = useState("");
  const [periodType, setPeriodType] = useState<"deficit" | "maintenance" | "surplus">("maintenance");
  const [periodStartDate, setPeriodStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [periodEndDate, setPeriodEndDate] = useState<string>("");
  const [targetRate, setTargetRate] = useState<string>("");
  const [creatingPeriod, setCreatingPeriod] = useState(false);
  const [cyclePhase, setCyclePhase] = useState<"menstruation" | "follicular" | "ovulation" | "luteal" | null>(null);
  const [todayTarget, setTodayTarget] = useState<{
    kcal: number;
    period: NutritionPeriod;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClient();
      fetchNutritionPlan();
    }
  }, [user, authLoading, clientId]);

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

      setClient(data);
    } catch (err) {
      console.error("Error fetching client:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta klient. Försök igen senare.");
      setLoading(false);
    }
  };

  const fetchNutritionPlan = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

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
        // Type-safe assignment
        const normalizedPlan: NutritionPlan = {
          id: planData.id,
          client_id: planData.client_id,
          name: planData.name,
          goal: planData.goal,
          start_date: planData.start_date,
          end_date: planData.end_date,
          created_by_coach_id: planData.created_by_coach_id,
          is_active: planData.is_active,
          created_at: planData.created_at,
          updated_at: planData.updated_at,
        };
        setNutritionPlan(normalizedPlan);
        await fetchPeriods(planData.id);
      } else {
        setNutritionPlan(null);
        setPeriods([]);
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

      const periodsData = (data || []) as NutritionPeriod[];
      setPeriods(periodsData);
      
      // Beräkna dagens target
      calculateTodayTarget(periodsData);
      
      // Hämta cykelfas för cycle-aware adjustments
      fetchCyclePhase();
    } catch (err) {
      console.error("Error fetching periods:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchCyclePhase = async () => {
    if (!clientId) return;
    
    try {
      // Hämta senaste mensstart
      const { data: periodStart } = await supabase
        .from("cycle_events")
        .select("event_date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("event_date", { ascending: false })
        .limit(1)
        .single();

      if (periodStart) {
        const startDate = new Date(periodStart.event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (diffDays >= 1 && diffDays <= 5) {
          setCyclePhase("menstruation");
        } else if (diffDays >= 6 && diffDays <= 13) {
          setCyclePhase("follicular");
        } else if (diffDays >= 14 && diffDays <= 16) {
          setCyclePhase("ovulation");
        } else if (diffDays >= 17 && diffDays <= 28) {
          setCyclePhase("luteal");
        } else {
          setCyclePhase(null);
        }
      }
    } catch (err) {
      console.error("Error fetching cycle phase:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const calculateTodayTarget = (periodsData: NutritionPeriod[]) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Hitta aktiv period för idag
    const activePeriod = periodsData.find((period) => {
      return today >= period.start_date && today <= period.end_date;
    });

    if (!activePeriod) {
      setTodayTarget(null);
      return;
    }

    // Enkel beräkning: Baserat på period type och target_rate
    // I en riktig implementation skulle detta vara mer avancerat
    // med BMR, aktivitetsnivå, etc.
    // För nu: Använd target_rate_kg_per_week för att estimera kcal
    // -0.5 kg/vecka ≈ -500 kcal/dag deficit
    // +0.5 kg/vecka ≈ +500 kcal/dag surplus
    
    let baseKcal = 2000; // Placeholder - skulle komma från klientens BMR/TDEE
    let adjustment = 0;
    
    if (activePeriod.target_rate_kg_per_week) {
      // 1 kg ≈ 7700 kcal, så 0.5 kg/vecka ≈ 550 kcal/dag
      adjustment = activePeriod.target_rate_kg_per_week * 1100;
    } else {
      // Standard adjustments baserat på period type
      switch (activePeriod.period_type) {
        case "deficit":
          adjustment = -500;
          break;
        case "surplus":
          adjustment = 500;
          break;
        case "maintenance":
          adjustment = 0;
          break;
      }
    }

    // Cycle-aware adjustment (luteal phase behöver mer energi)
    let cycleAdjustment = 0;
    if (cyclePhase === "luteal") {
      cycleAdjustment = 100; // +100 kcal i luteal fas
    }

    const totalKcal = Math.round(baseKcal + adjustment + cycleAdjustment);

    setTodayTarget({
      kcal: totalKcal,
      period: activePeriod,
    });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !user?.id) {
      setError("Klient-ID eller coach-ID saknas.");
      return;
    }

    setCreatingPlan(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from("nutrition_plans")
        .insert({
          client_id: clientId,
          name: planName.trim(),
          goal: planGoal,
          start_date: planStartDate,
          end_date: planEndDate || null,
          created_by_coach_id: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Type-safe assignment
      const normalizedPlan: NutritionPlan = {
        id: data.id,
        client_id: data.client_id,
        name: data.name,
        goal: data.goal,
        start_date: data.start_date,
        end_date: data.end_date,
        created_by_coach_id: data.created_by_coach_id,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      setNutritionPlan(normalizedPlan);
      setShowPlanForm(false);
      setPlanName("");
      setPlanGoal("maintenance");
      setPlanStartDate(new Date().toISOString().split("T")[0]);
      setPlanEndDate("");
      setSuccessMessage("Nutrition plan skapad!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error creating nutrition plan:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa nutrition plan. Försök igen senare.");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutritionPlan?.id) {
      setError("Ingen aktiv nutrition plan. Skapa en plan först.");
      return;
    }

    setCreatingPeriod(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from("nutrition_periods")
        .insert({
          nutrition_plan_id: nutritionPlan.id,
          name: periodName.trim(),
          period_type: periodType,
          start_date: periodStartDate,
          end_date: periodEndDate,
          target_rate_kg_per_week: targetRate ? parseFloat(targetRate) : null,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setPeriods([...periods, data as NutritionPeriod]);
      setShowPeriodForm(false);
      setPeriodName("");
      setPeriodType("maintenance");
      setPeriodStartDate(new Date().toISOString().split("T")[0]);
      setPeriodEndDate("");
      setTargetRate("");
      setSuccessMessage("Period skapad!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error creating period:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa period. Försök igen senare.");
    } finally {
      setCreatingPeriod(false);
    }
  };

  const handleDeactivatePlan = async () => {
    if (!nutritionPlan?.id) return;

    if (!confirm("Är du säker på att du vill inaktivera denna nutrition plan?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("nutrition_plans")
        .update({ is_active: false })
        .eq("id", nutritionPlan.id);

      if (error) {
        throw error;
      }

      setNutritionPlan(null);
      setPeriods([]);
      setSuccessMessage("Nutrition plan inaktiverad.");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error deactivating plan:", err);
      setError(getErrorMessage(err) || "Kunde inte inaktivera plan. Försök igen senare.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Nutrition" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Nutrition" />
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
        <SectionHeader title="Nutrition" />
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
    <div className="space-y-6">
      <SectionHeader
        title={`Nutrition – ${client.profile?.full_name || "Namnlös klient"}`}
        subtitle="Hantera nutrition plan och perioder"
        breadcrumbs={[
          { label: "Klienter", href: "/coach/clients" },
          { label: client.profile?.full_name || "Klient", href: `/coach/clients/${clientId}` },
          { label: "Nutrition" },
        ]}
      />

      {successMessage && (
        <Card className="bg-green-50/50 border-green-200">
          <CardContent>
            <p className="text-sm text-green-600">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {!nutritionPlan ? (
        <Card>
          <CardHeader>
            <CardTitle>Ingen aktiv nutrition plan</CardTitle>
            <CardDescription>Skapa en nutrition plan för att börja planera klientens kost.</CardDescription>
          </CardHeader>
          {!showPlanForm && (
            <CardContent>
              <Button onClick={() => setShowPlanForm(true)}>Skapa nutrition plan</Button>
            </CardContent>
          )}

          {showPlanForm && (
            <CardContent>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label htmlFor="plan-name" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                    Namn på plan
                  </label>
                  <Input
                    id="plan-name"
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    required
                    placeholder="t.ex. Vårplan 2024"
                  />
                </div>

                <div>
                  <label htmlFor="plan-goal" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                    Mål
                  </label>
                  <Select
                    id="plan-goal"
                    value={planGoal}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "fat_loss" || value === "muscle_gain" || value === "recomp" || value === "maintenance") {
                        setPlanGoal(value);
                      }
                    }}
                    required
                  >
                    <option value="maintenance">Vikthållning</option>
                    <option value="fat_loss">Viktnedgång</option>
                    <option value="muscle_gain">Viktuppgång</option>
                    <option value="recomp">Recomposition</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plan-start-date" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                      Startdatum
                    </label>
                    <Input
                      id="plan-start-date"
                      type="date"
                      value={planStartDate}
                      onChange={(e) => setPlanStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="plan-end-date" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                      Slutdatum (valfritt)
                    </label>
                    <Input
                      id="plan-end-date"
                      type="date"
                      value={planEndDate}
                      onChange={(e) => setPlanEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={creatingPlan}>
                    {creatingPlan ? "Skapar..." : "Skapa plan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPlanForm(false);
                      setPlanName("");
                      setPlanGoal("maintenance");
                      setPlanStartDate(new Date().toISOString().split("T")[0]);
                      setPlanEndDate("");
                      setError(null);
                    }}
                    disabled={creatingPlan}
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Nutrition Plan Info */}
          <Card variant="hero">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{nutritionPlan.name}</CardTitle>
                  <CardDescription>
                    Mål: {goalLabels[nutritionPlan.goal]}
                  </CardDescription>
                  <p className="text-xs text-[#5A6B5D]/70 mt-1">
                    {new Date(nutritionPlan.start_date).toLocaleDateString("sv-SE")}
                    {nutritionPlan.end_date &&
                      ` - ${new Date(nutritionPlan.end_date).toLocaleDateString("sv-SE")}`}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDeactivatePlan}>
                  Inaktivera plan
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Dagens kcal-mål */}
          {todayTarget && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Dagens kcal-mål"
                value={todayTarget.kcal ? `${todayTarget.kcal} kcal` : "N/A"}
                description={
                  todayTarget.period
                    ? `Period: ${todayTarget.period.name}`
                    : "Ingen aktiv period"
                }
              />
              {cyclePhase && (
                <StatCard
                  label="Cykelfas"
                  value={
                    cyclePhase === "menstruation"
                      ? "Mens"
                      : cyclePhase === "follicular"
                      ? "Follikulär"
                      : cyclePhase === "ovulation"
                      ? "Ägglossning"
                      : "Luteal"
                  }
                  description={
                    cyclePhase === "luteal"
                      ? "Cycle-aware: +100 kcal"
                      : "Ingen justering"
                  }
                />
              )}
              {todayTarget.period && (
                <StatCard
                  label="Periodtyp"
                  value={periodTypeLabels[todayTarget.period.period_type]}
                  description={
                    todayTarget.period.target_rate_kg_per_week
                      ? `${todayTarget.period.target_rate_kg_per_week > 0 ? "+" : ""}${todayTarget.period.target_rate_kg_per_week} kg/vecka`
                      : "Inget målvikt"
                  }
                />
              )}
            </div>
          )}

          {/* Periods */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Perioder</CardTitle>
                {!showPeriodForm && (
                  <Button size="sm" onClick={() => setShowPeriodForm(true)}>
                    Lägg till period
                  </Button>
                )}
              </div>
            </CardHeader>

            {showPeriodForm && (
              <CardContent>
                <Card className="bg-[#FEFCF8]/50">
                  <CardContent>
                    <form onSubmit={handleCreatePeriod} className="space-y-4">
                      <div>
                        <label htmlFor="period-name" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                          Namn på period
                        </label>
                        <Input
                          id="period-name"
                          type="text"
                          value={periodName}
                          onChange={(e) => setPeriodName(e.target.value)}
                          required
                          placeholder="t.ex. Deficit-fas 1"
                        />
                      </div>

                      <div>
                        <label htmlFor="period-type" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                          Periodtyp
                        </label>
                        <Select
                          id="period-type"
                          value={periodType}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "deficit" || value === "maintenance" || value === "surplus") {
                              setPeriodType(value);
                            }
                          }}
                          required
                        >
                          <option value="deficit">Underskott</option>
                          <option value="maintenance">Balans</option>
                          <option value="surplus">Överskott</option>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="period-start-date" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                            Startdatum
                          </label>
                          <Input
                            id="period-start-date"
                            type="date"
                            value={periodStartDate}
                            onChange={(e) => setPeriodStartDate(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="period-end-date" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                            Slutdatum
                          </label>
                          <Input
                            id="period-end-date"
                            type="date"
                            value={periodEndDate}
                            onChange={(e) => setPeriodEndDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="target-rate" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                          Målvikt per vecka (kg/vecka, valfritt)
                        </label>
                        <Input
                          id="target-rate"
                          type="number"
                          step="0.1"
                          value={targetRate}
                          onChange={(e) => setTargetRate(e.target.value)}
                          placeholder="t.ex. -0.5 för viktnedgång"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" disabled={creatingPeriod}>
                          {creatingPeriod ? "Skapar..." : "Skapa period"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPeriodForm(false);
                            setPeriodName("");
                            setPeriodType("maintenance");
                            setPeriodStartDate(new Date().toISOString().split("T")[0]);
                            setPeriodEndDate("");
                            setTargetRate("");
                            setError(null);
                          }}
                          disabled={creatingPeriod}
                        >
                          Avbryt
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </CardContent>
            )}

            <CardContent>
              {periods.length === 0 ? (
                <EmptyState
                  title="Inga perioder ännu"
                  description="Lägg till perioder för att strukturera nutrition planen. Skapa perioder med olika typer (underskott, balans, överskott) för att planera klientens kost över tid."
                />
              ) : (
                <div className="space-y-3">
                  {periods.map((period) => (
                    <Card key={period.id}>
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-semibold text-[#5A6B5D]">{period.name}</h3>
                            <p className="text-sm text-[#5A6B5D]/70 mt-1">
                              {periodTypeLabels[period.period_type]}
                            </p>
                            <p className="text-xs text-[#5A6B5D]/70 mt-1">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

