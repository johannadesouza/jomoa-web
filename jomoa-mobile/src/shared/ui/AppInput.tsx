import React from "react";
import { Input, styled, GetProps, YStack, XStack } from "tamagui";
import { AppText } from "./AppText";

/**
 * AppInput - Text input component following JOMOA design standards
 *
 * From design-standards.md:
 * - Height: 48px ($12) for accessibility
 * - Padding: 12px ($3) horizontal
 * - Background: surface-3 ($backgroundStrong)
 * - Border: border-soft ($borderColor)
 * - Border radius: 12px ($3 / rounded-card)
 * - Focus: accent border
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 * - Minimum tap target: 44px
 */

const InputFrame = styled(Input, {
  name: "AppInput",
  backgroundColor: "$backgroundStrong",
  borderColor: "$borderColor",
  borderWidth: 1,
  borderRadius: "$3", // 12px (card radius)
  height: "$12", // 48px
  paddingHorizontal: "$3", // 12px
  fontSize: "$3", // 16px
  color: "$color",
  placeholderTextColor: "$placeholderColor",
  minHeight: "$11", // 44px accessibility

  focusStyle: {
    borderColor: "$accent",
    borderWidth: 2,
  },

  variants: {
    error: {
      true: {
        borderColor: "$error",
        focusStyle: {
          borderColor: "$error",
        },
      },
    },
    size: {
      sm: {
        height: "$10", // 40px
        fontSize: "$2", // 14px
        paddingHorizontal: "$2", // 8px
      },
      md: {
        height: "$12", // 48px
        fontSize: "$3", // 16px
        paddingHorizontal: "$3", // 12px
      },
      lg: {
        height: "$14", // 56px
        fontSize: "$3", // 16px
        paddingHorizontal: "$4", // 16px
      },
    },
  } as const,

  defaultVariants: {
    size: "md",
  },
});

const InputContainer = styled(YStack, {
  name: "InputContainer",
  gap: "$2", // 8px
});

const InputLabel = styled(AppText, {
  name: "InputLabel",
  variant: "small",
  color: "$color",
  fontWeight: "500",
});

const InputError = styled(AppText, {
  name: "InputError",
  variant: "caption",
  color: "$error",
});

const InputHelper = styled(AppText, {
  name: "InputHelper",
  variant: "caption",
  color: "$colorSecondary",
});

function LabelSection({ label, required }: { label?: string; required?: boolean }) {
  if (!label) return null;
  return (
    <XStack gap="$1" alignItems="center">
      <InputLabel>{label}</InputLabel>
      <RequiredMark visible={!!required} />
    </XStack>
  );
}

function RequiredMark({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <AppText variant="caption" color="$error">
      *
    </AppText>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <InputError>{message}</InputError>;
}

function HelperText({ text, showWhenNoError }: { text?: string; showWhenNoError: boolean }) {
  if (!text || !showWhenNoError) return null;
  return <InputHelper>{text}</InputHelper>;
}

export type AppInputProps = GetProps<typeof InputFrame> & {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
};

/**
 * AppInput - Form text input with label and error support
 *
 * @example
 * // Basic usage
 * <AppInput
 *   label="Email"
 *   placeholder="din@email.se"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 *
 * @example
 * // With error
 * <AppInput
 *   label="Password"
 *   errorMessage="Password is required"
 *   secureTextEntry
 * />
 */
export function AppInput({
  label,
  errorMessage,
  helperText,
  required,
  ...props
}: AppInputProps) {
  const hasError = !!errorMessage;

  return (
    <InputContainer>
      <LabelSection label={label} required={required} />
      <InputFrame error={hasError} {...props} />
      <ErrorText message={errorMessage} />
      <HelperText text={helperText} showWhenNoError={!errorMessage} />
    </InputContainer>
  );
}
