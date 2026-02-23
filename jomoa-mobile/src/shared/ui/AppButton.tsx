import { ActivityIndicator } from "react-native";
import { XStack, styled, GetProps } from "tamagui";

import { getThemeColors } from "../theme/colors";
import { useTheme } from "../context/ThemeContext";
import { AppText } from "./AppText";

/**
 * AppButton - Button component following JOMOA design standards
 *
 * Uses styled(Stack) instead of styled(Button) to avoid Tamagui Button's
 * hook mismatch when disabled prop toggles (see tamagui/tamagui#3920).
 * Tamagui Stack supports onPress and pressStyle.
 */

const ButtonFrame = styled(XStack, {
  name: "AppButton",
  borderRadius: "$4",
  paddingHorizontal: "$4",
  minHeight: "$11",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: "$2",

  variants: {
    variant: {
      primary: {
        backgroundColor: "$accent",
        color: "$color",
        pressStyle: {
          backgroundColor: "$accentPress",
          scale: 0.98,
        },
        hoverStyle: {
          backgroundColor: "$accentHover",
        },
        focusStyle: {
          outlineWidth: 2,
          outlineColor: "$accentHover",
          outlineStyle: "solid",
        },
      },
      secondary: {
        backgroundColor: "$backgroundStrong",
        color: "$color",
        borderWidth: 1,
        borderColor: "$borderColor",
        pressStyle: {
          backgroundColor: "$backgroundPress",
          scale: 0.98,
        },
        hoverStyle: {
          backgroundColor: "$backgroundHover",
          borderColor: "$borderColorHover",
        },
      },
      ghost: {
        backgroundColor: "$backgroundTransparent",
        color: "$color",
        pressStyle: {
          backgroundColor: "$backgroundHover",
        },
        hoverStyle: {
          backgroundColor: "$backgroundHover",
        },
      },
      destructive: {
        backgroundColor: "$error",
        color: "$color",
        pressStyle: {
          opacity: 0.8,
          scale: 0.98,
        },
        hoverStyle: {
          opacity: 0.9,
        },
      },
      success: {
        backgroundColor: "$success",
        color: "$color",
        pressStyle: {
          opacity: 0.8,
          scale: 0.98,
        },
      },
    },
    btnSize: {
      sm: {
        height: "$9",
        paddingHorizontal: "$3",
        minHeight: "$9",
      },
      md: {
        height: "$12",
        paddingHorizontal: "$4",
        minHeight: "$11",
      },
      lg: {
        height: "$14",
        paddingHorizontal: "$5",
        minHeight: "$14",
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    btnSize: "md",
  },
});

type ButtonFrameProps = GetProps<typeof ButtonFrame>;

export type AppButtonProps = Omit<ButtonFrameProps, "size"> & {
  loading?: boolean;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const FRAME_PROPS = [
  "onPress", "onLayout",
  "marginTop", "marginBottom", "marginLeft", "marginRight",
  "margin", "marginHorizontal", "marginVertical",
  "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "padding", "paddingHorizontal", "paddingVertical",
  "flex", "flexGrow", "flexShrink", "alignSelf",
  "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight",
  "position", "top", "bottom", "left", "right",
  "accessibilityLabel", "accessibilityHint", "testID",
] as const;

function pickFrameProps(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of FRAME_PROPS) {
    if (key in props && props[key] !== undefined) {
      result[key] = props[key];
    }
  }
  return result;
}

export function AppButton({
  children,
  loading = false,
  disabled = false,
  icon,
  iconAfter,
  size = "md",
  variant = "primary",
  fullWidth,
  onPress,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const frameProps = pickFrameProps(rest as Record<string, unknown>);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const spinnerColor = variant === "primary" || variant === "destructive" || variant === "success"
    ? "#FFF"
    : colors.textPrimary;

  return (
    <ButtonFrame
      variant={variant}
      btnSize={size}
      fullWidth={fullWidth}
      onPress={isDisabled ? undefined : onPress}
      pointerEvents={isDisabled ? "none" : "auto"}
      opacity={isDisabled ? 0.5 : 1}
      {...frameProps}
    >
      <XStack
        position="absolute"
        opacity={loading ? 1 : 0}
        pointerEvents="none"
      >
        <ActivityIndicator size="small" color={spinnerColor} />
      </XStack>
      <XStack
        alignItems="center"
        justifyContent="center"
        gap="$2"
        opacity={loading ? 0 : 1}
      >
        {icon != null && (typeof icon === "string" || typeof icon === "number")
          ? (
            <AppText variant="body" fontWeight="600" color="$color">
              {icon}
            </AppText>
          )
          : icon}
        {typeof children === "string" || typeof children === "number"
          ? (
            <AppText variant="body" fontWeight="600" color="$color">
              {String(children)}
            </AppText>
          )
          : Array.isArray(children)
            ? children.map((child, i) =>
                typeof child === "string" || typeof child === "number"
                  ? (
                    <AppText key={i} variant="body" fontWeight="600" color="$color">
                      {String(child)}
                    </AppText>
                  )
                  : child
              )
            : children}
        {iconAfter != null && (typeof iconAfter === "string" || typeof iconAfter === "number")
          ? (
            <AppText variant="body" fontWeight="600" color="$color">
              {iconAfter}
            </AppText>
          )
          : iconAfter}
      </XStack>
    </ButtonFrame>
  );
}
