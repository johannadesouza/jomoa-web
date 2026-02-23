/**
 * Training Styles – horisontell strip "Utforska pass efter stil"
 * Tappbar stilar med tydligt valt tillstånd
 */
import React from "react";
import { ScrollView } from "react-native";
import { YStack, Text } from "tamagui";

import { Section, Card } from "../../shared/ui";
import { AppText } from "../../shared/ui";
import { TRAINING_STYLES } from "./trainingStyles";

interface TrainingStylesGridProps {
  selectedStyleId?: string | null;
  onStyleSelect?: (styleId: string) => void;
  /** När true, renderas utan Section-wrapper för inbäddning i större sektion */
  embedded?: boolean;
}

export function TrainingStylesGrid({
  selectedStyleId,
  onStyleSelect,
  embedded,
}: TrainingStylesGridProps) {
  const ALL_ID = "__alla__";
  const isAllSelected = !selectedStyleId;

  const scroll = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 12, paddingRight: 16 }}
    >
        <Card
          minWidth={88}
          pressable
          marginRight={12}
          backgroundColor={isAllSelected ? "$accent" : "$card"}
          borderColor={isAllSelected ? "$accent" : "$borderColor"}
          borderWidth={isAllSelected ? 2 : 1}
          onPress={() => onStyleSelect?.(ALL_ID)}
        >
          <Card.Content>
            <YStack alignItems="center" gap="$1" paddingVertical="$3">
              <Text fontSize="$xl">📋</Text>
              <AppText variant="caption" fontWeight="600" color={isAllSelected ? "$background" : "$color"}>
                Alla
              </AppText>
            </YStack>
          </Card.Content>
        </Card>
        {TRAINING_STYLES.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <Card
              key={style.id}
              minWidth={88}
              pressable
              marginRight={12}
              backgroundColor={isSelected ? "$accent" : "$card"}
              borderColor={isSelected ? "$accent" : "$borderColor"}
              borderWidth={isSelected ? 2 : 1}
              onPress={() =>
                onStyleSelect?.(isSelected ? ALL_ID : style.id)
              }
            >
              <Card.Content>
                <YStack alignItems="center" gap="$1" paddingVertical="$3">
                  <Text fontSize="$xl">{style.icon}</Text>
                  <AppText variant="caption" fontWeight="600" color={isSelected ? "$background" : "$color"}>
                    {style.label}
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
  );

  if (embedded) {
    return (
      <YStack gap="$3">
        <AppText variant="small" fontWeight="600" muted>Stil</AppText>
        {scroll}
      </YStack>
    );
  }

  return (
    <Section
      title="Utforska pass efter stil"
      subtitle="Välj en stil för att se fristående pass"
      spacing="md"
    >
      {scroll}
    </Section>
  );
}
