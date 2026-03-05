import React from "react";
import { YStack, XStack } from "tamagui";

import { AppText } from "../../shared/ui";
import { useCycleContext } from "../../shared/context/CycleContext";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import { computePhaseBoundaries } from "../../lib/utils/cycleEngine";

interface CycleGraphSectionProps {
  clientId?: string | undefined;
  onPress?: () => void;
}

const PHASE_ORDER = ["menstruation", "follicular", "ovulation", "luteal"] as const;
const PHASE_COLORS = ["#9B6B9E", "#5B9B7A", "#D96D46", "#C4956A"] as const;

export function CycleGraphSection({ onPress }: CycleGraphSectionProps) {
  const { phase, phaseLabel, cycleDay, cycleLengthDisplay, rollingAvg, mode } = useCycleContext();

  if (mode !== "regular") {
    return null;
  }

  if (!phase) {
    return (
      <YStack gap="$2">
        <AppText variant="small" muted>
          Logga period för att se cykelfas
        </AppText>
      </YStack>
    );
  }

  // Dynamic phase widths proportional to cycle length
  const boundaries = computePhaseBoundaries(cycleLengthDisplay);
  const totalDays = boundaries.menstrual + boundaries.follicular + boundaries.ovulation + boundaries.luteal;
  const flexValues = [
    boundaries.menstrual / totalDays,
    boundaries.follicular / totalDays,
    boundaries.ovulation / totalDays,
    boundaries.luteal / totalDays,
  ];

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <AppText variant="small" muted>
          Dag {cycleDay}{rollingAvg ? ` av ~${cycleLengthDisplay}` : ""} – {phaseLabel}
        </AppText>
      </XStack>
      <XStack
        height={10}
        borderRadius="$full"
        overflow="hidden"
        backgroundColor="$surface3"
      >
        {PHASE_ORDER.map((p, i) => (
          <XStack
            key={p}
            flex={flexValues[i]}
            backgroundColor={PHASE_COLORS[i]}
            opacity={phase === p ? 1 : 0.35}
          />
        ))}
      </XStack>
    </YStack>
  );
}
