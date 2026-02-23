/**
 * CycleCategoryStrip – Horizontal category chips linking to CycleInsights
 */
import React from "react";
import { ScrollView, Pressable } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppText } from "../../shared/ui";

export type CycleCategoryId =
  | "alla"
  | "hormoner"
  | "traning"
  | "kost"
  | "sex"
  | "livsstil";

const CATEGORIES: { id: CycleCategoryId; label: string }[] = [
  { id: "hormoner", label: "Hormoner" },
  { id: "traning", label: "Träning" },
  { id: "kost", label: "Kost" },
  { id: "sex", label: "Sex" },
  { id: "livsstil", label: "Livsstil" },
];

interface CycleCategoryStripProps {
  onCategoryPress: (categoryId: CycleCategoryId) => void;
}

export function CycleCategoryStrip({ onCategoryPress }: CycleCategoryStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      <XStack gap="$2" paddingRight="$4">
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onCategoryPress(cat.id)}
            style={{ minWidth: 0 }}
          >
            <YStack
              backgroundColor="$surface3"
              paddingVertical="$2"
              paddingHorizontal="$4"
              borderRadius="$3"
              borderWidth={1}
              borderColor="$borderSoft"
            >
              <AppText variant="small" fontWeight="500">
                {cat.label} →
              </AppText>
            </YStack>
          </Pressable>
        ))}
      </XStack>
    </ScrollView>
  );
}
