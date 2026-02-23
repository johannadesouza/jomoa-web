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

  const PHASE_COLORS = ["#9B6B9E", "#5B9B7A", "#D96D46", "#C4956A"] as const;

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <AppText variant="small" muted>
          Dag {cycleDay} – {phaseLabel}
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
            flex={1}
            backgroundColor={PHASE_COLORS[i]}
            opacity={phase === p ? 1 : 0.35}
          />
        ))}
      </XStack>
    </YStack>
  );
}
