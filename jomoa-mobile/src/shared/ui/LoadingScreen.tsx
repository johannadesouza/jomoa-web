import React from "react";

import { Screen } from "./Screen";
import { AppText } from "./AppText";

export interface LoadingScreenProps {
  message?: string;
}

/**
 * LoadingScreen - Consistent loading state across all screens
 *
 * Use when data is being fetched. Pair with ErrorState for error handling.
 */
export function LoadingScreen({ message = "Laddar..." }: LoadingScreenProps) {
  return (
    <Screen padded centered>
      <AppText variant="body" color="$colorSecondary">
        {message}
      </AppText>
    </Screen>
  );
}
