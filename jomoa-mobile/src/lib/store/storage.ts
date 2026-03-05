/**
 * Central AsyncStorage abstraction
 * Keys, get/set, JSON serialization
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  IN_PROGRESS_WORKOUT: "@jomoa/inProgressWorkout",
  REST_TIMER_STATE: "@jomoa/restTimerState",
  PREFERRED_THEME: "@jomoa/preferredTheme",
  DAILY_CHECKIN_NOTIFICATIONS: "@jomoa/dailyCheckinNotifications",
  READINESS_EXPLANATION_SEEN: "@jomoa/readiness_explanation_seen",
} as const;

export const storageKeys = KEYS;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (__DEV__) console.warn("Storage setItem failed:", e);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    if (__DEV__) console.warn("Storage removeItem failed:", e);
  }
}
