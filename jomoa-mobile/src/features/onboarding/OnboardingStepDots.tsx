import React from "react";
import { XStack } from "tamagui";
import type { OnboardingPath } from "../../shared/types/onboarding";

type ScreenName =
  | "Goals"
  | "Frequency"
  | "TrainingDays"
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
      Goals: { total: 5, current: 1 },
      Frequency: { total: 5, current: 2 },
      TrainingDays: { total: 5, current: 3 },
      Complete: { total: 5, current: 5 },
    };
    return map[screen] ?? null;
  }

  if (path === "both") {
    const map: Record<string, StepConfig> = {
      Goals: { total: 6, current: 1 },
      Frequency: { total: 6, current: 2 },
      TrainingDays: { total: 6, current: 3 },
      CycleSetup: { total: 6, current: 4 },
      Complete: { total: 6, current: 6 },
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
  );
}
