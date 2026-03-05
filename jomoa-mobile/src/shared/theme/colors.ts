/**
 * JOMOA theme colors – Brand Style Guidelines
 * Soft light pink, Warm terracotta, Yellow beige sand, Deep plum brown, Dusty mauve
 * presentation_theme (bold/soft/neutral) ger små varianter i accent och känsla.
 */

import type { ThemeMode } from "../context/ThemeContext";
import type { PresentationTheme } from "../types/onboarding";

const brand = {
  softLightPink: "#FFFBF7",
  warmTerracotta: "#D96D46",
  terracottaLighter: "#FDB499",
  yellowBeigeSand: "#FEE7AB",
  deepPlumBrown: "#462324",
  deepPlumBrownLighter: "#976568",
  dustyMauve: "#5E3F50",
  dustyMauveLighter: "#F0D6D7",
};

type ColorSet = {
  background: string;
  card: string;
  surface3: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentPressed: string;
  borderSoft: string;
  success: string;
  warning: string;
  error: string;
  lightPeach?: string;
};

const darkBase: ColorSet = {
  background: brand.deepPlumBrown,
  card: "#5A2D2E",
  surface3: "#6E3F41",
  textPrimary: brand.yellowBeigeSand,
  textSecondary: brand.deepPlumBrownLighter,
  accent: brand.warmTerracotta,
  accentHover: brand.terracottaLighter,
  accentPressed: "#C45D36",
  borderSoft: "rgba(254, 231, 171, 0.15)",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
};

const lightBase: ColorSet = {
  background: brand.softLightPink,
  card: "#FFF5F0",
  surface3: brand.dustyMauveLighter,
  lightPeach: brand.dustyMauveLighter,
  textPrimary: brand.deepPlumBrown,
  textSecondary: brand.deepPlumBrownLighter,
  accent: brand.warmTerracotta,
  accentHover: brand.terracottaLighter,
  accentPressed: "#C45D36",
  borderSoft: "rgba(70, 35, 36, 0.12)",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
};

// Neutral = baseline
const dark = { ...darkBase } as const;
const light = { ...lightBase } as const;

// Bold = kraftfullare accent, något mörkare
const darkBold: ColorSet = {
  ...darkBase,
  accent: "#B84F28",
  accentHover: "#E07A52",
  accentPressed: "#9E4520",
  card: "#522829",
};
const lightBold: ColorSet = {
  ...lightBase,
  accent: "#C45D36",
  accentHover: "#E88B6A",
  accentPressed: "#A84D28",
  card: "#FFEDE8",
};

// Soft = mjukare accent, ljusare
const darkSoft: ColorSet = {
  ...darkBase,
  accent: "#E07A52",
  accentHover: "#F0A88A",
  accentPressed: "#D96D46",
  surface3: "#634445",
};
const lightSoft: ColorSet = {
  ...lightBase,
  accent: "#E89B7A",
  accentHover: "#F5C4AD",
  accentPressed: "#D96D46",
  surface3: "#FAEDEA",
  card: "#FFF9F7",
};

export function getThemeColors(
  theme: ThemeMode,
  presentationTheme: PresentationTheme = "neutral"
): typeof light {
  if (theme === "light") {
    if (presentationTheme === "bold") return lightBold as typeof light;
    if (presentationTheme === "soft") return lightSoft as typeof light;
    return light;
  }
  if (presentationTheme === "bold") return darkBold as typeof light;
  if (presentationTheme === "soft") return darkSoft as typeof light;
  return dark as typeof light;
}
