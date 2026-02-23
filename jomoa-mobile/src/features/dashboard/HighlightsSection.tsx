import React from "react";
import { ScrollView } from "react-native";
import { YStack, Text } from "tamagui";

import { Section, Card, AppText, AppIcon } from "../../shared/ui";
import { getHighlightItems } from "./highlightsUtils";

const ICON_BG_COLORS = ["$accent", "$success", "$warning", "$info"] as const;

interface HighlightsSectionProps {
  sessionsThisMonth: number;
  totalVolume: number;
  streak: number;
  weeklyWorkouts: number;
  onViewAll?: () => void;
}

export function HighlightsSection({
  sessionsThisMonth,
  totalVolume,
  streak,
  weeklyWorkouts,
  onViewAll,
}: HighlightsSectionProps) {
  const items = getHighlightItems({
    sessionsThisMonth,
    totalVolume,
    streak,
    weeklyWorkouts,
  });

  return (
    <Section
      title="Träningsöversikt"
      subtitle="Din aktivitet"
      viewAllLabel={onViewAll ? "Visa allt" : undefined}
      onViewAll={onViewAll}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8, paddingRight: 16 }}
      >
        {items.map((item, idx) => (
          <Card
            key={item.label}
            minWidth={128}
            marginRight={idx < items.length - 1 ? 12 : 0}
          >
            <Card.Content>
              <YStack alignItems="center" gap="$3" paddingVertical="$4" paddingHorizontal="$4">
                {item.iconName && (
                  <YStack
                    width={44}
                    height={44}
                    borderRadius="$full"
                    backgroundColor={ICON_BG_COLORS[idx % ICON_BG_COLORS.length]}
                    alignItems="center"
                    justifyContent="center"
                    opacity={0.9}
                  >
                    <AppIcon name={item.iconName} size={22} color="#FFF" />
                  </YStack>
                )}
                <Text fontSize="$7" fontWeight="700" color="$accent">
                  {item.value}
                </Text>
                <AppText variant="caption" muted center numberOfLines={2}>
                  {item.label}
                </AppText>
              </YStack>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </Section>
  );
}

