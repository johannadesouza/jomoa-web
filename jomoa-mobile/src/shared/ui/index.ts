/**
 * JOMOA Design System - Shared UI Components
 *
 * All components follow design-standards.md and engineering-standards.md:
 * - No hardcoded values
 * - Use theme tokens only
 * - Consistent spacing, typography, colors
 * - Accessible (44px min tap targets, AA contrast)
 */

// Layout
export { Screen } from "./Screen";
export { Section } from "./Section";
export { Divider } from "./Divider";

// Content
export { Card } from "./Card";
export { Badge } from "./Badge";

// Typography
export {
  AppText,
  H1,
  H2,
  H3,
  BodyText,
  SmallText,
  Caption,
} from "./AppText";

// Forms
export { AppButton } from "./AppButton";
export { AppInput } from "./AppInput";

// Demo
export { DemoPersonaOverlay } from "./DemoPersonaOverlay";

// Content cards
export { InsightCard } from "./InsightCard";
export { LockIcon } from "./LockIcon";
export { AppIcon } from "./AppIcon";
export type { AppIconName } from "./AppIcon";

// States
export { LoadingScreen } from "./LoadingScreen";
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export { DataScreen } from "./DataScreen";
export { ErrorBoundary } from "./ErrorBoundary";

// Types
export type { ScreenProps } from "./Screen";
export type { SectionProps } from "./Section";
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from "./Card";
export type { BadgeProps } from "./Badge";
export type { AppTextProps } from "./AppText";
export type { AppButtonProps } from "./AppButton";
export type { AppInputProps } from "./AppInput";
export type { LoadingScreenProps } from "./LoadingScreen";
export type { EmptyStateProps } from "./EmptyState";
export type { ErrorStateProps } from "./ErrorState";
export type { DataScreenProps } from "./DataScreen";
export type { DividerProps } from "./Divider";
