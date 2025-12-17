import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Exercise } from "@/lib/types/common";
import { normalizeRelation } from "@/lib/utils/normalizeSupabase";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

interface UseExercisesOptions {
  includeCoachExercises?: boolean;
  includeGlobalExercises?: boolean;
}

interface UseExercisesReturn {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook för att hämta övningar (globala och/eller coachens egna)
 * Konsoliderar duplicerad logik från flera komponenter
 */
export function useExercises(options: UseExercisesOptions = {}): UseExercisesReturn {
  const { includeCoachExercises = true, includeGlobalExercises = true } = options;
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!user?.id) {
      setExercises([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allExercises: Exercise[] = [];

      // Hämta globala övningar
      if (includeGlobalExercises) {
        const { data: globalExercises, error: globalError } = await supabase
          .from("exercises")
          .select(`
            id,
            name,
            description,
            category_id,
            primary_muscle_group,
            equipment,
            is_global,
            created_by_profile_id,
            created_at,
            category:exercise_categories!exercises_category_id_fkey (
              name,
              id
            )
          `)
          .eq("is_global", true)
          .order("name", { ascending: true });

        if (globalError) {
          throw globalError;
        }

        if (globalExercises) {
          const normalized = globalExercises.map((ex) => {
            const category = normalizeRelation(ex.category);
            return {
              id: ex.id,
              name: ex.name || "",
              description: ex.description || null,
              category: category?.name || null,
              equipment: ex.equipment || null,
              is_global: true,
              created_by_profile_id: null,
              created_at: ex.created_at || new Date().toISOString(),
            } as Exercise;
          });
          allExercises.push(...normalized);
        }
      }

      // Hämta coachens egna övningar
      if (includeCoachExercises) {
        const { data: coachExercises, error: coachError } = await supabase
          .from("exercises")
          .select(`
            id,
            name,
            description,
            category_id,
            primary_muscle_group,
            equipment,
            is_global,
            created_by_profile_id,
            created_at,
            category:exercise_categories!exercises_category_id_fkey (
              name,
              id
            )
          `)
          .eq("created_by_profile_id", user.id)
          .order("name", { ascending: true });

        if (coachError) {
          throw coachError;
        }

        if (coachExercises) {
          const normalized = coachExercises.map((ex) => {
            const category = normalizeRelation(ex.category);
            return {
              id: ex.id,
              name: ex.name || "",
              description: ex.description || null,
              category: category?.name || null,
              equipment: ex.equipment || null,
              is_global: false,
              created_by_profile_id: user.id,
              created_at: ex.created_at || new Date().toISOString(),
            } as Exercise;
          });
          allExercises.push(...normalized);
        }
      }

      // Ta bort dubbletter baserat på ID
      const uniqueExercises = allExercises.filter(
        (exercise, index, self) => index === self.findIndex((e) => e.id === exercise.id)
      );

      setExercises(uniqueExercises);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      console.error("Error fetching exercises:", err);
      setError(errorMessage);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, includeCoachExercises, includeGlobalExercises]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    loading,
    error,
    refetch: fetchExercises,
  };
}

