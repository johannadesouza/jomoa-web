import React from "react";
import { XStack, styled, GetProps } from "tamagui";
import { AppText } from "./AppText";

/**
 * Badge - Small label/chip following JOMOA design standards
 *
 * From design-standards.md:
 * - Border radius: rounded-sm (4px) for badges/chips
 * - Use semantic colors
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 */

const BadgeFrame = styled(XStack, {
  name: "Badge",
  paddingHorizontal: "$3", // 12px
  paddingVertical: "$1", // 4px
  borderRadius: "$1", // 4px (small)
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  variants: {
    variant: {
      default: {
        backgroundColor: "$backgroundStrong",
      },
      accent: {
        backgroundColor: "$accent",
      },
      success: {
        backgroundColor: "$success",
      },
      warning: {
        backgroundColor: "$warning",
      },
      error: {
        backgroundColor: "$error",
      },
      info: {
        backgroundColor: "$info",
      },
      outline: {
        backgroundColor: "$backgroundTransparent",
        borderWidth: 1,
        borderColor: "$borderColor",
      },
    },
    size: {
      sm: {
        paddingHorizontal: "$2", // 8px
        paddingVertical: 2,
      },
      md: {
        paddingHorizontal: "$3", // 12px
        paddingVertical: "$1", // 4px
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type BadgeProps = GetProps<typeof BadgeFrame> & {
  label: string;
};

/**
 * Badge - Small label or status indicator
 *
 * @example
 * <Badge label="Ny" variant="accent" />
 * <Badge label="Klar" variant="success" />
 */
export function Badge({ label, variant = "default", ...props }: BadgeProps) {
  const textColor =
    variant === "outline" || variant === "default" ? "$color" : "$color";

  return (
    <BadgeFrame variant={variant} {...props}>
      <AppText variant="caption" fontWeight="500" color={textColor} numberOfLines={1}>
        {label}
      </AppText>
    </BadgeFrame>
  );
}

