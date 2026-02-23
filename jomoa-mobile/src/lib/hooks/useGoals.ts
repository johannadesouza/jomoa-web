import { useEffect, useState, useCallback } from "react";
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  type ClientGoal,
  type GoalType,
} from "../services/goalsService";

export function useGoals(clientId: string | undefined) {
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) {
      setGoals([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchGoals(clientId);
      setGoals(data);
    } catch {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const addGoal = useCallback(
    async (
      goalType: GoalType,
      description?: string | null,
      targetValue?: string | null
    ): Promise<{ error: Error | null }> => {
      if (!clientId) return { error: new Error("No client") };
      const { id, error } = await createGoal(clientId, goalType, description, targetValue);
      if (!error && id) {
        setGoals((prev) => [
          {
            id,
            client_id: clientId,
            goal_type: goalType,
            description: description ?? null,
            target_value: targetValue ?? null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      return { error };
    },
    [clientId]
  );

  const updateGoalById = useCallback(
    async (
      goalId: string,
      updates: Partial<Pick<ClientGoal, "description" | "target_value" | "is_active">>
    ): Promise<{ error: Error | null }> => {
      if (!clientId) return { error: new Error("No client") };
      const { error } = await updateGoal(clientId, goalId, updates);
      if (!error) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? { ...g, ...updates, updated_at: new Date().toISOString() }
              : g
          )
        );
      }
      return { error };
    },
    [clientId]
  );

  const removeGoal = useCallback(
    async (goalId: string): Promise<{ error: Error | null }> => {
      if (!clientId) return { error: new Error("No client") };
      const { error } = await deleteGoal(clientId, goalId);
      if (!error) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
      return { error };
    },
    [clientId]
  );

  return { goals, isLoading, refetch: load, addGoal, updateGoalById, removeGoal };
}
