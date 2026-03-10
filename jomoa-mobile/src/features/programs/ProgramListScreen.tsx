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
  DataScreen,
  EmptyState,
} from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../shared/context/AuthContext";
import { useActiveProgram } from "../../lib/hooks/useActiveProgram";
import { getProgramGoalLabel, programMatchesPrimaryGoal } from "../../lib/utils/profileLabels";
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

  return (
    <DataScreen
      loading={isLoading}
      error={error ?? null}
      loadingMessage="Laddar program..."
      errorTitle="Kunde inte ladda program"
      onRetry={refetch}
    >
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
                  iconName="list-outline"
                  title="Inga program"
                  description="Det finns inga tillgängliga program just nu."
                  actionLabel="Tillbaka"
                  onAction={() => navigation.goBack()}
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
                            <XStack gap="$2" alignItems="center">
                              {programMatchesPrimaryGoal(program.target_goal, client?.primary_goal) && (
                                <Badge variant="outline" label="Passar ditt mål" />
                              )}
                              <Badge
                                variant={isActive ? "accent" : "outline"}
                                label={getStatusLabel(program.status)}
                              />
                            </XStack>
                          </XStack>

                          <XStack gap="$3" flexWrap="wrap">
                            {program.target_duration_weeks != null && program.target_duration_weeks > 0 && (
                              <AppText variant="caption" muted>
                                {program.target_duration_weeks} veckor
                              </AppText>
                            )}
                            {getProgramGoalLabel(program.target_goal) && (
                              <AppText variant="caption" muted>
                                {getProgramGoalLabel(program.target_goal)}
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
    </DataScreen>
  );
}
