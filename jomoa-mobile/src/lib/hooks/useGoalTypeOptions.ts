/**
 * Hämtar mål-alternativ från Content DB med fallback till goalOptions.ts
 */
import { useState, useEffect, useCallback } from "react";
import { fetchGoalTypeOptionsByType } from "../repos/contentRepo/goalTypeOptions";
import type { GoalType } from "../services/goalsService";
import {
  GOAL_OPTIONS,
  GOAL_SELECT_LIMITS,
  type GoalOption,
} from "../data/goalOptions";

export type GoalTypeOptionsState = {
  optionsByType: Record<GoalType, GoalOption[]>;
  selectLimits: Record<GoalType, number>;
  isLoading: boolean;
  error: string | null;
};

function mapEntryToOption(e: { option_id: string; label: string; icon_name: string | null }): GoalOption {
  return {
    id: e.option_id,
    label: e.label,
    iconName: e.icon_name ?? "ellipse-outline",
  };
}

export function useGoalTypeOptions(): GoalTypeOptionsState & { refetch: () => void } {
  const [optionsByType, setOptionsByType] = useState<Record<GoalType, GoalOption[]>>(GOAL_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const byType = await fetchGoalTypeOptionsByType();
      const mapped: Record<GoalType, GoalOption[]> = {
        fitness: byType.fitness.map(mapEntryToOption),
        nutrition: byType.nutrition.map(mapEntryToOption),
        wellness: byType.wellness.map(mapEntryToOption),
        event: byType.event.map(mapEntryToOption),
      };
      setOptionsByType(mapped);
    } catch (e) {
      setOptionsByType(GOAL_OPTIONS);
      setError(e instanceof Error ? e.message : "Kunde inte ladda målalternativ");
      if (__DEV__) console.warn("[useGoalTypeOptions]", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    optionsByType,
    selectLimits: GOAL_SELECT_LIMITS,
    isLoading,
    error,
    refetch: load,
  };
}
