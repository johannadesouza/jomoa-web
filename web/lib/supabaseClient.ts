/**
 * @deprecated Använd contentClient från "./contentClient" istället.
 * Denna fil är ett legacy-alias under FAS 2 och tas bort i FAS 3.
 *
 * web/ har ALDRIG tillgång till User DB – alla queries här är mot content.
 */
export { contentClient as supabase } from "./contentClient";

