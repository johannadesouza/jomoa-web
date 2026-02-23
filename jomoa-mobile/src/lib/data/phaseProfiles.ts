/**
 * Phase Profile data – central source for cycle phase knowledge
 * No hardcoded strings in UI; all copy lives here
 */

import type { CyclePhase } from "../utils/cycleUtils";

export interface PhaseProfile {
  phase: Exclude<CyclePhase, null>;
  physiology: string[];
  commonPatterns: string[];
  trainingFocus: string[];
  recoveryFocus: string[];
  nutritionFocus: string[];
  socialEnergyPattern: string[];
  cautionFlags: string[];
}

/** Section labels for UI – no hardcoded strings */
export const PHASE_SECTION_LABELS = {
  physiology: "Fysiologi",
  commonPatterns: "Vanliga mönster",
  trainingFocus: "Träningsfokus",
  recoveryFocus: "Återhämtning",
  nutritionFocus: "Nutrition",
  socialEnergyPattern: "Social energi",
  cautionFlags: "Att tänka på",
} as const;

export const PHASE_PROFILES: Record<Exclude<CyclePhase, null>, PhaseProfile> = {
  menstruation: {
    phase: "menstruation",
    physiology: [
      "Östrogen och progesteron på botten. Kroppen prioriterar återhämtning.",
      "Möjlig lägre smärtgräns och större känslighet för inflammation.",
    ],
    commonPatterns: [
      "Varierande energi – ofta lägre de första dagarna.",
      "Vissa upplever bättre mobilitet och stretching-känsla.",
    ],
    trainingFocus: [
      "Lyssna på kroppen – lätt rörelse eller vila är lika värdefullt.",
      "Promenad, stretching eller lätt styrka om det känns rätt.",
      "Undvik att tvinga intensiv träning om energin är låg.",
    ],
    recoveryFocus: [
      "Prioritera sömn och hydrering.",
      "Extra vila är en investering, inte svaghet.",
    ],
    nutritionFocus: [
      "Energi kan variera – regelbundna mellanmål hjälper.",
      "Järnrik kost kan stödja vid blodförlust.",
    ],
    socialEnergyPattern: [
      "Social energi varierar – det är normalt att behöva mer ensamtid.",
    ],
    cautionFlags: [
      "Intensiv träning vid kraftig blödning kan kännas fel.",
    ],
  },

  follicular: {
    phase: "follicular",
    physiology: [
      "Östrogen stiger, energi och uthållighet ökar ofta.",
      "Kroppen återhämtar sig lättare – bra tillfälle för progression.",
    ],
    commonPatterns: [
      "Ofta ökad motivation och fokus.",
      "Muskler kan kännas starkare och mer responsiva.",
    ],
    trainingFocus: [
      "Utmärkt fas för tyngre lyft och högre intensitet.",
      "Prova nya övningar eller öka volym försiktigt.",
      "Högintensiv träning tolereras ofta bättre.",
    ],
    recoveryFocus: [
      "Återhämtning brukar gå snabbare – passa på att träna regelbundet.",
    ],
    nutritionFocus: [
      "Kroppens proteinomsättning kan vara effektivare – bra tid för muskelfokus.",
    ],
    socialEnergyPattern: [
      "Ofta mer utåtriktad energi – bra tid för träningskamrater eller gruppträning.",
    ],
    cautionFlags: [
      "Överdriv inte – progression ska vara gradvis även i bra faser.",
    ],
  },

  ovulation: {
    phase: "ovulation",
    physiology: [
      "Östrogen och testosteron toppar – högsta energin ofta här.",
      "Kroppens koordination och kraftprestation kan vara optimal.",
    ],
    commonPatterns: [
      "Peak energi och koncentration hos många.",
      "Bra dagar för prestationsfokuserad träning.",
    ],
    trainingFocus: [
      "Utmana dig med hög intensitet eller nya PR-försök.",
      "Spar dina tyngsta pass hit om möjligt.",
      "Teknik och koordination brukar kännas bra.",
    ],
    recoveryFocus: [
      "Kroppen klarar mer – men vila fortsatt viktig mellan pass.",
    ],
    nutritionFocus: [
      "Full näringsintag stödjer både träning och hormonbalans.",
    ],
    socialEnergyPattern: [
      "Social energi ofta hög – bra för samträning och samarbete.",
    ],
    cautionFlags: [
      "Vissa kan vara mer känsliga för skador – värma upp ordentligt.",
    ],
  },

  luteal: {
    phase: "luteal",
    physiology: [
      "Progesteron stiger, östrogen sjunker – energin kan variera mer.",
      "Kroppens vätskeömsättning och aptit kan förändras.",
    ],
    commonPatterns: [
      "Energin kan vara mer variabel, särskilt i sen luteal.",
      "Vissa upplever mer värme vid träning.",
    ],
    trainingFocus: [
      "Behåll teknik och struktur – justera volym om energin sjunker.",
      "Längre uppvärmning kan kännas bra.",
      "Fokusera på vad som känns hållbart, inte prestation.",
    ],
    recoveryFocus: [
      "Återhämtning tar ofta längre tid – planera mer vila mellan pass.",
      "Prioritera sömn och stresshantering.",
    ],
    nutritionFocus: [
      "Aptit kan öka – regelbundna måltider hjälper.",
      "Magnesium och B-vitaminer kan stödja humör och energi.",
    ],
    socialEnergyPattern: [
      "Behov av ensamtid kan öka – lyssna på vad som känns rätt.",
    ],
    cautionFlags: [
      "Undvik att tvinga intensiv träning vid låg energi.",
    ],
  },
};
