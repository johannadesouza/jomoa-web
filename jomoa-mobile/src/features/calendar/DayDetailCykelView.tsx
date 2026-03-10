/**
 * DayDetailCykelView – cykelvyn för en dag: fas, cykeldag, tränings- och välmåendetips.
 */
import React, { useState, useEffect } from "react";
import { YStack, XStack, View } from "tamagui";
import { Screen, Section, Card, AppText, AppButton, AppIcon, type AppIconName } from "../../shared/ui";
import { useCycleContext } from "../../shared/context/CycleContext";
import { getDaysUntilNextPeriod } from "../../lib/utils/cycleUtils";
import type { CyclePhase } from "../../lib/utils/cycleUtils";
import {
  fetchPhaseContent,
  type PhaseContent,
} from "../../lib/repos/contentRepo/cycleContent";

const PHASE_ID_MAP: Record<Exclude<CyclePhase, null>, string> = {
  menstruation: "menstruation",
  follicular: "follikular",
  ovulation: "ovulation",
  luteal: "luteal",
};

const WELLNESS_CATEGORY_ICON: Record<string, string> = {
  nutrition: "nutrition-outline",
  sleep: "moon-outline",
  stress: "leaf-outline",
  symptoms: "medkit-outline",
  mindfulness: "heart-outline",
};

const TRAINING_TIP_ICON: Record<string, string> = {
  recommendation: "checkmark-circle-outline",
  warning: "warning-outline",
  motivation: "flash-outline",
};

export interface DayDetailCykelViewProps {
  date: string;
  onCyclePress: () => void;
}

export function DayDetailCykelView({ date, onCyclePress }: DayDetailCykelViewProps) {
  const { getPhaseForDate, latestPeriodStart, cycleLength } = useCycleContext();
  const d = new Date(date + "T12:00:00");
  const { phase, cycleDay, phaseLabel } = getPhaseForDate(d);
  const daysUntilNext = getDaysUntilNextPeriod(latestPeriodStart, cycleLength, d);

  const [phaseContent, setPhaseContent] = useState<PhaseContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (!phase) return;
    const phaseId = PHASE_ID_MAP[phase];
    setLoadingContent(true);
    fetchPhaseContent(phaseId)
      .then(setPhaseContent)
      .finally(() => setLoadingContent(false));
  }, [phase]);

  const phaseColor = phaseContent?.color_hex ?? "#888";

  return (
    <Screen scroll padded>
      <YStack gap="$5" paddingBottom="$6">
        {phase ? (
          <View
            borderRadius="$4"
            overflow="hidden"
            style={{ backgroundColor: phaseColor + "22", borderLeftWidth: 4, borderLeftColor: phaseColor }}
            padding="$5"
          >
            <YStack gap="$3">
              <XStack alignItems="center" gap="$3">
                <View
                  width={14}
                  height={14}
                  borderRadius={7}
                  style={{ backgroundColor: phaseColor }}
                />
                <AppText variant="h2">{phaseLabel}</AppText>
              </XStack>

              <XStack gap="$4" flexWrap="wrap">
                <YStack gap="$1">
                  <AppText variant="caption" muted>Cykeldag</AppText>
                  <AppText variant="body" fontWeight="600">Dag {cycleDay}</AppText>
                </YStack>
                {phaseContent?.typical_days && (
                  <YStack gap="$1">
                    <AppText variant="caption" muted>Typiska dagar</AppText>
                    <AppText variant="body" fontWeight="600">{phaseContent.typical_days}</AppText>
                  </YStack>
                )}
                {daysUntilNext !== null && daysUntilNext >= 0 && (
                  <YStack gap="$1">
                    <AppText variant="caption" muted>Nästa mens</AppText>
                    <AppText variant="body" fontWeight="600">
                      {daysUntilNext === 0 ? "Idag" : daysUntilNext === 1 ? "Imorgon" : `Om ${daysUntilNext} d`}
                    </AppText>
                  </YStack>
                )}
              </XStack>

              {phaseContent?.description && (
                <AppText variant="body">{phaseContent.description}</AppText>
              )}

              {phaseContent?.hormone_profile && (
                <XStack gap="$2" alignItems="flex-start">
                  <AppIcon name="flask-outline" size={16} color="$textMuted" style={{ marginTop: 2 }} />
                  <AppText variant="small" muted flex={1}>{phaseContent.hormone_profile}</AppText>
                </XStack>
              )}
            </YStack>
          </View>
        ) : (
          <Card borderRadius="$4">
            <Card.Content padding="$6">
              <YStack gap="$3" alignItems="center">
                <AppIcon name="moon-outline" size={32} color="$textMuted" />
                <AppText variant="body" muted center>
                  Logga din senaste mensstart i Cykel för att se fas och cykeldag.
                </AppText>
                <AppButton variant="secondary" size="sm" onPress={onCyclePress}>
                  Öppna Cykel
                </AppButton>
              </YStack>
            </Card.Content>
          </Card>
        )}

        {phaseContent && phaseContent.training_tips.length > 0 && (
          <Section title="Träning">
            <YStack gap="$3">
              {phaseContent.training_tips.map((tip) => (
                <Card key={tip.id} borderRadius="$4">
                  <Card.Content padding="$4">
                    <XStack gap="$3" alignItems="flex-start">
                      <View
                        width={36}
                        height={36}
                        borderRadius="$3"
                        style={{ backgroundColor: phaseColor + "22" }}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppIcon
                          name={(TRAINING_TIP_ICON[tip.tip_type ?? "recommendation"] ?? "checkmark-circle-outline") as AppIconName}
                          size={18}
                          color={phaseColor}
                        />
                      </View>
                      <YStack flex={1} gap="$1">
                        <AppText variant="h3">{tip.title}</AppText>
                        <AppText variant="small" muted>{tip.body}</AppText>
                      </YStack>
                    </XStack>
                  </Card.Content>
                </Card>
              ))}
            </YStack>
          </Section>
        )}

        {phaseContent && phaseContent.wellness_tips.length > 0 && (
          <Section title="Välmående & symtomlindring">
            <YStack gap="$3">
              {phaseContent.wellness_tips.map((tip) => (
                <Card key={tip.id} borderRadius="$4">
                  <Card.Content padding="$4">
                    <XStack gap="$3" alignItems="flex-start">
                      <View
                        width={36}
                        height={36}
                        borderRadius="$3"
                        backgroundColor="$surface3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppIcon
                          name={(WELLNESS_CATEGORY_ICON[tip.category ?? ""] ?? "sparkles-outline") as AppIconName}
                          size={18}
                          color="$textSecondary"
                        />
                      </View>
                      <YStack flex={1} gap="$1">
                        <AppText variant="h3">{tip.title}</AppText>
                        <AppText variant="small" muted>{tip.body}</AppText>
                      </YStack>
                    </XStack>
                  </Card.Content>
                </Card>
              ))}
            </YStack>
          </Section>
        )}

        {phase && (
          <AppButton variant="secondary" onPress={onCyclePress}>
            Öppna Cykel
          </AppButton>
        )}
      </YStack>
    </Screen>
  );
}
