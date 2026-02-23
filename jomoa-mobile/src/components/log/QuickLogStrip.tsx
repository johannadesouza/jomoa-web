/**
 * QuickLogStrip – Horisontella cirklar för snabbloggning
 * Logga annat + Trötthet, Uppblåsthet, Energi: Låg, Sömn – öppnar Symtomlindring eller Logga
 */
import React from "react";
import { ScrollView, Pressable } from "react-native";
import { XStack, YStack, Text } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import { AppText } from "../../shared/ui";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import type { SymptomId } from "../../lib/data/symptomReliefData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CIRCLE_SIZE = 64;

interface QuickLogStripProps {
  onLogOther?: () => void;
  onSymptomPress?: (symptomId: SymptomId) => void;
}

const SYMPTOM_ITEMS: { id: SymptomId; icon: string; label: string }[] = [
  { id: "trötthet", icon: "😴", label: "Trötthet" },
  { id: "uppblåsthet", icon: "🫧", label: "Uppblåsthet" },
  { id: "energi", icon: "😩", label: "Energi: Låg" },
  { id: "sömn", icon: "🌙", label: "Sömn" },
];

export function QuickLogStrip({ onLogOther, onSymptomPress }: QuickLogStripProps) {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const goToReadiness = () => navigation.navigate("Readiness");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8, gap: 12, paddingRight: 16 }}
    >
      <XStack gap="$4" paddingHorizontal="$2" alignItems="flex-end">
        {/* Logga annat – accent-styled */}
        <YStack width={CIRCLE_SIZE} alignItems="center" gap="$1">
          <Pressable
            onPress={onLogOther ?? goToReadiness}
            style={({ pressed }) => ({
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: CIRCLE_SIZE / 2,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: colors.accent,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="add" size={28} color={colors.accent} />
          </Pressable>
          <AppText variant="caption" muted numberOfLines={1}>
            Logga annat
          </AppText>
        </YStack>

        {SYMPTOM_ITEMS.map((item) => (
          <YStack key={item.id} width={CIRCLE_SIZE} alignItems="center" gap="$1">
            <Pressable
              onPress={() => (onSymptomPress ? onSymptomPress(item.id) : goToReadiness())}
              style={({ pressed }) => ({
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                backgroundColor: colors.surface3,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.borderSoft,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text fontSize="$xl">{item.icon}</Text>
            </Pressable>
            <AppText variant="caption" muted numberOfLines={1}>
              {item.label}
            </AppText>
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  );
}
