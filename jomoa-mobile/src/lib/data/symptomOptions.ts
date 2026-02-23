/**
 * Symptom options for cycle logging – mood, cravings, bleeding
 */

export const MOOD_OPTIONS = [
  { id: "bra", label: "Bra" },
  { id: "nere", label: "Nere" },
  { id: "irriterad", label: "Irriterad" },
  { id: "kanslig", label: "Känslig" },
  { id: "lugn", label: "Lugn" },
  { id: "osaker", label: "Osäker" },
] as const;

export const CRAVINGS_OPTIONS = [
  { id: "sotsaker", label: "Sötsaker" },
  { id: "salt", label: "Salt" },
  { id: "kolhydrater", label: "Kolhydrater" },
  { id: "ingen", label: "Ingen" },
] as const;

/** bleeding_level: 1–5, 1=ingen/spotting, 5=mycket kraftig */
export const BLEEDING_OPTIONS = [
  { value: 1, label: "Ingen/spotting" },
  { value: 2, label: "Lätt" },
  { value: 3, label: "Medium" },
  { value: 4, label: "Ordentlig" },
  { value: 5, label: "Riktigt stark" },
] as const;
