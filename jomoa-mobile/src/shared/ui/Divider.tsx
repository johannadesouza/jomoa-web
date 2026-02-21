import { YStack, XStack, styled, GetProps } from "tamagui";

/**
 * Divider - Visual separator following JOMOA design standards
 *
 * Rules:
 * - Use border-soft color
 * - No hardcoded values
 * - Use theme tokens only
 */

const HorizontalDivider = styled(YStack, {
  name: "Divider",
  height: 1,
  backgroundColor: "$borderColor",
  width: "100%",

  variants: {
    spacing: {
      none: {},
      sm: {
        marginVertical: "$2", // 8px
      },
      md: {
        marginVertical: "$4", // 16px
      },
      lg: {
        marginVertical: "$6", // 24px
      },
    },
  } as const,

  defaultVariants: {
    spacing: "md",
  },
});

const VerticalDivider = styled(XStack, {
  name: "VerticalDivider",
  width: 1,
  backgroundColor: "$borderColor",
  height: "100%",

  variants: {
    spacing: {
      none: {},
      sm: {
        marginHorizontal: "$2", // 8px
      },
      md: {
        marginHorizontal: "$4", // 16px
      },
      lg: {
        marginHorizontal: "$6", // 24px
      },
    },
  } as const,

  defaultVariants: {
    spacing: "md",
  },
});

export type DividerProps = GetProps<typeof HorizontalDivider> & {
  vertical?: boolean;
};

export function Divider({ vertical = false, ...props }: DividerProps) {
  if (vertical) {
    return <VerticalDivider {...props} />;
  }
  return <HorizontalDivider {...props} />;
}

