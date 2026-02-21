/**
 * In-memory cache for active program
 * Optional AsyncStorage hydration for persisted activeProgramId
 */

import { getItem, setItem, removeItem, storageKeys } from "./storage";
import type { Program } from "../domain/program";

let cachedActiveProgramId: string | null = null;

export function getCachedActiveProgramId(): string | null {
  return cachedActiveProgramId;
}

export function setCachedActiveProgramId(programId: string | null): void {
  cachedActiveProgramId = programId;
}

export async function hydrateActiveProgramId(): Promise<string | null> {
  const stored = await getItem<string>(storageKeys.ACTIVE_PROGRAM_ID);
  cachedActiveProgramId = stored;
  return stored;
}

export async function persistActiveProgramId(programId: string | null): Promise<void> {
  cachedActiveProgramId = programId;
  if (programId) {
    await setItem(storageKeys.ACTIVE_PROGRAM_ID, programId);
  } else {
    await removeItem(storageKeys.ACTIVE_PROGRAM_ID);
  }
}
