import React from "react";
import { YStack, XStack } from "tamagui";
import { Alert, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen, AppText, AppButton, Card, Section, LoadingScreen } from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../shared/context/AuthContext";
import { usePrograms, useProgramSelect } from "../../lib/hooks/usePrograms";

type Props = NativeStackScreenProps<RootStackParamList, "ProgramSelect">;

function getDifficultyLabel(level: string | null) {
  const labels: Record<string, string> = {
    beginner: "Nybörjare",
    intermediate: "Medel",
    advanced: "Avancerad",
  };
  return level ? labels[level] || level : "Alla nivåer";
}

export function ProgramSelectScreen({ navigation }: Props) {
  const { client, refreshClient } = useAuth();
  const { programs, isLoading } = usePrograms();
  const { selectProgram, isSaving } = useProgramSelect(client?.id, async () => {
    await refreshClient();
    navigation.goBack();
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelectProgram = async () => {
    if (!selectedId || !client?.id) return;

    try {
      await selectProgram(selectedId);
    } catch (error) {
      console.error("Error selecting program:", error);
      Alert.alert("Fel", "Kunde inte välja program. Försök igen.");
    }
  };

  if (isLoading) return <LoadingScreen message="Laddar program..." />;

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <AppText variant="h1">Välj program</AppText>
            <AppButton variant="ghost" size="sm" onPress={() => navigation.goBack()}>
              Stäng
            </AppButton>
          </XStack>
          <AppText variant="body" muted>
            Välj ett träningsprogram som passar dig
          </AppText>
        </YStack>

        <Section title="Tillgängliga program">
          <YStack gap="$4">
            {programs.length === 0 ? (
              <Card>
                <Card.Content>
                  <AppText variant="body" muted center>
                    Inga program tillgängliga
                  </AppText>
                </Card.Content>
              </Card>
            ) : (
              programs.map((program) => {
                const isSelected = selectedId === program.id;
                return (
                  <Pressable key={program.id} onPress={() => setSelectedId(program.id)}>
                    <Card
                      backgroundColor={isSelected ? "$accent" : "$backgroundStrong"}
                      borderColor={isSelected ? "$accent" : "$borderColor"}
                      borderWidth={1}
                    >
                      <Card.Content>
                        <YStack gap="$2">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$1">
                              <AppText
                                variant="h3"
                                color={isSelected ? "$background" : "$color"}
                              >
                                {program.name}
                              </AppText>
                              {program.description && (
                                <AppText
                                  variant="small"
                                  color={isSelected ? "$background" : "$colorSecondary"}
                                >
                                  {program.description}
                                </AppText>
                              )}
                            </YStack>
                            <XStack
                              width={24}
                              height={24}
                              borderRadius="$full"
                              borderWidth={2}
                              borderColor={isSelected ? "$background" : "$borderColor"}
                              backgroundColor={isSelected ? "$background" : "transparent"}
                              alignItems="center"
                              justifyContent="center"
                            >
                              {isSelected && (
                                <XStack
                                  width={12}
                                  height={12}
                                  borderRadius="$full"
                                  backgroundColor="$accent"
                                />
                              )}
                            </XStack>
                          </XStack>

                          <XStack gap="$4" marginTop="$2">
                            {program.target_duration_weeks != null && program.target_duration_weeks > 0 && (
                              <AppText
                                variant="caption"
                                color={isSelected ? "$background" : "$colorSecondary"}
                              >
                                {program.target_duration_weeks} veckor
                              </AppText>
                            )}
                          </XStack>
                        </YStack>
                      </Card.Content>
                    </Card>
                  </Pressable>
                );
              })
            )}
          </YStack>
        </Section>

        <YStack paddingVertical="$4">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedId}
            loading={isSaving}
            onPress={handleSelectProgram}
          >
            Välj detta program
          </AppButton>
        </YStack>
      </YStack>
    </Screen>
  );
}
