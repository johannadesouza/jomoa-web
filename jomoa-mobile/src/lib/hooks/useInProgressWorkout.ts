import { useState, useEffect, useCallback } from "react";
import { getInProgressWorkout } from "../store/workoutStore";
import type { InProgressWorkout } from "../domain/workout";

export function useInProgressWorkout() {
  const [inProgress, setInProgress] = useState<InProgressWorkout | null>(null);

  const refetch = useCallback(async () => {
    const data = await getInProgressWorkout();
    setInProgress(data);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { inProgress, refetch };
}
