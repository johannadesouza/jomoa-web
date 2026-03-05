/**
 * CycleHeroCard – Prominent cycle card with hormone graph and phase insight.
 * When no phase: shows copy from app_copy (cycle_hero_no_phase / cycle_hero_no_cycle_mode)
 * so we don't assume "Din cykel" for users in perimenopause or missing_period mode.
 */
import React from "react";
import { YStack, XStack } from "tamagui";

import { Card, AppText } from "../../shared/ui";
import { HormoneGraph } from "../../components/cycle/HormoneGraph";
import { PhaseIndicatorBar } from "../../components/cycle/PhaseIndicatorBar";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

type CycleMode = "regular" | "missing_period" | "perimenopause";

interface CycleHeroCardProps {
  phase: CyclePhase | null;
  cycleDay: number;
  cycleLength?: number;
  /** If true the cycle length is estimated (shown as ~X) */
  cycleLengthEstimated?: boolean;
  daysUntilNextPeriod: number | null;
  onPress?: () => void;
  /** When mode !== regular and no phase, show noCycleModeMessage instead of "Logga period..." */
  cycleMode?: CycleMode;
  noPhaseMessage?: string;
  noCycleModeMessage?: string;
  phaseLabelCaption?: string;
}

const DEFAULT_NO_PHASE = "Logga period för att se din cykel och hormonprofil";
const DEFAULT_NO_CYCLE_MODE = "Träning anpassas efter dagsform och symtom";
const DEFAULT_PHASE_CAPTION = "Din cykelfas";

export function CycleHeroCard({
  phase,
  cycleDay,
  cycleLength = 28,
  cycleLengthEstimated = false,
  daysUntilNextPeriod,
  onPress,
  cycleMode = "regular",
  noPhaseMessage = DEFAULT_NO_PHASE,
  noCycleModeMessage = DEFAULT_NO_CYCLE_MODE,
  phaseLabelCaption = DEFAULT_PHASE_CAPTION,
}: CycleHeroCardProps) {
  const profile = phase ? getPhaseProfile(phase) : null;
  const phaseLabel = phase ? getPhaseLabel(phase) : null;
  const physiologySnippet = profile?.physiology?.[0] ?? null;

  if (!phase) {
    const isNoCycleMode = cycleMode === "perimenopause" || cycleMode === "missing_period";
    const message = isNoCycleMode ? noCycleModeMessage : noPhaseMessage;
    return (
      <Card pressable onPress={onPress}>
        <Card.Content>
          <YStack alignItems="center" gap="$4" paddingVertical="$4">
            <AppText variant="body" muted center>
              {message}
            </AppText>
            {!isNoCycleMode && (
              <AppText variant="caption" color="$accent">
                Logga period →
              </AppText>
            )}
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
                {phaseLabelCaption}
              </AppText>
              <AppText variant="h2" color="$accent">
                {phaseLabel}
              </AppText>
              <AppText variant="small" muted>
                Dag {cycleDay}{" "}
                {cycleLength > 0 && (
                  <>av {cycleLengthEstimated ? `~${cycleLength}` : `${cycleLength}`}</>
                )}
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
