/**
 * Bakåtkompatibel alias för userClient.
 * Alla services som importerar { supabase } härifrån får User DB-klienten.
 */
export { userClient as supabase } from "../lib/supabase/userClient";
