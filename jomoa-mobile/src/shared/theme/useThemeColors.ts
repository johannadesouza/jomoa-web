/**
 * Hook som returnerar tema-färger med presentation_theme (bold/soft/neutral).
 * Under onboarding används ThemePreviewContext (förhandsgranskning); annars client.
 */

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useThemePreview } from "../context/ThemePreviewContext";
import { getThemeColors } from "./colors";

export function useThemeColors() {
  const { theme } = useTheme();
  const preview = useThemePreview();
  const { client } = useAuth();
  const presentationTheme = preview ?? client?.presentation_theme ?? "neutral";
  return getThemeColors(theme, presentationTheme);
}
