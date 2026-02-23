/**
 * JOMOA theme colors – Brand Style Guidelines
 * Soft light pink, Warm terracotta, Yellow beige sand, Deep plum brown, Dusty mauve
 */

import type { ThemeMode } from "../context/ThemeContext";

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

const dark = {
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
} as const;

const light = {
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
} as const;

export function getThemeColors(theme: ThemeMode) {
  return theme === "light" ? light : dark;
}

/** @deprecated Use getThemeColors(useTheme().theme) for theme-aware colors */
export const themeColors = dark;
