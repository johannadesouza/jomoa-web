/**
 * Error boundary for React – catches render errors and shows fallback UI
 * instead of white screen. Used at app root for TestFlight stability.
 */
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { AppButton } from "./AppButton";
import { YStack } from "tamagui";
import { getThemeColors } from "../theme/colors";
import { useTheme } from "../context/ThemeContext";

interface Props {
  children: ReactNode;
  /** Optional fallback; if not provided uses default message + reload hint */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: colors.background }}>
      <YStack alignItems="center" gap="$4" maxWidth={320}>
        <AppText variant="h3" center>
          Något gick fel
        </AppText>
        <AppText variant="body" muted center>
          Vi kunde inte ladda denna del av appen. Försök igen eller starta om appen.
        </AppText>
        <AppButton variant="primary" onPress={reset}>
          Försök igen
        </AppButton>
      </YStack>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn("[ErrorBoundary]", error?.message, errorInfo?.componentStack);
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultFallback error={this.state.error} reset={this.reset} />
      );
    }
    return this.props.children;
  }
}
