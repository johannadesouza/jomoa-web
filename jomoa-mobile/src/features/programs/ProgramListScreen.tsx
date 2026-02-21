import React from "react";
import { YStack, XStack } from "tamagui";
import { Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  Screen,
  AppText,
  AppButton,
  Card,
  Section,
  Badge,
  LoadingScreen,
  EmptyState,
  ErrorState,
} from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../shared/context/AuthContext";
import { useActiveProgram } from "../../lib/hooks/useActiveProgram";
import type { ProgramWithStatus } from "../../lib/domain/program";

type Props = NativeStackScreenProps<RootStackParamList, "ProgramList">;

function getStatusLabel(status: ProgramWithStatus["status"]) {
  switch (status) {
    case "not_started":
      return "Inte påbörjad";
    case "active":
      return "Aktiv";
    case "completed":
      return "Genomförd";
    default:
      return "";
  }
}

function getGoalLabel(goal: string | null | undefined) {
  if (!goal) return null;
  const labels: Record<string, string> = {
    hypertrophy: "Muskeluppbyggnad",
    strength: "Styrka",
    endurance: "Uthållighet",
    general_fitness: "Allmän fitness",
  };
  return labels[goal] ?? goal;
}

export function ProgramListScreen({ navigation }: Props) {
  const { client, refreshClient } = useAuth();
  const {
    programs,
    activeAssignment,
    isLoading,
    error,
    isSwitching,
    switchProgram,
    refetch,
  } = useActiveProgram(client?.id);

  const handleSwitchPress = (program: ProgramWithStatus) => {
    const isActive = activeAssignment?.program_id === program.id;
    if (isActive) return;

    Alert.alert(
      "Byt program",
      `Vill du arkivera framsteg och byta till "${program.name}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Byt program",
          onPress: async () => {
            if (!client?.id) return;
            const { error: switchErr } = await switchProgram(client.id, program.id);
            if (switchErr) {
              Alert.alert("Fel", "Kunde inte byta program. Försök igen.");
            } else {
              await refreshClient();
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <LoadingScreen message="Laddar program..." />;

  if (error) {
    return (
      <Screen padded centered>
        <ErrorState
          title="Kunde inte ladda program"
          description={error}
          retryLabel="Försök igen"
          onRetry={refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <YStack gap="$2">
          <AppText variant="h1">Mina program</AppText>
          <AppText variant="body" muted>
            Se och byt mellan tillgängliga träningsprogram
          </AppText>
        </YStack>

        <Section title="Tillgängliga program">
          {programs.length === 0 ? (
            <Card>
              <Card.Content>
                <EmptyState
                  title="Inga program"
                  description="Det finns inga tillgängliga program just nu."
                />
              </Card.Content>
            </Card>
          ) : (
            <YStack gap="$4">
              {programs.map((program) => {
                const isActive = activeAssignment?.program_id === program.id;
                return (
                  <Pressable
                    key={program.id}
                    onPress={() => navigation.navigate("ProgramDetail", { programId: program.id })}
                  >
                    <Card>
                      <Card.Content>
                        <YStack gap="$3">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$1">
                              <AppText variant="h3">{program.name}</AppText>
                              {program.description && (
                                <AppText variant="small" muted>
                                  {program.description}
                                </AppText>
                              )}
                            </YStack>
                            <Badge
                              variant={isActive ? "accent" : "outline"}
                              label={getStatusLabel(program.status)}
                            />
                          </XStack>

                          <XStack gap="$3" flexWrap="wrap">
                            {program.target_duration_weeks && (
                              <AppText variant="caption" muted>
                                {program.target_duration_weeks} veckor
                              </AppText>
                            )}
                            {getGoalLabel(program.target_goal) && (
                              <AppText variant="caption" muted>
                                {getGoalLabel(program.target_goal)}
                              </AppText>
                            )}
                            {program.status === "active" && program.progressionPercent > 0 && (
                              <AppText variant="caption" muted>
                                {program.progressionPercent}% genomfört
                              </AppText>
                            )}
                          </XStack>

                          {!isActive && (
                            <AppButton
                              variant="secondary"
                              size="sm"
                              disabled={isSwitching}
                              onPress={() => handleSwitchPress(program)}
                            >
                              {isSwitching ? "Byter..." : "Byt till detta program"}
                            </AppButton>
                          )}
                        </YStack>
                      </Card.Content>
                    </Card>
                  </Pressable>
                );
              })}
            </YStack>
          )}
        </Section>
      </YStack>
    </Screen>
  );
}
