/**
 * InsightCategoryStrip – Välmående, Näring, Fysiskt
 * Horisontella kategorikort som länkar till relevant innehåll
 */
import React from "react";
import { ScrollView, Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Card, AppText } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

type CategoryId = "valmående" | "näring" | "fysiskt";

const CATEGORIES: { id: CategoryId; label: string; icon: "heart-outline" | "nutrition-outline" | "body-outline" }[] = [
  { id: "valmående", label: "Välmående", icon: "heart-outline" },
  { id: "näring", label: "Näring", icon: "nutrition-outline" },
  { id: "fysiskt", label: "Fysiskt", icon: "body-outline" },
];

interface InsightCategoryStripProps {
  onSelectCategory?: (id: CategoryId) => void;
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 100;

export function InsightCategoryStrip({ onSelectCategory }: InsightCategoryStripProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8, gap: 12, paddingRight: 16 }}
    >
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() => onSelectCategory?.(cat.id)}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Card
            width={CARD_WIDTH}
            minHeight={CARD_HEIGHT}
            padding="$4"
            pressable
            paddingVertical="$4"
            paddingHorizontal="$4"
          >
            <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
              <YStack
                width={44}
                height={44}
                borderRadius="$full"
                backgroundColor="$surface3"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name={cat.icon} size={24} color={colors.accent} />
              </YStack>
              <AppText variant="small" fontWeight="600" numberOfLines={1}>
                {cat.label}
              </AppText>
            </YStack>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
