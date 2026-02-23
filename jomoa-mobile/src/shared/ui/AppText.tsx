import { Text, styled, GetProps } from "tamagui";

/**
 * AppText - Typography component following JOMOA design standards + inspo
 *
 * Typography Hierarchy (Cormorant for headings per Hormona/Jö/Journey):
 * - H1: 36px ($8), Cormorant semibold, page title
 * - H2: 20px ($4), Cormorant semibold, section title
 * - H3: 16px ($3), Inter semibold, card title
 * - Body: 16px ($3), Inter normal, minimum for accessibility
 * - Small: 14px ($2), Inter medium, secondary text
 * - Caption: 12px ($1), Inter medium, labels
 *
 * Rules:
 * - No hardcoded font sizes
 * - Use theme tokens only
 * - Secondary text uses colorSecondary
 */

const BaseText = styled(Text, {
  name: "AppText",
  color: "$color",
  fontFamily: "$body",
  fontSize: "$3", // 16px default (body)
  lineHeight: "$3", // 22

  variants: {
    variant: {
      h1: {
        fontFamily: "$heading",
        fontSize: "$8", // 36px
        lineHeight: "$8", // 48
        fontWeight: "600",
      },
      h2: {
        fontFamily: "$heading",
        fontSize: "$4", // 20px
        lineHeight: "$4", // 26
        fontWeight: "600",
      },
      h3: {
        fontSize: "$3", // 16px
        lineHeight: "$3", // 22
        fontWeight: "600",
      },
      body: {
        fontSize: "$3", // 16px
        lineHeight: "$3", // 22
        fontWeight: "400",
      },
      small: {
        fontSize: "$2", // 14px
        lineHeight: "$2", // 20
        fontWeight: "500",
        color: "$colorSecondary",
      },
      caption: {
        fontSize: "$1", // 12px
        lineHeight: "$1", // 16
        fontWeight: "500",
        color: "$colorSecondary",
      },
    },
    muted: {
      true: {
        color: "$colorSecondary",
      },
    },
    center: {
      true: {
        textAlign: "center",
      },
    },
    accent: {
      true: {
        color: "$accent",
      },
    },
    success: {
      true: {
        color: "$success",
      },
    },
    error: {
      true: {
        color: "$error",
      },
    },
    warning: {
      true: {
        color: "$warning",
      },
    },
  } as const,

  defaultVariants: {
    variant: "body",
  },
});

export type AppTextProps = GetProps<typeof BaseText>;

export function AppText({ children, ...props }: AppTextProps) {
  return <BaseText {...props}>{children}</BaseText>;
}

// Convenience components for cleaner JSX
export function H1(props: Omit<AppTextProps, "variant">) {
  return <AppText variant="h1" {...props} />;
}

export function H2(props: Omit<AppTextProps, "variant">) {
  return <AppText variant="h2" {...props} />;
}

export function H3(props: Omit<AppTextProps, "variant">) {
  return <AppText variant="h3" {...props} />;
}

export function BodyText(props: Omit<AppTextProps, "variant">) {
  return <AppText variant="body" {...props} />;
}

export function SmallText(props: Omit<AppTextProps, "variant">) {
  return <AppText variant="small" {...props} />;
}

export function Caption(props: Omit<AppTextProps, "variant">) {
  return <AppText variant="caption" {...props} />;
}
