/**
 * In-progress workout state
 * Persisted to AsyncStorage for resume-safety
 */

import { getItem, setItem, removeItem, storageKeys } from "./storage";
import type { InProgressWorkout, RestTimerState } from "../domain/workout";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function getInProgressWorkout(): Promise<InProgressWorkout | null> {
  const data = await getItem<InProgressWorkout>(storageKeys.IN_PROGRESS_WORKOUT);
  if (!data) return null;
  const startedAt = new Date(data.startedAt).getTime();
  if (Date.now() - startedAt > MAX_AGE_MS) {
    await clearInProgressWorkout();
    return null;
  }
  return data;
}

export async function setInProgressWorkout(workout: InProgressWorkout | null): Promise<void> {
  if (workout) {
    await setItem(storageKeys.IN_PROGRESS_WORKOUT, workout);
  } else {
    await removeItem(storageKeys.IN_PROGRESS_WORKOUT);
  }
}

export async function clearInProgressWorkout(): Promise<void> {
  await removeItem(storageKeys.IN_PROGRESS_WORKOUT);
  await removeItem(storageKeys.REST_TIMER_STATE);
}

export async function getRestTimerState(): Promise<RestTimerState | null> {
  return getItem<RestTimerState>(storageKeys.REST_TIMER_STATE);
}

export async function setRestTimerState(state: RestTimerState | null): Promise<void> {
  if (state) {
    await setItem(storageKeys.REST_TIMER_STATE, state);
  } else {
    await removeItem(storageKeys.REST_TIMER_STATE);
  }
}
