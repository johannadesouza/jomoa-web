import React from "react";
import { XStack, YStack } from "tamagui";

import { Section, Card, AppText } from "../../shared/ui";
import type { ReadinessRecord } from "../../lib/services/readinessService";

function getBarColor(score: number): string {
  if (score >= 70) return "$success";
  if (score >= 40) return "$accent";
  return "$warning";
}

interface ReadinessGraphCardProps {
  records: ReadinessRecord[];
  todayDate: string;
  todayReadiness: number | null;
}

export function ReadinessGraphCard({
  records,
  todayDate,
  todayReadiness,
}: ReadinessGraphCardProps) {
  const BAR_HEIGHT = 56;
  const ENERGY_HEIGHT = 14;

  return (
    <Section title="Hur du mår" subtitle="Senaste 7 dagar">
      <Card>
        <Card.Content>
          <YStack
            backgroundColor="$surface3"
            borderRadius="$3"
            padding="$4"
            paddingBottom="$5"
          >
            <XStack justifyContent="space-between" alignItems="flex-end" gap="$2">
              {records.map((r) => {
                const score = r.readiness_score ?? 0;
                const energy = r.energy_level ?? 0;
                const readinessH = Math.max(10, (score / 100) * BAR_HEIGHT);
                const energyH = energy > 0 ? Math.max(4, (energy / 10) * ENERGY_HEIGHT) : 0;
                const isToday = r.date === todayDate;
                const barColor = getBarColor(score);
                return (
                  <YStack key={r.id} flex={1} alignItems="center" gap="$2">
                    <YStack
                      width="100%"
                      height={BAR_HEIGHT + ENERGY_HEIGHT + 8}
                      justifyContent="flex-end"
                      alignItems="center"
                      gap="$1"
                    >
                      <YStack
                        width="100%"
                        minHeight={10}
                        height={readinessH}
                        backgroundColor={barColor}
                        opacity={isToday ? 1 : 0.85}
                        borderRadius="$3"
                        borderWidth={isToday ? 2 : 0}
                        borderColor="$textPrimary"
                      />
                      {energyH > 0 && (
                        <YStack
                          width="75%"
                          minHeight={4}
                          height={energyH}
                          backgroundColor="$accent"
                          opacity={0.5}
                          borderRadius="$full"
                        />
                      )}
                    </YStack>
                    <AppText
                      variant="caption"
                      muted={!isToday}
                      fontWeight={isToday ? "600" : "400"}
                      color={isToday ? "$accent" : undefined}
                    >
                      {isToday ? "Idag" : r.date.slice(-2)}
                    </AppText>
                  </YStack>
                );
              })}
            </XStack>
            {todayReadiness != null && (
              <AppText variant="caption" muted marginTop="$3" textAlign="center">
                Poäng idag: {todayReadiness}%
              </AppText>
            )}
          </YStack>
        </Card.Content>
      </Card>
    </Section>
  );
}
