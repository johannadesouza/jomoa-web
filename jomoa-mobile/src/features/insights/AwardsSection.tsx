/**
 * AwardsSection – badges från client_awards (databas-synk)
 */
import React from "react";
import { ScrollView } from "react-native";
import { YStack, Text } from "tamagui";

import { Section, Card } from "../../shared/ui";
import { AppText } from "../../shared/ui";
import { useAwards } from "../../lib/hooks/useAwards";
import { getAwardDisplay } from "../../lib/services/awardsService";

interface AwardsSectionProps {
  clientId: string | undefined;
}

export function AwardsSection({ clientId }: AwardsSectionProps) {
  const { awards, isLoading } = useAwards(clientId);

  if (isLoading) return null;
  if (awards.length === 0) {
    return (
      <Section title="Utmärkelser" subtitle="Fortsätt träna för att låsa upp">
        <Card>
          <Card.Content>
            <YStack alignItems="center" gap="$3" paddingVertical="$6">
              <YStack
                width={64}
                height={64}
                borderRadius="$full"
                backgroundColor="$surface3"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$xxxl">🏅</Text>
              </YStack>
              <AppText variant="small" muted center>
                Logga pass och bygg streak för att tjäna utmärkelser
              </AppText>
            </YStack>
          </Card.Content>
        </Card>
      </Section>
    );
  }

  return (
    <Section title="Utmärkelser" subtitle="Dina prestationer">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8, paddingRight: 16 }}
      >
        {awards.map((award) => {
          const display = getAwardDisplay(award.award_type);
          return (
            <Card key={award.id} minWidth={140} marginRight={12}>
              <Card.Content>
                <YStack alignItems="center" gap="$3" paddingVertical="$4" paddingHorizontal="$4">
                  <YStack
                    width={48}
                    height={48}
                    borderRadius="$full"
                    backgroundColor="$accent"
                    alignItems="center"
                    justifyContent="center"
                    opacity={0.9}
                  >
                    <Text fontSize="$xl" color="#FFF">{display.icon}</Text>
                  </YStack>
                  <AppText variant="small" fontWeight="600" textAlign="center">
                    {display.label}
                  </AppText>
                  <AppText variant="caption" muted center numberOfLines={2}>
                    {display.description}
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </Section>
  );
}
