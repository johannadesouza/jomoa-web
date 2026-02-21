import React from "react";
import { YStack, styled, GetProps } from "tamagui";
import { AppText } from "./AppText";
import { AppButton } from "./AppButton";

function RetryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AppButton variant="secondary" onPress={onPress} marginTop="$2">
      {label}
    </AppButton>
  );
}

/**
 * ErrorState - Display when an error occurs
 *
 * From design-standards.md:
 * - Use shared components from components/ui/
 * - Consistent spacing and typography
 * - User-facing errors should be friendly and actionable
 *
 * From engineering-standards.md:
 * - User-facing errors should be friendly and actionable
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 */

const ErrorStateContainer = styled(YStack, {
  name: "ErrorState",
  alignItems: "center",
  justifyContent: "center",
  padding: "$8", // 32px
  gap: "$4", // 16px
});

const ErrorStateIcon = styled(YStack, {
  name: "ErrorStateIcon",
  width: "$16", // 64px
  height: "$16", // 64px
  borderRadius: "$full",
  backgroundColor: "$error",
  opacity: 0.1,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "$2",
});

const ErrorStateTitle = styled(AppText, {
  name: "ErrorStateTitle",
  variant: "h3",
  textAlign: "center",
});

const ErrorStateDescription = styled(AppText, {
  name: "ErrorStateDescription",
  variant: "body",
  textAlign: "center",
  color: "$colorSecondary",
  maxWidth: 280,
});

export type ErrorStateProps = GetProps<typeof ErrorStateContainer> & {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

/**
 * ErrorState - Display when an error occurs
 *
 * @example
 * <ErrorState
 *   title="Något gick fel"
 *   description="Vi kunde inte hämta dina data. Försök igen."
 *   retryLabel="Försök igen"
 *   onRetry={() => refetch()}
 * />
 */
export function ErrorState({
  title = "Något gick fel",
  description = "Ett oväntat fel uppstod. Försök igen senare.",
  retryLabel = "Försök igen",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <ErrorStateContainer {...props}>
      <ErrorStateIcon>
        <AppText variant="h1">!</AppText>
      </ErrorStateIcon>
      <ErrorStateTitle>{title}</ErrorStateTitle>
      <ErrorStateDescription>{description}</ErrorStateDescription>
      {onRetry && <RetryButton label={retryLabel} onPress={onRetry} />}
    </ErrorStateContainer>
  );
}

