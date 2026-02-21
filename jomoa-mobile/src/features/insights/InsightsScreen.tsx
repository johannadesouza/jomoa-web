import React from "react";
import { YStack, XStack, Text } from "tamagui";

import {
  Screen,
  Section,
  Card,
  AppText,
  Divider,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useInsights } from "../../lib/hooks/useInsights";

export function InsightsScreen() {
  const { client } = useAuth();
  const { stats, isLoading } = useInsights(client?.id);

  if (isLoading) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Laddar insikter...
        </AppText>
      </Screen>
    );
  }

  const statCards = [
    {
      label: "Total volym",
      value: stats ? String(stats.totalVolume) : "0",
      unit: "kg",
    },
    {
      label: "Pass denna månad",
      value: stats ? String(stats.sessionsThisMonth) : "0",
    },
    {
      label: "Genomsnittlig RPE",
      value: stats?.averageRpe != null ? String(stats.averageRpe) : "-",
    },
    {
      label: "Streak",
      value: stats ? String(stats.streak) : "0",
      unit: "dagar",
    },
  ];

  const hasData = stats && (stats.sessionsThisMonth > 0 || stats.streak > 0);

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Insikter">
          <AppText variant="body" muted>
            Följ din träningsprogression över tid.
          </AppText>
        </Section>

        <Section title="Denna månad">
          <XStack flexWrap="wrap" gap="$4">
            {statCards.map((stat, index) => (
              <Card key={index} flex={1} minWidth="45%">
                <Card.Content>
                  <YStack alignItems="center" gap="$2">
                    <XStack alignItems="baseline" gap="$1">
                      <Text fontSize="$xxl" fontWeight="700" color="$accent">
                        {stat.value}
                      </Text>
                      {stat.unit && (
                        <Text fontSize="$sm" color="$textSecondary">
                          {stat.unit}
                        </Text>
                      )}
                    </XStack>
                    <AppText variant="caption">{stat.label}</AppText>
                  </YStack>
                </Card.Content>
              </Card>
            ))}
          </XStack>
        </Section>

        <Divider />

        <Section title="Träningshistorik">
          <Card>
            <Card.Content>
              <YStack alignItems="center" paddingVertical="$6" gap="$3">
                <Text fontSize="$xxxl">📈</Text>
                <AppText variant="body" muted center>
                  {hasData
                    ? "Din träningshistorik visas ovan. Fortsätt träna för mer data!"
                    : "Din träningshistorik kommer visas här\nnär du loggat några pass."}
                </AppText>
              </YStack>
            </Card.Content>
          </Card>
        </Section>
      </YStack>
    </Screen>
  );
}
