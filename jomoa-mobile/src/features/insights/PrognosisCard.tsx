/**
 * PrognosisCard – "Min prognos" – vad kan du förvänta dig kommande dagar (Hormona-inspirerad)
 */
import React from "react";
import { YStack, XStack } from "tamagui";

import { Card, AppText, AppButton } from "../../shared/ui";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

interface PrognosisCardProps {
  phase: CyclePhase | null;
  daysUntilNextPeriod: number | null;
  onPress?: () => void;
}

function getWhenText(daysUntilNextPeriod: number | null): string {
  if (daysUntilNextPeriod == null) return "När du loggar period";
  if (daysUntilNextPeriod === 0) return "Idag";
  if (daysUntilNextPeriod === 1) return "Imorgon";
  if (daysUntilNextPeriod <= 5) return "Nästa dagar";
  return `Om ${daysUntilNextPeriod} dagar`;
}

function getYouMightFeel(phase: CyclePhase | null): string[] {
  if (!phase) return ["Logga period för personliga prognoser"];
  const profile = getPhaseProfile(phase);
  if (!profile) return [];
  return profile.commonPatterns.slice(0, 2);
}

export function PrognosisCard({
  phase,
  daysUntilNextPeriod,
  onPress,
}: PrognosisCardProps) {
  const whenText = getWhenText(daysUntilNextPeriod);
  const mightFeel = getYouMightFeel(phase);
  const phaseLabel = phase ? getPhaseLabel(phase) : null;

  return (
    <Card pressable onPress={onPress}>
      <Card.Content>
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="$3">
            <YStack flex={1} minWidth={120} gap="$1">
              <AppText variant="caption" muted>
                NÄR
              </AppText>
              <AppText variant="body" fontWeight="600">
                {whenText}
              </AppText>
            </YStack>
            <YStack flex={1} minWidth={120} gap="$1">
              <AppText variant="caption" muted>
                DU KANSKE KÄNNER
              </AppText>
              {phaseLabel && (
                <AppText variant="body" fontWeight="600" color="$accent">
                  {phaseLabel}
                </AppText>
              )}
            </YStack>
          </XStack>
          {mightFeel.length > 0 && (
            <YStack gap="$1">
              {mightFeel.map((text, i) => (
                <AppText key={i} variant="small" muted>
                  • {text}
                </AppText>
              ))}
            </YStack>
          )}
          <AppButton
            variant="secondary"
            size="sm"
            onPress={onPress}
          >
            Förutse symtom
          </AppButton>
        </YStack>
      </Card.Content>
    </Card>
  );
}
