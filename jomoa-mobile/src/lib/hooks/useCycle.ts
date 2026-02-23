/**
 * useCycle – reads from CycleContext (single source of truth)
 * Use for today's phase. For arbitrary dates use useCycleContext().getPhaseForDate()
 */
import { useCycleContext } from "../../shared/context/CycleContext";

export function useCycle(clientId: string | undefined) {
  const ctx = useCycleContext();

  return {
    latestPeriodStart: ctx.latestPeriodStart,
    phase: ctx.phase,
    phaseLabel: ctx.phaseLabel,
    cycleDay: ctx.cycleDay,
    cycleLength: ctx.cycleLength,
    daysUntilNextPeriod: ctx.daysUntilNextPeriod,
    isLoading: ctx.isLoading,
    error: ctx.error,
    refetch: ctx.refetch,
  };
}
