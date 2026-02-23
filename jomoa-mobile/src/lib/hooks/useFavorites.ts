import { useEffect, useState, useCallback } from "react";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favoritesService";

export function useFavorites(clientId: string | undefined) {
  const [favoriteSessionIds, setFavoriteSessionIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId) {
      setFavoriteSessionIds(new Set());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const ids = await fetchFavorites(clientId);
      setFavoriteSessionIds(new Set(ids));
    } catch {
      setFavoriteSessionIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!clientId) return false;
      const isFav = favoriteSessionIds.has(sessionId);
      if (isFav) {
        const { error } = await removeFavorite(clientId, sessionId);
        if (!error) {
          setFavoriteSessionIds((prev) => {
            const next = new Set(prev);
            next.delete(sessionId);
            return next;
          });
          return false;
        }
      } else {
        const { error } = await addFavorite(clientId, sessionId);
        if (!error) {
          setFavoriteSessionIds((prev) => new Set(prev).add(sessionId));
          return true;
        }
      }
      return isFav;
    },
    [clientId, favoriteSessionIds]
  );

  const isFavorite = useCallback(
    (sessionId: string) => favoriteSessionIds.has(sessionId),
    [favoriteSessionIds]
  );

  return { favoriteSessionIds: Array.from(favoriteSessionIds), isFavorite, toggle, refetch: load, isLoading };
}
