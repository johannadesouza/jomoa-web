import React from "react";
import { XStack, YStack } from "tamagui";
import type { OnboardingPath } from "../../shared/types/onboarding";
import { AppText } from "../../shared/ui";

type ScreenName =
  | "Goals"
  | "Frequency"
  | "CycleSetup"
  | "Complete";

interface StepConfig {
  total: number;
  current: number;
}

function getStepConfig(
  path: OnboardingPath | null,
  screen: ScreenName
): StepConfig | null {
  if (!path) return null;

  if (path === "cycle_only") {
    const map: Record<string, StepConfig> = {
      CycleSetup: { total: 3, current: 1 },
      Complete: { total: 3, current: 3 },
    };
    return map[screen] ?? null;
  }

  if (path === "training_only") {
    const map: Record<string, StepConfig> = {
      Goals: { total: 3, current: 1 },
      Frequency: { total: 3, current: 2 },
      Complete: { total: 3, current: 3 },
    };
    return map[screen] ?? null;
  }

  if (path === "both") {
    const map: Record<string, StepConfig> = {
      Goals: { total: 4, current: 1 },
      Frequency: { total: 4, current: 2 },
      CycleSetup: { total: 4, current: 3 },
      Complete: { total: 4, current: 4 },
    };
    return map[screen] ?? null;
  }

  return null;
}

interface OnboardingStepDotsProps {
  path: OnboardingPath | null;
  screen: ScreenName;
}

export function OnboardingStepDots({ path, screen }: OnboardingStepDotsProps) {
  const config = getStepConfig(path, screen);
  if (!config) return null;

  return (
    <YStack alignItems="center" gap="$2">
      <AppText variant="caption" muted>
        Steg {config.current} av {config.total}
      </AppText>
      <XStack justifyContent="center" gap="$2">
        {Array.from({ length: config.total }).map((_, i) => (
          <XStack
            key={i}
            width={8}
            height={8}
            borderRadius="$full"
            backgroundColor={i + 1 === config.current ? "$accent" : "$borderColor"}
          />
        ))}
      </XStack>
    </YStack>
  );
}
