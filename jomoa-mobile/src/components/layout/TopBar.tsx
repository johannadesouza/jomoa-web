import React from "react";
import { Pressable } from "react-native";
import { XStack, YStack, Text } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import { AppText } from "../../shared/ui";

type TopBarIcon = "settings" | "calendar" | "search" | "profile";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  rightIcons?: TopBarIcon[];
  onSettings?: () => void;
  onCalendar?: () => void;
  onSearch?: () => void;
  onProfile?: () => void;
}

const ICON_MAP: Record<TopBarIcon, keyof typeof Ionicons.glyphMap> = {
  settings: "settings-outline",
  calendar: "calendar-outline",
  search: "search-outline",
  profile: "person-circle-outline",
};

export function TopBar({
  title,
  subtitle,
  rightIcons = ["settings"],
  onSettings,
  onCalendar,
  onSearch,
  onProfile,
}: TopBarProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const renderIcon = (icon: TopBarIcon) => {
    const onPress =
      icon === "settings"
        ? onSettings
        : icon === "calendar"
          ? onCalendar
          : icon === "search"
            ? onSearch
            : onProfile;
    if (!onPress) return null;
    return (
      <Pressable
        key={icon}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <YStack padding="$2" minWidth={44} minHeight={44} alignItems="center" justifyContent="center">
          <Ionicons
            name={ICON_MAP[icon]}
            size={22}
            color={colors.textPrimary}
          />
        </YStack>
      </Pressable>
    );
  };

  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderSoft"
    >
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$1">
        {title ? (
          <Text
            fontFamily="$heading"
            fontSize="$4"
            fontWeight="600"
            color="$accent"
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        ) : null}
      </YStack>
      <XStack gap="$1">
        {rightIcons.map(renderIcon)}
      </XStack>
    </XStack>
  );
}
