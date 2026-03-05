/**
 * Pure: vilken insight-template nyckel som ska användas för given input.
 * Används av insightService för att hämta copy från Content DB.
 */

export interface InsightInput {
  phase: string | null;
  cycleDay: number | null;
  readinessTier: "high" | "medium" | "low" | null;
  energyLevel: number | null;
  hasSymptoms: boolean;
}

/**
 * Returnerar en stabil template_key för Content DB (insight_templates).
 * T.ex. "menstruation_low", "follicular_high", "luteal_medium", "no_phase_low", "default".
 * När användaren inte har cykelspårning (mode !== regular) är phase null – då används
 * no_phase_* eller default, så vi visar inte cykelfas-specifika insikter.
 */
export function getInsightTemplateKey(input: InsightInput): string {
  const { phase, readinessTier, energyLevel } = input;
  const tier = readinessTier ?? "medium";

  if (phase === "menstruation") {
    if (energyLevel != null && energyLevel <= 4) return "menstruation_low";
    return "menstruation_default";
  }
  if (phase === "follicular") return `follicular_${tier}`;
  if (phase === "ovulation") return `ovulation_${tier}`;
  if (phase === "luteal") {
    if (readinessTier === "low" || (energyLevel != null && energyLevel <= 4)) return "luteal_low";
    return "luteal_default";
  }
  if (readinessTier === "low") return "no_phase_low";
  if (readinessTier === "high") return "no_phase_high";
  return "default";
}
