import React from "react";
import { YStack, styled, GetProps } from "tamagui";
import { AppText } from "./AppText";

function TitleText({ text, Component }: { text?: string; Component: React.ComponentType<{ children: React.ReactNode }> }) {
  if (!text) return null;
  return <Component>{text}</Component>;
}

/**
 * Section - Layout-level container following JOMOA design standards
 *
 * From design-standards.md - Three-Level Hierarchy:
 * 1. Sections - Layout level (this component)
 * 2. Cards - Content containers
 * 3. Components - Reusable UI elements
 *
 * Section Rules:
 * - Separated by vertical spacing (space-y-8 = 32px = $8)
 * - NO borders between sections
 * - NO background color changes
 * - Sections define layout structure only
 *
 * Rules:
 * - No hardcoded values
 * - Use theme tokens only
 */

const SectionContainer = styled(YStack, {
  name: "Section",
  gap: "$4", // 16px gap within section

  variants: {
    spacing: {
      sm: {
        gap: "$3", // 12px
      },
      md: {
        gap: "$4", // 16px
      },
      lg: {
        gap: "$6", // 24px
      },
    },
  } as const,

  defaultVariants: {
    spacing: "md",
  },
});

const SectionHeader = styled(YStack, {
  name: "SectionHeader",
  gap: "$1", // 4px
});

const SectionTitle = styled(AppText, {
  name: "SectionTitle",
  variant: "h2",
});

const SectionSubtitle = styled(AppText, {
  name: "SectionSubtitle",
  variant: "small",
});

export type SectionProps = GetProps<typeof SectionContainer> & {
  title?: string;
  subtitle?: string;
};

/**
 * Section - Layout wrapper for page sections
 *
 * @example
 * // Basic usage
 * <Screen>
 *   <YStack gap="$8">
 *     <Section title="Dagens fokus">
 *       <Card>...</Card>
 *     </Section>
 *
 *     <Section title="Denna vecka">
 *       <Card>...</Card>
 *       <Card>...</Card>
 *     </Section>
 *   </YStack>
 * </Screen>
 */
function SectionHeaderWrapper({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <SectionHeader>
      <TitleText text={title} Component={SectionTitle} />
      <TitleText text={subtitle} Component={SectionSubtitle} />
    </SectionHeader>
  );
}

export function Section({ title, subtitle, children, ...props }: SectionProps) {
  return (
    <SectionContainer {...props}>
      <SectionHeaderWrapper title={title} subtitle={subtitle} />
      {children}
    </SectionContainer>
  );
}

Section.Header = SectionHeader;
Section.Title = SectionTitle;
Section.Subtitle = SectionSubtitle;

