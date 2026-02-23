import { config as defaultConfig } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";
import { createTokens, createFont } from "@tamagui/core";
import { createInterFont } from "@tamagui/font-inter";

// =============================================================================
// JOMOA DESIGN TOKENS – Brand Style Guidelines
// =============================================================================

// Brand colors (Style guidelines)
const brandColors = {
  softLightPink: "#FFFBF7",
  warmTerracotta: "#D96D46",
  terracottaLighter: "#FDB499",
  yellowBeigeSand: "#FEE7AB",
  deepPlumBrown: "#462324",
  deepPlumBrownLighter: "#976568",
  dustyMauve: "#5E3F50",
  dustyMauveLighter: "#F0D6D7",
};

const accentColors = {
  warmTerracotta: brandColors.warmTerracotta,
  accentHover: brandColors.terracottaLighter,
  accentPressed: "#C45D36",
};

const lightPalette = {
  creamBg: brandColors.softLightPink,
  creamCard: "#FFF5F0",
  lightPeach: brandColors.dustyMauveLighter,
  warmGray: "#F5EBE8",
  warmBrown: "#462324",
  warmBrownMuted: brandColors.deepPlumBrownLighter,
};

const colors = {
  deepPlumBlack: brandColors.deepPlumBrown,
  warmCharcoal: "#5A2D2E",
  surface3: "#6E3F41",
  softLight: "#FEE7AB",
  mutedWarm: brandColors.deepPlumBrownLighter,
  ...accentColors,
  ...lightPalette,
  ...brandColors,
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
  borderSoft: "rgba(254, 231, 171, 0.15)",
  borderStrong: "rgba(254, 231, 171, 0.25)",
  transparent: "transparent",
} as const;

const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  true: 16,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const size = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  true: 48,
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 64,
} as const;

const radius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  true: 12,
  full: 9999,
} as const;

const fontSize = {
  1: 12,
  2: 14,
  3: 16,
  4: 20,
  5: 24,
  6: 28,
  7: 32,
  8: 36,
  9: 40,
  true: 16,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

const lineHeight = {
  1: 16,
  2: 20,
  3: 22,
  4: 26,
  5: 32,
  6: 40,
  7: 44,
  8: 48,
  true: 22,
} as const;

const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
} as const;

const tokens = createTokens({
  color: {
    ...defaultConfig.tokens.color,
    ...colors,
  },
  space,
  size,
  radius,
  zIndex,
});

const interFont = createInterFont({
  size: {
    ...fontSize,
    1: 12,
    2: 14,
    3: 16,
    4: 20,
    5: 24,
    6: 28,
    7: 32,
    8: 36,
    9: 40,
    10: 44,
    11: 48,
    12: 52,
    13: 56,
    14: 60,
    15: 64,
    16: 68,
    true: 16,
  },
  lineHeight: {
    ...lineHeight,
    1: 16,
    2: 20,
    3: 22,
    4: 26,
    5: 32,
    6: 40,
    7: 44,
    8: 48,
    9: 52,
    10: 56,
    11: 60,
    12: 64,
    13: 68,
    14: 72,
    15: 76,
    16: 80,
    true: 22,
  },
  weight: {
    1: "400",
    2: "500",
    3: "600",
    4: "700",
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
    3: -1,
  },
  face: {
    400: { normal: "Inter" },
    500: { normal: "Inter" },
    600: { normal: "Inter" },
    700: { normal: "Inter" },
  },
});

const cormorantFont = createFont({
  family: "Cormorant_600SemiBold",
  size: { ...fontSize },
  lineHeight: { ...lineHeight },
  weight: { 600: "600" },
  letterSpacing: { 1: 0 },
  face: {
    600: { normal: "Cormorant_600SemiBold" },
  },
});

const jomoaDarkTheme = {
  background: colors.deepPlumBlack,
  backgroundHover: colors.warmCharcoal,
  backgroundFocus: colors.warmCharcoal,
  backgroundPress: colors.surface3,
  backgroundStrong: colors.surface3,
  backgroundTransparent: colors.transparent,
  surface3: colors.surface3,
  color: colors.softLight,
  colorHover: colors.softLight,
  colorFocus: colors.softLight,
  colorPress: colors.softLight,
  colorSecondary: colors.mutedWarm,
  colorTransparent: "rgba(254, 231, 171, 0)",
  textPrimary: colors.softLight,
  textSecondary: colors.mutedWarm,
  borderColor: colors.borderSoft,
  borderColorHover: colors.borderStrong,
  borderColorFocus: colors.warmTerracotta,
  borderColorPress: colors.borderStrong,
  borderSoft: colors.borderSoft,
  borderStrong: colors.borderStrong,
  card: colors.warmCharcoal,
  cardHover: colors.surface3,
  accent: colors.warmTerracotta,
  accentHover: colors.accentHover,
  accentPress: colors.accentPressed,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowColorHover: "rgba(0, 0, 0, 0.4)",
  placeholderColor: colors.mutedWarm,
} as const;

// Light theme – inspo: assets/inspo (Hormona, Jö, Journey)
// Cream, light peach, warm browns
const lightColors = {
  background: lightPalette.creamBg,
  card: lightPalette.creamCard,
  surface3: lightPalette.warmGray,
  cardHighlight: lightPalette.lightPeach,
  textPrimary: lightPalette.warmBrown,
  textSecondary: lightPalette.warmBrownMuted,
};

const jomoaLightTheme = {
  background: lightColors.background,
  backgroundHover: lightColors.surface3,
  backgroundFocus: lightColors.surface3,
  backgroundPress: lightPalette.lightPeach,
  backgroundStrong: lightColors.card,
  backgroundTransparent: "transparent",
  surface3: lightColors.surface3,
  color: lightColors.textPrimary,
  colorHover: lightColors.textPrimary,
  colorFocus: lightColors.textPrimary,
  colorPress: lightColors.textPrimary,
  colorSecondary: lightColors.textSecondary,
  colorTransparent: "rgba(70, 35, 36, 0)",
  textPrimary: lightColors.textPrimary,
  textSecondary: lightColors.textSecondary,
  borderColor: "rgba(70, 35, 36, 0.12)",
  borderColorHover: "rgba(70, 35, 36, 0.18)",
  borderColorFocus: accentColors.warmTerracotta,
  borderColorPress: "rgba(70, 35, 36, 0.18)",
  borderSoft: "rgba(70, 35, 36, 0.12)",
  borderStrong: "rgba(70, 35, 36, 0.18)",
  card: lightColors.card,
  cardHover: lightPalette.lightPeach,
  accent: accentColors.warmTerracotta,
  accentHover: accentColors.accentHover,
  accentPress: accentColors.accentPressed,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  shadowColor: "rgba(0, 0, 0, 0.08)",
  shadowColorHover: "rgba(0, 0, 0, 0.12)",
  placeholderColor: lightColors.textSecondary,
} as const;

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    ...defaultConfig.themes,
    dark: jomoaDarkTheme,
    light: jomoaLightTheme,
  },
  fonts: {
    ...defaultConfig.fonts,
    heading: cormorantFont,
    body: interFont,
  },
  defaultTheme: "dark",
});

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export { tokens, colors, space, size, radius, fontSize, lineHeight };
export default tamaguiConfig;
