import React from "react";
import { XStack, YStack } from "tamagui";

import { Section, Card, AppText } from "../../shared/ui";
import type { ReadinessRecord } from "../../lib/services/readinessService";

function getBarColor(energy: number): string {
  if (energy >= 7) return "$success";
  if (energy >= 4) return "$accent";
  return "$warning";
}

interface ReadinessGraphCardProps {
  records: ReadinessRecord[];
  todayDate: string;
}

export function ReadinessGraphCard({
  records,
  todayDate,
}: ReadinessGraphCardProps) {
  const BAR_HEIGHT = 40;

  return (
    <Section title="Hur du mår" subtitle="Senaste 7 dagar">
      <Card>
        <Card.Content>
          <YStack
            backgroundColor="$surface3"
            borderRadius="$3"
            padding="$4"
            paddingBottom="$4"
          >
            <XStack justifyContent="space-between" alignItems="flex-end" gap="$2">
              {records.map((r) => {
                const energy = r.energy_level ?? 0;
                const energyH = energy > 0 ? Math.max(8, (energy / 10) * BAR_HEIGHT) : 8;
                const isToday = r.date === todayDate;
                const barColor = getBarColor(energy);
                return (
                  <YStack key={r.id} flex={1} alignItems="center" gap="$2">
                    <YStack
                      width="100%"
                      height={BAR_HEIGHT + 8}
                      justifyContent="flex-end"
                      alignItems="center"
                    >
                      <YStack
                        width="100%"
                        minHeight={8}
                        height={energyH}
                        backgroundColor={barColor}
                        opacity={isToday ? 1 : 0.85}
                        borderRadius="$3"
                        borderWidth={isToday ? 2 : 0}
                        borderColor="$textPrimary"
                      />
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
          </YStack>
        </Card.Content>
      </Card>
    </Section>
  );
}
