/**
 * Favoritpass – synk med client_favorites
 */
import { supabase } from "../../config/supabase";
import { isDemoMode } from "../demo/demoMode";

export interface ClientFavorite {
  id: string;
  client_id: string;
  program_session_id: string;
  created_at: string;
}

export async function fetchFavorites(clientId: string): Promise<string[]> {
  // #region agent log
  fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H5',location:'favoritesService.ts:fetchFavorites',message:'enter',data:{clientIdPresent:!!clientId,isDemoMode:isDemoMode()},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (isDemoMode()) return [];
  const { data, error } = await supabase
    .from("client_favorites")
    .select("program_session_id")
    .eq("client_id", clientId);

  if (error) {
    console.error("fetchFavorites:", error);
    return [];
  }

  return (data || []).map((r) => r.program_session_id);
}

export async function addFavorite(
  clientId: string,
  programSessionId: string
): Promise<{ error: Error | null }> {
  if (isDemoMode()) return { error: new Error("Demo: favoriter är read-only") };
  const { error } = await supabase.from("client_favorites").insert({
    client_id: clientId,
    program_session_id: programSessionId,
  });

  if (error) {
    console.error("addFavorite:", error);
    return { error };
  }
  return { error: null };
}

export async function removeFavorite(
  clientId: string,
  programSessionId: string
): Promise<{ error: Error | null }> {
  if (isDemoMode()) return { error: new Error("Demo: favoriter är read-only") };
  const { error } = await supabase
    .from("client_favorites")
    .delete()
    .eq("client_id", clientId)
    .eq("program_session_id", programSessionId);

  if (error) {
    console.error("removeFavorite:", error);
    return { error };
  }
  return { error: null };
}

export async function toggleFavorite(
  clientId: string,
  programSessionId: string,
  isCurrentlyFavorite: boolean
): Promise<{ isFavorite: boolean; error: Error | null }> {
  if (isCurrentlyFavorite) {
    const { error } = await removeFavorite(clientId, programSessionId);
    return { isFavorite: false, error };
  } else {
    const { error } = await addFavorite(clientId, programSessionId);
    return { isFavorite: error === null, error };
  }
}
