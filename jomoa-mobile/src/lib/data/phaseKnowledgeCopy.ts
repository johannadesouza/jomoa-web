/**
 * UI copy for phase knowledge module
 * No hardcoded strings in components – use these keys
 */

export const PHASE_KNOWLEDGE_COPY = {
  homeSectionTitle: "Cykelfas idag",
  homeTapForMore: (phaseLabel: string) => `Tryck för mer om ${phaseLabel}`,
  cycleInsightsTitle: "Cykelfaskunskap",
  cycleInsightsSubtitle: "Vad din fas innebär för träning, återhämtning och kost",
  currentPhase: "Din nuvarande fas",
  noPhaseData: "Logga period för att se fasbaserade insikter",
} as const;
