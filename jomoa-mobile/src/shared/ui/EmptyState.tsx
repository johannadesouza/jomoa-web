import React from "react";
import { YStack, styled, GetProps } from "tamagui";
import { AppText } from "./AppText";
import { AppButton } from "./AppButton";

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AppButton variant="primary" onPress={onPress} marginTop="$2">
      {label}
    </AppButton>
  );
}

function IconWrapper({ icon, IconContainer }: { icon: React.ReactNode; IconContainer: React.ComponentType<{ children: React.ReactNode }> }) {
  if (!icon) return null;
  return <IconContainer>{icon}</IconContainer>;
}

function DescriptionWrapper({ description, DescriptionComponent }: { description?: string; DescriptionComponent: React.ComponentType<{ children: React.ReactNode }> }) {
  if (!description) return null;
  return <DescriptionComponent>{description}</DescriptionComponent>;
}

/**
 * EmptyState - Display when content is empty
 *
 * From design-standards.md:
 * - Use shared components from components/ui/
 * - Consistent spacing and typography
 * - Clear, actionable messaging
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 */

const EmptyStateContainer = styled(YStack, {
  name: "EmptyState",
  alignItems: "center",
  justifyContent: "center",
  padding: "$8", // 32px
  gap: "$4", // 16px
});

const EmptyStateIcon = styled(YStack, {
  name: "EmptyStateIcon",
  width: "$16", // 64px
  height: "$16", // 64px
  borderRadius: "$full",
  backgroundColor: "$backgroundStrong",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "$2",
});

const EmptyStateTitle = styled(AppText, {
  name: "EmptyStateTitle",
  variant: "h3",
  textAlign: "center",
});

const EmptyStateDescription = styled(AppText, {
  name: "EmptyStateDescription",
  variant: "body",
  textAlign: "center",
  color: "$colorSecondary",
  maxWidth: 280,
});

export type EmptyStateProps = GetProps<typeof EmptyStateContainer> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * EmptyState - Display when content is empty
 *
 * @example
 * <EmptyState
 *   title="Inga pass ännu"
 *   description="Välj ett program för att komma igång med din träning."
 *   actionLabel="Välj program"
 *   onAction={() => navigate('Programs')}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  ...props
}: EmptyStateProps) {
  return (
    <EmptyStateContainer {...props}>
      <IconWrapper icon={icon} IconContainer={EmptyStateIcon} />
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <DescriptionWrapper description={description} DescriptionComponent={EmptyStateDescription} />
      {actionLabel && onAction && (
        <ActionButton label={actionLabel} onPress={onAction} />
      )}
    </EmptyStateContainer>
  );
}

