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
  libidoPattern: string[];
  enjoymentFocus: string[];
  lifestyleTips: string[];
}

/** Section labels for UI – no hardcoded strings */
export const PHASE_SECTION_LABELS = {
  physiology: "Hormoner & fysiologi",
  commonPatterns: "Vanliga mönster",
  trainingFocus: "Träning",
  recoveryFocus: "Återhämtning",
  nutritionFocus: "Kost",
  socialEnergyPattern: "Social energi",
  cautionFlags: "Att tänka på",
  libidoPattern: "Sex & intimitet",
  enjoymentFocus: "Njutning & välmående",
  lifestyleTips: "Livsstil",
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
    libidoPattern: [
      "Lusten kan variera – lyssna på vad som känns rätt för dig.",
      "Många känner sig mindre i humör för sex under mens – helt normalt.",
    ],
    enjoymentFocus: [
      "Lugn rörelse, stretching eller en promenad kan kännas skönt.",
      "Filmkväll, mysiga kläder och varm dryck.",
      "Ta det lugnt – det är okej att vila.",
    ],
    lifestyleTips: [
      "Prioritera sömn och extra vila de första dagarna.",
      "Planera lite lugnare vecka om möjligt.",
      "Håll dig hydrerad – särskilt vid blödning.",
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
    libidoPattern: [
      "Östrogen stiger – många upplever ökad lust i denna fas.",
      "Bra tid för intimitet om det känns rätt för dig.",
    ],
    enjoymentFocus: [
      "Bra fas för nya aktiviteter och utmaningar.",
      "Sociala träffar och träningskamrater brukar kännas bra.",
      "Passa på energi och motivation.",
    ],
    lifestyleTips: [
      "Utnytja den goda energin – planera träning och sociala aktiviteter.",
      "Sömn brukar vara god – bibehåll rutiner.",
      "Bra tid för projekt och fokusarbete.",
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
    libidoPattern: [
      "Kan variera – vissa vill ha mer närhet, andra mer avstånd.",
      "Lyssna på kroppen – både behov av intimitet och ensamtid är normalt.",
    ],
    enjoymentFocus: [
      "Mysiga aktiviteter – film, bok, varm dryck.",
      "Lugnare träning eller stretching kan kännas bra.",
      "Mys med vänner eller partner på dina villkor.",
    ],
    lifestyleTips: [
      "Prioritera sömn – återhämtning tar längre tid i luteal.",
      "Stresshantering – andning, promenad, mindre krav på dig själv.",
      "Planera mer vila mellan pass och aktiviteter.",
    ],
  },
};
