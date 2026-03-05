import React from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

import { Screen } from "./Screen";
import { AppText } from "./AppText";
import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../theme/colors";

export interface LoadingScreenProps {
  message?: string;
}

/**
 * LoadingScreen - Consistent loading state across all screens
 *
 * Use when data is being fetched. Pair with ErrorState for error handling.
 */
export function LoadingScreen({ message = "Laddar..." }: LoadingScreenProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <Screen padded centered>
      <YStack alignItems="center" gap="$3">
        <ActivityIndicator size="large" color={colors.accent} />
        <AppText variant="body" color="$colorSecondary">
          {message}
        </AppText>
      </YStack>
    </Screen>
  );
}
