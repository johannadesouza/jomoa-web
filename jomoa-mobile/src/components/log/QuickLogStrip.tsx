/**
 * QuickLogStrip – Horisontella cirklar för snabbloggning (Hormona-inspirerad)
 * Trötthet, Uppblåsthet, Energi, Sömn – navigerar till ReadinessScreen
 */
import React from "react";
import { ScrollView, Pressable } from "react-native";
import { XStack, YStack, Text } from "tamagui";

import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import { AppText } from "../../shared/ui";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ITEMS = [
  { icon: "😴", label: "Trötthet" },
  { icon: "🫧", label: "Uppblåsthet" },
  { icon: "⚡", label: "Energi" },
  { icon: "🌙", label: "Sömn" },
] as const;

const CIRCLE_SIZE = 64;

export function QuickLogStrip() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, gap: 16 }}
    >
      <XStack gap="$4" paddingHorizontal="$2">
        {ITEMS.map((item) => (
          <YStack
            key={item.label}
            width={CIRCLE_SIZE}
            alignItems="center"
            gap="$1"
          >
            <Pressable
              onPress={() => navigation.navigate("Readiness")}
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
