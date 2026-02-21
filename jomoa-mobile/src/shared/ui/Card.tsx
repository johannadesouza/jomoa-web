import { YStack, XStack, styled, GetProps } from "tamagui";
import { AppText } from "./AppText";

/**
 * Card - Content container following JOMOA design standards
 *
 * From design-standards.md:
 * - All cards use bg-warm-charcoal ($card)
 * - Border radius: 12px ($3 / rounded-card)
 * - Padding: 24px ($6) - consistent everywhere
 * - Border: border-soft ($borderColor)
 * - Shadow: subtle
 *
 * Three-Level Hierarchy:
 * 1. Sections - Layout level
 * 2. Cards - Content containers (this component)
 * 3. Components - Reusable UI elements
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 * - Consistent styling across all cards
 */

const CardFrame = styled(YStack, {
  name: "Card",
  backgroundColor: "$card",
  borderRadius: "$3", // 12px (card radius)
  borderWidth: 1,
  borderColor: "$borderColor",
  padding: "$6", // 24px
  
  // Shadow (subtle)
  shadowColor: "$shadowColor",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: "$1", // 4px
  elevation: 2,

  variants: {
    pressable: {
      true: {
        cursor: "pointer",
        pressStyle: {
          backgroundColor: "$cardHover",
          scale: 0.98,
        },
        hoverStyle: {
          backgroundColor: "$cardHover",
        },
      },
    },
    noPadding: {
      true: {
        padding: "$0",
      },
    },
  } as const,
});

const CardHeader = styled(XStack, {
  name: "CardHeader",
  paddingBottom: "$4", // 16px
  alignItems: "center",
  justifyContent: "space-between",
  gap: "$3",
});

const CardTitle = styled(AppText, {
  name: "CardTitle",
  variant: "h3",
});

const CardDescription = styled(AppText, {
  name: "CardDescription",
  variant: "small",
  marginTop: "$1",
});

const CardContent = styled(YStack, {
  name: "CardContent",
  gap: "$3", // 12px
});

const CardFooter = styled(XStack, {
  name: "CardFooter",
  paddingTop: "$4", // 16px
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "$3",
});

// Types
export type CardProps = GetProps<typeof CardFrame>;
export type CardHeaderProps = GetProps<typeof CardHeader>;
export type CardContentProps = GetProps<typeof CardContent>;
export type CardFooterProps = GetProps<typeof CardFooter>;

// Main Card component with sub-components
export function Card({ children, ...props }: CardProps) {
  return <CardFrame {...props}>{children}</CardFrame>;
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
