import React from "react";
import { YStack, XStack } from "tamagui";

import { AppText } from "../../shared/ui";
import { useCycle } from "../../lib/hooks/useCycle";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";

interface CycleGraphSectionProps {
  clientId: string | undefined;
  onPress?: () => void;
}

const PHASE_ORDER = ["menstruation", "follicular", "ovulation", "luteal"] as const;

export function CycleGraphSection({ clientId, onPress }: CycleGraphSectionProps) {
  const { phase, phaseLabel, cycleDay } = useCycle(clientId);

  if (!phase) {
    return (
      <YStack gap="$2">
        <AppText variant="small" muted>
          Logga period för att se cykelfas
        </AppText>
      </YStack>
    );
  }

  const phaseIndex = PHASE_ORDER.indexOf(phase as (typeof PHASE_ORDER)[number]);
  const progress = phaseIndex >= 0 ? (phaseIndex + 0.5) / 4 : 0.5;

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <AppText variant="small" muted>
          Dag {cycleDay} – {phaseLabel}
        </AppText>
      </XStack>
      <XStack
        height={8}
        backgroundColor="$backgroundStrong"
        borderRadius="$full"
        overflow="hidden"
      >
        {PHASE_ORDER.map((p, i) => (
          <XStack
            key={p}
            flex={1}
            backgroundColor={phase === p ? "$accent" : "$surface3"}
            opacity={phase === p ? 1 : 0.4}
          />
        ))}
      </XStack>
    </YStack>
  );
}
