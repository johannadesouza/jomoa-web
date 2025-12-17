/**
 * Utility functions for normalizing Supabase responses
 * Handles the common pattern where Supabase returns arrays for relations
 */

/**
 * Normalize a Supabase relation that can be an object, array, or null
 */
export function normalizeRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  if (Array.isArray(relation)) {
    return relation[0] || null;
  }
  return relation;
}

/**
 * Normalize an array of Supabase relations
 */
export function normalizeRelations<T>(
  relations: (T | T[] | null)[] | null | undefined
): T[] {
  if (!relations) return [];
  return relations
    .map((rel) => normalizeRelation(rel))
    .filter((item): item is T => item !== null);
}

/**
 * Type guard for checking if a value is a valid object
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Get error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Ett oväntat fel uppstod.";
}

