/**
 * Type definitions for Supabase responses
 * Eliminates need for 'any' types throughout the app
 */

// Common Supabase relation patterns
export type SupabaseRelation<T> = T | T[] | null;

// Normalize Supabase relation (handles array/non-array responses)
export function normalizeRelation<T>(relation: SupabaseRelation<T>): T | null {
  if (Array.isArray(relation)) {
    return relation[0] || null;
  }
  return relation || null;
}

// Normalize array of relations
export function normalizeRelations<T>(relations: SupabaseRelation<T>[] | null | undefined): T[] {
  if (!relations) return [];
  return relations.map(normalizeRelation).filter((item): item is T => item !== null);
}

// Error type for better error handling
export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as SupabaseError).message === "string"
  );
}

