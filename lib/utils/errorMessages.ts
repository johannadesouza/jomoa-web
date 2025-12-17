/**
 * Standardiserade felmeddelanden för användare
 * Använd dessa istället för hårdkodade strängar för konsistens
 */

export const ERROR_MESSAGES = {
  // Generella fel
  GENERIC: "Ett oväntat fel uppstod. Försök igen senare.",
  NETWORK: "Nätverksfel. Kontrollera din internetanslutning.",
  UNAUTHORIZED: "Du har inte behörighet att utföra denna åtgärd.",
  NOT_FOUND: "Det du söker efter kunde inte hittas.",
  
  // Data-hämtning
  FETCH_FAILED: "Kunde inte hämta data. Försök igen senare.",
  FETCH_CLIENT_FAILED: "Kunde inte hämta klientdata.",
  FETCH_PROGRAM_FAILED: "Kunde inte hämta träningsprogram.",
  FETCH_EXERCISES_FAILED: "Kunde inte hämta övningar.",
  FETCH_CYCLE_FAILED: "Kunde inte hämta cykeldata.",
  FETCH_WORKOUTS_FAILED: "Kunde inte hämta träningsloggar.",
  FETCH_NUTRITION_FAILED: "Kunde inte hämta näringsdata.",
  FETCH_NOTIFICATIONS_FAILED: "Kunde inte hämta notiser.",
  
  // Data-sparande
  SAVE_FAILED: "Kunde inte spara data. Försök igen senare.",
  CREATE_FAILED: "Kunde inte skapa. Försök igen senare.",
  UPDATE_FAILED: "Kunde inte uppdatera. Försök igen senare.",
  DELETE_FAILED: "Kunde inte ta bort. Försök igen senare.",
  
  // Validering
  VALIDATION_FAILED: "Vänligen kontrollera att alla fält är korrekt ifyllda.",
  REQUIRED_FIELD: "Detta fält är obligatoriskt.",
  INVALID_EMAIL: "Ogiltig e-postadress.",
  INVALID_DATE: "Ogiltigt datum.",
  
  // Specifika funktioner
  LOGIN_FAILED: "Inloggning misslyckades. Kontrollera dina uppgifter.",
  LOGOUT_FAILED: "Utloggning misslyckades.",
  INVITE_FAILED: "Kunde inte skicka inbjudan.",
  ASSIGNMENT_FAILED: "Kunde inte tilldela program.",
} as const;

/**
 * Hjälpfunktion för att få ett felmeddelande baserat på error code
 */
export function getErrorMessageByCode(code: string | undefined): string {
  switch (code) {
    case "PGRST116": // No rows returned
      return ERROR_MESSAGES.NOT_FOUND;
    case "23505": // Unique violation
      return "Detta värde finns redan. Vänligen välj ett annat.";
    case "23503": // Foreign key violation
      return "Detta värde kan inte användas eftersom det är kopplat till annan data.";
    case "42501": // Insufficient privilege
      return ERROR_MESSAGES.UNAUTHORIZED;
    default:
      return ERROR_MESSAGES.GENERIC;
  }
}

/**
 * Kombinerar getErrorMessage från normalizeSupabase med standardiserade meddelanden
 */
export function getUserFriendlyErrorMessage(error: unknown, fallback?: string): string {
  // Först försök få standardiserat meddelande från error code
  if (typeof error === "object" && error !== null && "code" in error) {
    const codeMessage = getErrorMessageByCode(error.code as string);
    if (codeMessage !== ERROR_MESSAGES.GENERIC) {
      return codeMessage;
    }
  }
  
  // Annars använd fallback eller generiskt meddelande
  return fallback || ERROR_MESSAGES.GENERIC;
}

