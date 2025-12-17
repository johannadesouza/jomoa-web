import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

interface UseClientDataReturn {
  clientId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook för att hämta client ID baserat på inloggad användare
 * Konsoliderar duplicerad logik från flera komponenter
 */
export function useClientData(): UseClientDataReturn {
  const { user, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientId = useCallback(async () => {
    if (!user?.id) {
      setClientId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (fetchError) {
        // PGRST116 = no rows returned, vilket är okej för nya användare
        if (fetchError.code !== "PGRST116") {
          console.error("Error fetching client ID:", fetchError);
          setError("Kunde inte hämta klient-ID.");
        }
        setClientId(null);
        return;
      }

      if (data?.id) {
        setClientId(data.id);
      } else {
        setClientId(null);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching client ID:", err);
      setError(getErrorMessage(err));
      setClientId(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchClientId();
    }
  }, [authLoading, fetchClientId]);

  return {
    clientId,
    loading: authLoading || loading,
    error,
    refetch: fetchClientId,
  };
}

