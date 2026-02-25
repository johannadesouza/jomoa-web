import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen, AppText, LoadingScreen } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import { useCalendarMonth } from "../../lib/hooks/useCalendarMonth";
import { getPhaseLabel, getPhaseColor } from "../../lib/utils/cycleUtils";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type CalendarCategory = "cykel" | "träning" | "kost" | "övrigt";

const CALENDAR_CATEGORIES: { id: CalendarCategory; label: string }[] = [
  { id: "cykel", label: "Cykel" },
  { id: "träning", label: "Träning" },
  { id: "kost", label: "Kost" },
  { id: "övrigt", label: "Övrigt" },
];

const WEEKDAY_LETTERS = ["M", "T", "O", "T", "F", "L", "S"];

export function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { refetch: refetchCycle } = useCycleContext();
  const [category, setCategory] = useState<CalendarCategory>("cykel");
  const {
    grid,
    monthLabel,
    isLoading,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    refetch: refetchCalendar,
  } = useCalendarMonth(client?.id);

  useFocusEffect(
    React.useCallback(() => {
      refetchCycle();
      refetchCalendar();
    }, [refetchCycle, refetchCalendar])
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen scroll padded>
      <YStack gap="$5">
        {/* Kategoritabs */}
        <XStack
          backgroundColor="$surface3"
          borderRadius="$4"
          padding="$1"
          flexDirection="row"
          gap="$1"
        >
          {CALENDAR_CATEGORIES.map(({ id, label }) => {
            const isSelected = category === id;
            return (
              <Pressable
                key={id}
                onPress={() => setCategory(id)}
                style={{ flex: 1 }}
              >
                <XStack
                  flex={1}
                  paddingVertical="$2"
                  paddingHorizontal="$2"
                  borderRadius="$3"
                  backgroundColor={isSelected ? "$background" : "transparent"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <AppText
                    variant="caption"
                    fontWeight="600"
                    color={isSelected ? "$color" : "$colorSecondary"}
                  >
                    {label}
                  </AppText>
                </XStack>
              </Pressable>
            );
          })}
        </XStack>

        {/* Månadsnavigering */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingVertical="$2"
        >
          <Pressable
            onPress={goToPrevMonth}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              minWidth={44}
              minHeight={44}
              alignItems="center"
              justifyContent="center"
            >
              <AppText variant="body" fontWeight="600">
                ←
              </AppText>
            </XStack>
          </Pressable>
          <AppText variant="h3" fontWeight="600">
            {monthLabel}
          </AppText>
          <Pressable
            onPress={goToNextMonth}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              minWidth={44}
              minHeight={44}
              alignItems="center"
              justifyContent="center"
            >
              <AppText variant="body" fontWeight="600">
                →
              </AppText>
            </XStack>
          </Pressable>
        </XStack>

        {/* Veckodagar */}
        <XStack justifyContent="space-around" paddingVertical="$2">
          {WEEKDAY_LETTERS.map((letter, i) => (
            <YStack key={i} flex={1} alignItems="center">
              <AppText variant="caption" color="$colorSecondary">
                {letter}
              </AppText>
            </YStack>
          ))}
        </XStack>

        {/* Datum-grid */}
        <YStack gap="$1">
          {grid.map((row, rowIdx) => (
            <XStack key={rowIdx} gap="$1">
              {row.map((day) => {
                const phaseColor = category === "cykel" && day.cyclePhase
                  ? getPhaseColor(day.cyclePhase)
                  : undefined;
                const isDimmed = !day.isCurrentMonth;
                const showPhaseLabel = category === "cykel" && day.cyclePhase;
                const showWorkout = day.loggedWorkout || day.plannedSession;
                const showNote = category === "övrigt" && day.note;

                return (
                  <Pressable
                    key={day.date}
                    onPress={() =>
                      navigation.navigate("DayDetail", {
                        date: day.date,
                        mode:
                          category === "cykel"
                            ? "cykel"
                            : category === "träning"
                            ? "träning"
                            : category === "kost"
                            ? "kost"
                            : category === "övrigt"
                            ? "övrigt"
                            : undefined,
                      })
                    }
                    style={{ flex: 1 }}
                  >
                    <YStack
                      flex={1}
                      minHeight={52}
                      alignItems="center"
                      justifyContent="center"
                      paddingVertical="$1"
                      paddingHorizontal="$1"
                      opacity={isDimmed ? 0.4 : 1}
                    >
                      {showPhaseLabel && (
                        <AppText
                          variant="caption"
                          numberOfLines={1}
                          style={{ color: phaseColor, fontSize: 9, fontWeight: "600" }}
                        >
                          {getPhaseLabel(day.cyclePhase).toUpperCase()}
                        </AppText>
                      )}
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: day.isToday ? "#D96D46" : "transparent",
                        }}
                      >
                        <AppText
                          variant="body"
                          fontWeight="700"
                          style={{
                            color: day.isToday ? "#FEE7AB" : phaseColor ?? undefined,
                          }}
                        >
                          {day.dateNum}
                        </AppText>
                      </View>
                      {day.isToday && (
                        <AppText variant="caption" color="$colorSecondary">
                          Idag
                        </AppText>
                      )}
                      {showWorkout && (
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: day.loggedWorkout
                              ? colors.success
                              : "transparent",
                            borderWidth: 1.5,
                            borderColor: colors.success,
                            opacity: day.loggedWorkout ? 1 : 0.7,
                            marginTop: 4,
                          }}
                        />
                      )}
                      {showNote && (
                        <AppText
                          variant="caption"
                          color="$accent"
                          numberOfLines={1}
                          style={{ fontSize: 9 }}
                        >
                          •
                        </AppText>
                      )}
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>
          ))}
        </YStack>

        {/* Idag-knapp */}
        <XStack justifyContent="center" paddingTop="$4">
          <Pressable
            onPress={goToToday}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <XStack
              backgroundColor="$accent"
              paddingHorizontal="$5"
              paddingVertical="$2"
              borderRadius="$4"
            >
              <AppText variant="body" fontWeight="600" color="$background">
                Idag
              </AppText>
            </XStack>
          </Pressable>
        </XStack>
      </YStack>
    </Screen>
  );
}
