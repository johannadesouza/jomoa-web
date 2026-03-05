import { useCallback } from "react";

export interface DashboardRefetchInput {
  refetchDashboard: () => void;
  refetchInProgress: () => void;
  refetchReadiness: () => void;
  refetchReadinessHistory: () => void;
  refetchCycle: () => void;
  refetchInsight: () => void;
}

/**
 * Returns a single refetch() that triggers all dashboard-related refetches.
 * Use with useFocusEffect so the dashboard refreshes when the screen gains focus.
 */
export function useDashboardRefetch(input: DashboardRefetchInput): () => void {
  return useCallback(() => {
    input.refetchDashboard();
    input.refetchInProgress();
    input.refetchReadiness();
    input.refetchReadinessHistory();
    input.refetchCycle();
    input.refetchInsight();
  }, [
    input.refetchDashboard,
    input.refetchInProgress,
    input.refetchReadiness,
    input.refetchReadinessHistory,
    input.refetchCycle,
    input.refetchInsight,
  ]);
}
