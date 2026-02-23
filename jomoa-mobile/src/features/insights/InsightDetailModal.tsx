/**
 * InsightDetailModal – Pop-up för "Vad kan jag förvänta mig?" / "Vad kan jag göra?"
 */
import React from "react";
import { Modal, ScrollView, Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

export type InsightDetailType = "expect" | "do";

interface InsightDetailModalProps {
  visible: boolean;
  type: InsightDetailType;
  title: string;
  items: string[];
  onClose: () => void;
}

export function InsightDetailModal({
  visible,
  type,
  title,
  items,
  onClose,
}: InsightDetailModalProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const label = type === "expect"
    ? "VAD KAN JAG FÖRVÄNTA MIG?"
    : "VAD KAN JAG GÖRA?";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            maxHeight: "70%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <AppText variant="small" fontWeight="600" color="$accent">
                {label}
              </AppText>
              <Pressable onPress={onClose} hitSlop={16}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </XStack>
            <AppText variant="h3">{title}</AppText>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 240 }}
            >
              <YStack gap="$2">
                {items.map((item, i) => (
                  <XStack key={i} gap="$2" alignItems="flex-start">
                    <AppText variant="body" color="$accent">•</AppText>
                    <AppText variant="body" flex={1} muted>
                      {item}
                    </AppText>
                  </XStack>
                ))}
              </YStack>
            </ScrollView>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
