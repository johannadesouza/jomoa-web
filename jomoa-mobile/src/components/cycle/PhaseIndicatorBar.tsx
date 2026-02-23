/**
 * PhaseIndicatorBar – enkel fas-visualisering (Hormona-inspirerad)
 * Horisontell bar med fyra faser, nuvarande markerad.
 */
import React from "react";
import { XStack } from "tamagui";

import type { CyclePhase } from "../../lib/utils/cycleUtils";

const PHASES: Exclude<CyclePhase, null>[] = [
  "menstruation",
  "follicular",
  "ovulation",
  "luteal",
];

interface PhaseIndicatorBarProps {
  activePhase: Exclude<CyclePhase, null>;
}

export function PhaseIndicatorBar({ activePhase }: PhaseIndicatorBarProps) {
  return (
    <XStack flex={1} gap={2} height={6}>
      {PHASES.map((p) => {
        const isActive = p === activePhase;
        return (
          <XStack
            key={p}
            flex={1}
            backgroundColor={isActive ? "$accent" : "$surface3"}
            borderRadius="$1"
          />
        );
      })}
    </XStack>
  );
}
