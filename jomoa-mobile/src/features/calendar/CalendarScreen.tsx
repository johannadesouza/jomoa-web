import React from "react";
import { YStack, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  Badge,
  LoadingScreen,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useCalendar } from "../../lib/hooks/useCalendar";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const {
    days,
    weekLabel,
    isLoading,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
  } = useCalendar(client?.id);

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Kalender">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$4"
          >
            <AppButton variant="secondary" onPress={goToPrevWeek}>
              ←
            </AppButton>
            <AppText variant="body" fontWeight="600">
              {weekLabel}
            </AppText>
            <AppButton variant="secondary" onPress={goToNextWeek}>
              →
            </AppButton>
          </XStack>
          <AppButton variant="secondary" onPress={goToToday}>
            Idag
          </AppButton>
        </Section>

        <YStack gap="$2">
          {days.map((day) => (
            <Card key={day.date}>
              <Card.Content>
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  gap="$2"
                >
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      minWidth={40}
                      alignItems="center"
                      paddingVertical="$1"
                      backgroundColor={day.isToday ? "$accent" : "transparent"}
                      borderRadius="$2"
                    >
                      <AppText
                        variant="caption"
                        color={day.isToday ? "$background" : "$color"}
                      >
                        {day.dayName}
                      </AppText>
                      <AppText
                        variant="body"
                        fontWeight="600"
                        color={day.isToday ? "$background" : "$color"}
                      >
                        {day.dateNum}
                      </AppText>
                    </YStack>
                    <YStack flex={1} gap="$1">
                      {day.loggedWorkout ? (
                        <AppText variant="body" color="$success">
                          ✓ {day.loggedWorkout.program_session?.name ?? "Pass"}
                        </AppText>
                      ) : day.plannedSession ? (
                        <AppText variant="body">
                          {day.plannedSession.name}
                        </AppText>
                      ) : (
                        <AppText variant="body" muted>
                          —
                        </AppText>
                      )}
                      {day.cyclePhase && (
                        <Badge
                          variant="outline"
                          label={getPhaseLabel(day.cyclePhase)}
                          pressStyle={{ opacity: 0.8 }}
                          onPress={() => navigation.navigate("Cycle")}
                        />
                      )}
                    </YStack>
                  </XStack>
                  {day.plannedSession && !day.loggedWorkout && (
                    <AppButton
                      variant="primary"
                      onPress={() =>
                        navigation.navigate("WorkoutSession", {
                          sessionId: day.plannedSession!.id,
                        })
                      }
                    >
                      Starta
                    </AppButton>
                  )}
                </XStack>
              </Card.Content>
            </Card>
          ))}
        </YStack>
      </YStack>
    </Screen>
  );
}
