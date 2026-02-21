/**
 * JOMOA theme colors – single source of truth
 * Use in React Native StyleSheet / inline styles (non-Tamagui).
 * Tamagui components use $token syntax from tamagui.config.
 */

export const themeColors = {
  background: "#141012",
  card: "#1E1A1C",
  surface3: "#2A2426",
  textPrimary: "#EDE8E6",
  textSecondary: "#8A7F7A",
  accent: "#D96D46",
  accentHover: "#E57D56",
  accentPressed: "#C45D36",
  borderSoft: "rgba(237, 232, 230, 0.12)",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
} as const;
