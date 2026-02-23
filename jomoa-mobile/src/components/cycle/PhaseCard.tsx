import React from "react";
import { Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { YStack, Text } from "tamagui";

import { AppText } from "../../shared/ui";
import type { CyclePhase } from "../../lib/utils/cycleUtils";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";

export type PhaseCardPhase = Exclude<CyclePhase, null>;

const PHASE_ORDER: PhaseCardPhase[] = ["menstruation", "follicular", "ovulation", "luteal"];

const PHASE_GRADIENTS: Record<PhaseCardPhase, [string, string]> = {
  menstruation: ["#9B6B9E", "#D4A5C8"],
  follicular: ["#5B9B7A", "#7BC4A0"],
  ovulation: ["#D96D46", "#E8A890"],
  luteal: ["#C4956A", "#E5C9A8"],
};

interface PhaseCardProps {
  phase: PhaseCardPhase;
  cycleDay?: number;
  isActive?: boolean;
  onPress?: () => void;
  width?: number;
}

export function PhaseCard({
  phase,
  cycleDay,
  isActive = false,
  onPress,
  width = 160,
}: PhaseCardProps) {
  const phaseIndex = PHASE_ORDER.indexOf(phase) + 1;
  const label = getPhaseLabel(phase);
  const [start, end] = PHASE_GRADIENTS[phase];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        width,
        marginRight: 12,
      })}
    >
      <LinearGradient
        colors={[start, end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 20,
          minHeight: 140,
          justifyContent: "space-between",
          borderWidth: isActive ? 2 : 0,
          borderColor: "rgba(255,255,255,0.6)",
        }}
      >
        <Text
          fontSize={48}
          fontWeight="700"
          color="rgba(255,255,255,0.25)"
          position="absolute"
          top={12}
          right={12}
        >
          {phaseIndex}
        </Text>
        <YStack flex={1} justifyContent="flex-end" gap="$1">
          <AppText
            variant="h3"
            color="#FFF"
            fontWeight="600"
          >
            {label}
          </AppText>
          {cycleDay != null && (
            <AppText variant="caption" color="rgba(255,255,255,0.9)">
              Dag {cycleDay} i cykeln
            </AppText>
          )}
        </YStack>
      </LinearGradient>
    </Pressable>
  );
}
