/**
 * LockIcon – Fas D, premium/låst innehåll
 */
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../theme/colors";

interface LockIconProps {
  size?: number;
}

export function LockIcon({ size = 16 }: LockIconProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return <Ionicons name="lock-closed" size={size} color={colors.textSecondary} />;
}
