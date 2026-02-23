/**
 * SymptomReliefCards – Horisontella kort för symtomlindring (Hormona-inspirerad)
 * Visar rekommendationer baserat på fas och readiness
 */
import React from "react";
import { ScrollView, Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Card, AppText } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

interface ReliefItem {
  id: string;
  chip: string;
  title: string;
  tip: string;
  phase?: CyclePhase;
}

interface SymptomReliefCardsProps {
  phase: CyclePhase | null;
  lowEnergy?: boolean;
  poorSleep?: boolean;
  highStress?: boolean;
  onPress?: (item: ReliefItem) => void;
}

function getReliefItems(props: SymptomReliefCardsProps): ReliefItem[] {
  const { phase, lowEnergy, poorSleep, highStress } = props;
  const items: ReliefItem[] = [];

  if (lowEnergy) {
    items.push({
      id: "energy",
      chip: "ENERGI: LÅG",
      title: "Få omedelbar lindring",
      tip: "Promenad, stretching eller regelbundna mellanmål kan hjälpa.",
      phase: phase ?? undefined,
    });
  }
  if (poorSleep) {
    items.push({
      id: "sleep",
      chip: "SÖMN",
      title: "Få omedelbar lindring",
      tip: "Prioritera vila, magnesium och koffein först efter frukost.",
      phase: phase ?? undefined,
    });
  }
  if (highStress) {
    items.push({
      id: "stress",
      chip: "STRESS",
      title: "Få omedelbar lindring",
      tip: "Lätt rörelse, andningsövningar eller stretching kan lugna.",
      phase: phase ?? undefined,
    });
  }

  // Phase-based fallbacks when no specific symptoms
  if (items.length === 0 && phase) {
    if (phase === "menstruation") {
      items.push({
        id: "cramps",
        chip: "MENSTRUATION",
        title: "Få omedelbar lindring",
        tip: "Lätt stretching, varmt vatten eller promenad kan lindra.",
        phase,
      });
    }
    if (phase === "luteal") {
      items.push({
        id: "luteal",
        chip: "LUTEAL",
        title: "Få omedelbar lindring",
        tip: "Magnesium och B-vitaminer kan stödja humör och energi.",
        phase,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      id: "general",
      chip: "VÄLBEFINNANDE",
      title: "Få omedelbar lindring",
      tip: "Logga hur du mår för personliga tips.",
    });
  }

  return items.slice(0, 3);
}

const CARD_WIDTH = 180;
const CARD_HEIGHT = 140;

export function SymptomReliefCards(props: SymptomReliefCardsProps) {
  const { onPress } = props;
  const items = getReliefItems(props);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8, gap: 12, paddingRight: 16 }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPress?.(item)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Card
            width={CARD_WIDTH}
            minHeight={CARD_HEIGHT}
            padding="$4"
          >
            <YStack flex={1} gap="$3" justifyContent="space-between">
              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                  backgroundColor="$surface3"
                  maxWidth="90%"
                >
                  <AppText variant="caption" fontWeight="600" numberOfLines={1}>
                    {item.chip}
                  </AppText>
                </YStack>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </XStack>
              <YStack gap="$1">
                <AppText variant="body" fontWeight="600" numberOfLines={1}>
                  {item.title}
                </AppText>
                <AppText variant="caption" muted numberOfLines={2}>
                  {item.tip}
                </AppText>
              </YStack>
            </YStack>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
