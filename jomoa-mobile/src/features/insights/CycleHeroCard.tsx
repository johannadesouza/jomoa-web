/**
 * CycleHeroCard – Prominent cycle card with hormone graph and phase insight
 */
import React from "react";
import { YStack, XStack } from "tamagui";

import { Card, AppText } from "../../shared/ui";
import { HormoneGraph } from "../../components/cycle/HormoneGraph";
import { PhaseIndicatorBar } from "../../components/cycle/PhaseIndicatorBar";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

interface CycleHeroCardProps {
  phase: CyclePhase | null;
  cycleDay: number;
  cycleLength?: number;
  daysUntilNextPeriod: number | null;
  onPress?: () => void;
}

export function CycleHeroCard({
  phase,
  cycleDay,
  cycleLength = 28,
  daysUntilNextPeriod,
  onPress,
}: CycleHeroCardProps) {
  const profile = phase ? getPhaseProfile(phase) : null;
  const phaseLabel = phase ? getPhaseLabel(phase) : null;
  const physiologySnippet = profile?.physiology?.[0] ?? null;

  if (!phase) {
    return (
      <Card pressable onPress={onPress}>
        <Card.Content>
          <YStack alignItems="center" gap="$4" paddingVertical="$4">
            <AppText variant="body" muted center>
              Logga period för att se din cykel och hormonprofil
            </AppText>
            <AppText variant="caption" color="$accent">
              Logga period →
            </AppText>
          </YStack>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card pressable onPress={onPress}>
      <Card.Content>
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack gap="$1">
              <AppText variant="caption" muted>
                Din cykelfas
              </AppText>
              <AppText variant="h2" color="$accent">
                {phaseLabel}
              </AppText>
              <AppText variant="small" muted>
                Dag {cycleDay} av {cycleLength}
                {daysUntilNextPeriod != null && (
                  <> · {daysUntilNextPeriod === 0 ? "Mens idag" : `Mens om ${daysUntilNextPeriod} dagar`}</>
                )}
              </AppText>
            </YStack>
            <PhaseIndicatorBar activePhase={phase} />
          </XStack>

          <HormoneGraph cycleDay={cycleDay} cycleLength={cycleLength} />

          {physiologySnippet && (
            <AppText variant="small" muted>
              {physiologySnippet}
            </AppText>
          )}
        </YStack>
      </Card.Content>
    </Card>
  );
}
