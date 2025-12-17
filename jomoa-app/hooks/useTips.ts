import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CyclePhase } from "@/lib/utils/cycleColors";

export interface Tip {
  id: string;
  title: string;
  body: string;
  category: "training" | "nutrition" | "cycle" | "mindset";
  phase: CyclePhase;
  context: "low_energy" | "general" | "cravings" | "high_stress" | null;
  is_active: boolean;
  created_at: string;
}

export function useTips(phase: CyclePhase | null, category?: Tip["category"] | null) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("tips_library")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Filter by phase if provided
      if (phase) {
        query = query.eq("phase", phase);
      }

      // Filter by category if provided
      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message || "Kunde inte hämta tips från databasen.");
      }

      // Validate and type-check data
      if (data && Array.isArray(data)) {
        const validatedTips: Tip[] = data.filter((item): item is Tip => {
          return (
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.body === "string" &&
            ["training", "nutrition", "cycle", "mindset"].includes(item.category) &&
            (item.phase === null || ["menstruation", "follicular", "ovulation", "luteal"].includes(item.phase)) &&
            typeof item.is_active === "boolean" &&
            typeof item.created_at === "string"
          );
        });
        setTips(validatedTips);
      } else {
        setTips([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Kunde inte hämta tips.";
      console.error("Error fetching tips:", err);
      setError(errorMessage);
      setTips([]);
    } finally {
      setLoading(false);
    }
  }, [phase, category]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return { tips, loading, error, refetch: fetchTips };
}

/**
 * Get today's tips based on cycle phase (max 1-2 tips)
 * Falls back to general tips (phase = null) if no phase-specific tips are available
 */
export function useTodayTips(phase: CyclePhase | null) {
  const { tips: phaseTips, loading: phaseLoading, error: phaseError } = useTips(phase);
  const { tips: generalTips, loading: generalLoading } = useTips(null);
  const [todayTips, setTodayTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(phaseLoading || generalLoading);
    
    // Use phase-specific tips if available, otherwise fall back to general tips
    const availableTips = phaseTips.length > 0 ? phaseTips : generalTips;
    
    if (availableTips.length > 0) {
      // Get 1-2 random tips for today
      const shuffled = [...availableTips].sort(() => 0.5 - Math.random());
      setTodayTips(shuffled.slice(0, 2));
    } else {
      setTodayTips([]);
    }
  }, [phaseTips, generalTips, phaseLoading, generalLoading]);

  return { todayTips, loading, error: phaseError };
}

/**
 * Mark tip as read (stored in localStorage)
 */
export function markTipAsRead(tipId: string) {
  if (typeof window === "undefined") return;
  const readTips = getReadTips();
  if (!readTips.includes(tipId)) {
    readTips.push(tipId);
    localStorage.setItem("readTips", JSON.stringify(readTips));
  }
}

/**
 * Get all read tip IDs from localStorage
 */
export function getReadTips(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("readTips");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a tip is read
 */
export function isTipRead(tipId: string): boolean {
  const readTips = getReadTips();
  return readTips.includes(tipId);
}

