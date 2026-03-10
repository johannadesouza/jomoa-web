/**
 * userRepo/clients – uppdatering av clients (User DB).
 * UI anropar dessa funktioner istället för att använda Supabase direkt.
 */
import { userClient } from "../../supabase/userClient";

import type { PostgrestError } from "@supabase/supabase-js";

export interface UpdateClientResult {
  error: PostgrestError | null;
}

/**
 * Uppdaterar en eller flera fält på client. Returnerar error om något gick fel.
 */
export async function updateClient(
  clientId: string,
  data: Record<string, unknown>
): Promise<UpdateClientResult> {
  const { error } = await userClient
    .from("clients")
    .update(data)
    .eq("id", clientId);

  return { error };
}
