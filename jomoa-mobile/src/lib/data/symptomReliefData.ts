/**
 * Symptom relief content – specifika tips per symtom
 */
export type SymptomId = "trötthet" | "uppblåsthet" | "energi" | "sömn";

export interface SymptomRelief {
  id: SymptomId;
  label: string;
  icon: string;
  headline: string;
  tips: string[];
}

export const SYMPTOM_RELIEF: Record<SymptomId, SymptomRelief> = {
  trötthet: {
    id: "trötthet",
    label: "Trötthet",
    icon: "😴",
    headline: "Tips vid trötthet",
    tips: [
      "Kort promenad eller lätt stretching kan ge ny energi.",
      "Regelbundna mellanmål med protein och komplexa kolhydrater.",
      "Magnesium och B-vitaminer kan stödja energinivån.",
      "Prioritera sömn – även kort power nap kan hjälpa.",
      "Koffein först efter frukost, inte på tom mage.",
    ],
  },
  uppblåsthet: {
    id: "uppblåsthet",
    label: "Uppblåsthet",
    icon: "🫧",
    headline: "Tips vid uppblåsthet",
    tips: [
      "Minska saltintag och processad mat.",
      "Magnesium kan hjälpa mot vätskeansamling.",
      "Drick tillräckligt med vatten.",
      "Lätt stretching och promenad stimulerar matsmältningen.",
      "Undvik kolsyrade drycker under perioder med uppblåsthet.",
    ],
  },
  energi: {
    id: "energi",
    label: "Energi: Låg",
    icon: "😩",
    headline: "Tips vid låg energi",
    tips: [
      "Promenad, stretching eller regelbundna mellanmål kan hjälpa.",
      "Proteinrik frukost och balanserade mellanmål.",
      "Järnrik kost vid blödning – stödjer energin.",
      "Anpassa träningen – lättare pass eller extra vila.",
      "Prioritera sömn och stresshantering.",
    ],
  },
  sömn: {
    id: "sömn",
    label: "Sömn",
    icon: "🌙",
    headline: "Tips för bättre sömn",
    tips: [
      "Prioritera regelbunden sovrutin.",
      "Magnesium kan stödja sömnkvaliteten.",
      "Undvik koffein efter lunch.",
      "Skärmfri tid minst 30 min före läggdags.",
      "Lätt stretching eller andningsövningar innan sänggåendet.",
    ],
  },
};
