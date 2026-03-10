/**
 * WorkoutChallengeChips – val "Hur utmanande var övningen?" under pass.
 */
import React from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import { AppText } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import type { ExerciseChallengeLevel } from "../../lib/domain/workout";

const CHALLENGE_LABELS: Record<ExerciseChallengeLevel, string> = {
  easy: "Lätt",
  ok: "Lagom",
  hard: "Hårt",
};

export interface WorkoutChallengeChipsProps {
  selected: ExerciseChallengeLevel | null;
  onSelect: (level: ExerciseChallengeLevel | null) => void;
}

export function WorkoutChallengeChips({ selected, onSelect }: WorkoutChallengeChipsProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <YStack gap="$2">
      <AppText variant="caption" muted>
        Hur utmanande var övningen?
      </AppText>
      <XStack gap="$2" flexWrap="wrap">
        {(["easy", "ok", "hard"] as const).map((level) => {
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              onPress={() => onSelect(selected === level ? null : level)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isSelected ? colors.accent : colors.surface3,
                borderWidth: 1,
                borderColor: isSelected ? colors.accent : "transparent",
              }}
            >
              <AppText
                variant="small"
                fontWeight="500"
                style={{ color: isSelected ? "#fff" : colors.textPrimary }}
              >
                {CHALLENGE_LABELS[level]}
              </AppText>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
}
