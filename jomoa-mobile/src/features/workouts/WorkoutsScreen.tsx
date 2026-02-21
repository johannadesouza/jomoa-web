import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack, Text } from "tamagui";
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
  EmptyState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useWorkouts } from "../../lib/hooks/useWorkouts";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { ProgramSessionData } from "../../lib/services/workoutService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SessionBadge({ focus }: { focus: string | null | undefined }) {
  return <Badge variant="default" label={focus || " "} opacity={focus ? 1 : 0} />;
}

function getDayName(dayOfWeek: number): string {
  const days = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
  return days[dayOfWeek] || "Okänd";
}

export function WorkoutsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const { sessions, programName, isLoading, refetch } = useWorkouts(client?.id);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) return <LoadingScreen />;

  if (sessions.length === 0) {
    return (
      <Screen padded centered>
        <EmptyState
          icon="💪"
          title="Inga pass"
          description="Du har inget aktivt träningsprogram ännu."
          actionLabel="Välj program"
          onAction={() => navigation.navigate("ProgramSelect")}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Dina pass" subtitle={programName || undefined}>
          <YStack gap="$4">
            {sessions.map((session: ProgramSessionData) => (
              <Card key={session.id} pressable>
                <Card.Header>
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack gap="$1">
                      <Card.Title>{session.name}</Card.Title>
                      <AppText variant="caption">
                        {getDayName(session.day_of_week)}
                      </AppText>
                    </YStack>
                    <SessionBadge focus={session.focus} />
                  </XStack>
                </Card.Header>
                <Card.Content>
                  <XStack gap="$4">
                    <YStack gap="$1">
                      <Text fontSize="$lg" fontWeight="600" color="$textPrimary">
                        {session.session_exercises?.length || 0}
                      </Text>
                      <AppText variant="caption">övningar</AppText>
                    </YStack>
                    <YStack gap="$1">
                      <Text fontSize="$lg" fontWeight="600" color="$textPrimary">
                        {session.session_exercises?.reduce(
                          (sum, e) => sum + (e.sets_planned || 0),
                          0
                        ) || 0}
                      </Text>
                      <AppText variant="caption">set totalt</AppText>
                    </YStack>
                  </XStack>
                </Card.Content>
                <Card.Footer>
                  <XStack gap="$3">
                    <AppButton
                      variant="primary"
                      size="sm"
                      onPress={() =>
                        navigation.navigate("WorkoutSession", { sessionId: session.id })
                      }
                    >
                      Starta pass
                    </AppButton>
                  </XStack>
                </Card.Footer>
              </Card>
            ))}
          </YStack>
        </Section>
      </YStack>
    </Screen>
  );
}
