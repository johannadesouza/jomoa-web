/**
 * AppIcon – Ionicons wrapper med tema
 */
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../theme/colors";

export type AppIconName = keyof typeof Ionicons.glyphMap;

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 24, color }: AppIconProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const iconColor = color ?? colors.textPrimary;
  return <Ionicons name={name} size={size} color={iconColor} />;
}
