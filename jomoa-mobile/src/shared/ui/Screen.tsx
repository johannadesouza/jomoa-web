import { YStack, styled, GetProps, ScrollView } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Screen - Base screen wrapper following JOMOA design standards
 *
 * From design-standards.md:
 * - Background: bg-deep-plum-black ($background)
 * - Standard padding: 16px ($4) horizontal
 *
 * Screen Structure:
 * - Handles safe areas automatically
 * - Provides consistent background
 * - Optional scrolling
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 * - Always use this component as screen root
 */

const ScreenContainer = styled(YStack, {
  name: "Screen",
  flex: 1,
  backgroundColor: "$background",

  variants: {
    padded: {
      true: {
        paddingHorizontal: "$4", // 16px
      },
      false: {
        paddingHorizontal: "$0",
      },
    },
    centered: {
      true: {
        justifyContent: "center",
        alignItems: "center",
      },
    },
  } as const,

  defaultVariants: {
    padded: true,
  },
});

const ScrollContainer = styled(ScrollView, {
  name: "ScreenScroll",
  flex: 1,
  backgroundColor: "$background",
});

export type ScreenProps = GetProps<typeof ScreenContainer> & {
  /** Enable safe area insets (default: true) */
  safeArea?: boolean;
  /** Safe area edges to apply (default: ['top', 'bottom']) */
  edges?: Array<"top" | "bottom" | "left" | "right">;
  /** Make content scrollable (default: false) */
  scroll?: boolean;
  /** Keyboard avoiding view behavior (for forms) */
  keyboardAvoiding?: boolean;
};

/**
 * Screen - Base wrapper for all app screens
 *
 * @example
 * // Basic usage
 * <Screen>
 *   <YStack gap="$6">
 *     <H1>Title</H1>
 *     <Card>...</Card>
 *   </YStack>
 * </Screen>
 *
 * @example
 * // Scrollable screen
 * <Screen scroll>
 *   <YStack gap="$6">
 *     {items.map(...)}
 *   </YStack>
 * </Screen>
 *
 * @example
 * // Centered content (e.g., login)
 * <Screen centered>
 *   <Card>...</Card>
 * </Screen>
 */
export function Screen({
  children,
  safeArea = true,
  edges = ["top", "bottom"],
  scroll = false,
  padded = true,
  centered = false,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const paddingTop = safeArea && edges.includes("top") ? insets.top : 0;
  const paddingBottom = safeArea && edges.includes("bottom") ? insets.bottom : 0;
  const paddingLeft = safeArea && edges.includes("left") ? insets.left : 0;
  const paddingRight = safeArea && edges.includes("right") ? insets.right : 0;

  if (scroll) {
    return (
      <ScrollContainer
        contentContainerStyle={{
          paddingTop,
          paddingBottom: paddingBottom + 24, // Extra space at bottom
          paddingLeft: padded ? 16 + paddingLeft : paddingLeft,
          paddingRight: padded ? 16 + paddingRight : paddingRight,
          flexGrow: centered ? 1 : undefined,
          justifyContent: centered ? "center" : undefined,
          alignItems: centered ? "center" : undefined,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollContainer>
    );
  }

  return (
    <ScreenContainer
      padded={padded}
      centered={centered}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
      {...props}
    >
      {children}
    </ScreenContainer>
  );
}
