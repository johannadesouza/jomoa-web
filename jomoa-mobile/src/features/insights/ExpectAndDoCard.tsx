/**
 * ExpectAndDoCard – "Vad kan jag förvänta mig?" + "Vad kan jag göra?"
 * Strukturerad insikt med förväntningar och konkreta steg
 */
import React from "react";
import { YStack, XStack } from "tamagui";

import { Card, AppText } from "../../shared/ui";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

interface ExpectAndDoCardProps {
  phase: CyclePhase | null;
  trainingBullets?: string[];
  nutritionBullets?: string[];
  recoveryBullets?: string[];
}

export function ExpectAndDoCard({
  phase,
  trainingBullets = [],
  nutritionBullets = [],
  recoveryBullets = [],
}: ExpectAndDoCardProps) {
  const profile = phase ? getPhaseProfile(phase) : null;

  const expectText =
    profile?.commonPatterns?.[0] ?? profile?.physiology?.[0]
      ?? "Logga readiness och period för personliga rekommendationer.";

  const doItems: string[] = [];
  if (trainingBullets.length > 0) doItems.push(...trainingBullets);
  else if (profile?.trainingFocus?.length) doItems.push(...profile.trainingFocus.slice(0, 2));
  if (nutritionBullets.length > 0) doItems.push(...nutritionBullets);
  else if (profile?.nutritionFocus?.length) doItems.push(...profile.nutritionFocus.slice(0, 1));
  if (recoveryBullets.length > 0) doItems.push(...recoveryBullets);
  else if (profile?.recoveryFocus?.length && doItems.length < 3) {
    doItems.push(...profile.recoveryFocus.slice(0, 1));
  }

  const uniqueDo = [...new Set(doItems)].slice(0, 4);

  return (
    <Card>
      <Card.Content>
        <YStack gap="$5">
          <YStack gap="$2">
            <AppText variant="small" fontWeight="600" color="$accent">
              VAD KAN JAG FÖRVÄNTA MIG IDAG?
            </AppText>
            <AppText variant="body" muted>
              {expectText}
            </AppText>
          </YStack>
          <YStack gap="$2">
            <AppText variant="small" fontWeight="600" color="$accent">
              VAD KAN JAG GÖRA?
            </AppText>
            <YStack gap="$1">
              {uniqueDo.map((item, i) => (
                <XStack key={i} gap="$2" alignItems="flex-start">
                  <AppText variant="body" color="$accent">•</AppText>
                  <AppText variant="body" flex={1} muted>
                    {item}
                  </AppText>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </YStack>
      </Card.Content>
    </Card>
  );
}
