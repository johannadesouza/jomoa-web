/**
 * adaptationLabels – delad text för adaptation engine (rule-etiketter, rubriker, volym).
 * Används av AdaptationInsightCard och MorningRoutineModal så att ändringar görs på ett ställe.
 */

import type { AdaptationResult } from "./types";

/** ruleId → kort mänsklig etikett; kopplar till ruleId i rules/ (cyclePhase, readiness, perimenopause). */
export const RULE_LABELS: Record<string, string> = {
  menstruation_deload: "Mensfas med låg energi",
  menstruation_volume: "Mensfas – skonsam dag",
  luteal_volume: "Lutealfas med låg energi",
  follicular_overload: "Follikulär fas + bra dagsform",
  ovulation_overload: "Ägglossning + toppform",
  ovulation_intensity: "Ägglossning – hög kapacitet",
  high_stress_recovery: "Hög stress + låg energi",
  poor_sleep_volume: "Dålig sömn + låg energi",
  poor_sleep: "Dålig sömn",
  high_soreness: "Ömhet + låg energi",
  soreness: "Hög muskelömhet",
  high_load_recovery: "Hög veckobelastning",
  moderate_load_recovery: "Ökad veckobelastning",
  peri_hot_flash_energy_crash: "Värmevallningar + energikrasch",
  peri_single_symptom: "Symtom idag",
  peri_sleep_disruption: "Sömnproblem",
  peri_joint_stiffness: "Ledvärk",
};

/**
 * Returnerar mänsklig rubrik utifrån adaptation-resultat (samma logik som AdaptationInsightCard).
 * Kan användas med volumeModifier + appliedRules + suggestRecovery för MorningRoutineModal.
 */
export function getAdaptationHeadline(adaptation: AdaptationResult): string {
  const { volumeModifier, suggestDeload, suggestRecovery, appliedRules } = adaptation;
  const topRule = appliedRules[0] ?? "";

  if (suggestRecovery || (suggestDeload && volumeModifier <= 0.7)) {
    return "Kroppen behöver återhämtning idag";
  }

  if (volumeModifier >= 1.1) {
    if (topRule.includes("follicular") || topRule.includes("ovulation")) {
      return "Du är i toppskick – passa på";
    }
    return "Bra dag att pusha lite extra";
  }

  if (volumeModifier >= 1.0) {
    return "Du är i bra form idag";
  }

  if (volumeModifier >= 0.9) {
    if (topRule.includes("menstruation")) return "Lite lugnare idag – det är klokt";
    if (topRule.includes("sleep")) return "Sömnen påverkar – spara lite kraft";
    if (topRule.includes("luteal")) return "Kroppen jobbar hårdare nu";
    if (topRule.includes("peri")) return "Lyssna på kroppen idag";
    return "Lite lugnare tempo idag";
  }

  if (topRule.includes("stress")) return "Hög stress – träningen anpassas";
  if (topRule.includes("soreness")) return "Musklerna behöver mer tid";
  return "Kroppen är i återhämtningsläge";
}

/**
 * Rubrik för MorningRoutineModal (tar separata argument istället för AdaptationResult).
 * Logik motsvarar getAdaptationHeadline; tröskel 1.05 för "pusha" för snabb feedback i modalen.
 */
export function getAdaptHeadlineFromParts(
  volumeModifier: number,
  appliedRules: string[],
  suggestRecovery: boolean
): string {
  const topRule = appliedRules[0] ?? "";
  if (suggestRecovery) return "Kroppen behöver återhämtning idag";
  if (volumeModifier >= 1.05) {
    if (topRule.includes("follicular") || topRule.includes("ovulation")) return "Du är i toppskick – passa på";
    return "Bra dag att pusha lite extra";
  }
  if (volumeModifier >= 1.0) return "Du är i bra form idag";
  if (volumeModifier >= 0.9) {
    if (topRule.includes("menstruation")) return "Lite lugnare idag – det är klokt";
    if (topRule.includes("sleep")) return "Sömnen påverkar – spara lite kraft";
    if (topRule.includes("luteal")) return "Kroppen jobbar hårdare nu";
    if (topRule.includes("peri")) return "Lyssna på kroppen idag";
    return "Lite lugnare tempo idag";
  }
  if (topRule.includes("stress")) return "Hög stress – träningen anpassas";
  if (topRule.includes("soreness")) return "Musklerna behöver mer tid";
  return "Kroppen är i återhämtningsläge";
}

/**
 * Volymetikett för visning (t.ex. "+10% volym idag", "20% lättare idag").
 */
export function getVolumeLabel(modifier: number): { text: string; isPositive: boolean } {
  if (modifier === 1.0) return { text: "Normal volym", isPositive: true };
  const pct = Math.round(Math.abs(modifier - 1) * 100);
  if (modifier > 1.0) return { text: `+${pct}% volym idag`, isPositive: true };
  return { text: `${pct}% lättare idag`, isPositive: false };
}
