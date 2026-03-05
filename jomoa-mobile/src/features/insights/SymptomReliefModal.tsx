/**
 * SymptomReliefModal – Specifika symtomlindringstips (Trötthet, Uppblåsthet, etc.)
 */
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText, AppButton } from "../../shared/ui";
import { SYMPTOM_RELIEF, type SymptomId } from "../../lib/data/symptomReliefData";
import { fetchSymptomReliefBySymptom, type SymptomReliefEntry } from "../../lib/repos/contentRepo";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

interface SymptomReliefModalProps {
  visible: boolean;
  symptomId: SymptomId | null;
  onClose: () => void;
  onLogReadiness?: () => void;
}

export function SymptomReliefModal({
  visible,
  symptomId,
  onClose,
  onLogReadiness,
}: SymptomReliefModalProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [content, setContent] = useState<{ headline: string; tips: string[] } | null>(null);

  useEffect(() => {
    if (!visible || !symptomId) {
      setContent(null);
      return;
    }
    const fallback = SYMPTOM_RELIEF[symptomId];
    fetchSymptomReliefBySymptom(symptomId)
      .then((entry: SymptomReliefEntry | null) => {
        if (entry) setContent({ headline: entry.headline, tips: entry.tips });
        else if (fallback) setContent({ headline: fallback.headline, tips: fallback.tips });
        else setContent(null);
      })
      .catch(() => {
        if (fallback) setContent({ headline: fallback.headline, tips: fallback.tips });
        else setContent(null);
      });
  }, [visible, symptomId]);

  if (!content) return null;

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
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            maxHeight: "80%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1">
                <AppText variant="caption" muted>
                  Symtomlindring
                </AppText>
                <AppText variant="h2" color="$accent">
                  {content.headline}
                </AppText>
              </YStack>
              <Pressable onPress={onClose} hitSlop={16}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </XStack>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 320 }}
            >
              <YStack gap="$3" paddingBottom="$4">
                {content.tips.map((tip, i) => (
                  <XStack key={i} gap="$2" alignItems="flex-start">
                    <AppText variant="body" color="$accent">
                      •
                    </AppText>
                    <AppText variant="body" flex={1} muted>
                      {tip}
                    </AppText>
                  </XStack>
                ))}
              </YStack>
            </ScrollView>

            {onLogReadiness && (
              <AppButton
                variant="primary"
                onPress={() => {
                  onClose();
                  onLogReadiness();
                }}
              >
                Logga hur jag mår
              </AppButton>
            )}
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
