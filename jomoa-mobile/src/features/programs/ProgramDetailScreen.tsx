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
} from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../shared/context/AuthContext";
import { useActiveProgram } from "../../lib/hooks/useActiveProgram";
import { fetchProgramWithStructure } from "../../lib/services/programService";
import type { ProgramWithStructure, ProgramSession } from "../../lib/domain/program";

type Props = NativeStackScreenProps<RootStackParamList, "ProgramDetail">;

const DAY_NAMES: Record<number, string> = {
  1: "Måndag",
  2: "Tisdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lördag",
  7: "Söndag",
};

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

export function ProgramDetailScreen({ navigation, route }: Props) {
  const { programId } = route.params;
  const { client, refreshClient } = useAuth();
  const { programs, activeAssignment, switchProgram, isSwitching } =
    useActiveProgram(client?.id);
  const [structure, setStructure] = React.useState<ProgramWithStructure | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const program = programs.find((p) => p.id === programId);
  const isActive = activeAssignment?.program_id === programId;

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await fetchProgramWithStructure(programId);
      if (!cancelled) {
        setStructure(data ?? null);
      }
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  const handleActivateOrSwitch = () => {
    if (!client?.id) return;
    if (isActive) return;

    Alert.alert(
      "Byt program",
      `Vill du arkivera framsteg och byta till "${program?.name ?? "detta program"}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Byt program",
          onPress: async () => {
            const { error: switchErr } = await switchProgram(client.id, programId);
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

  if (isLoading || !structure) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Laddar...
        </AppText>
      </Screen>
    );
  }

  const { program: prog, blocks, weeks, sessions } = structure;

  const sessionsByWeek = weeks.reduce<Record<string, ProgramSession[]>>((acc, w) => {
    acc[w.id] = sessions.filter((s) => s.week_id === w.id);
    return acc;
  }, {});

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <AppText variant="h1">{prog.name}</AppText>
            {isActive && <Badge variant="accent" label="Aktiv" />}
          </XStack>
          {prog.description && (
            <AppText variant="body" muted>
              {prog.description}
            </AppText>
          )}
        </YStack>

        <Section title="Översikt">
          <Card>
            <Card.Content>
              <YStack gap="$3">
                {prog.target_duration_weeks && (
                  <XStack justifyContent="space-between">
                    <AppText variant="small" muted>
                      Längd
                    </AppText>
                    <AppText variant="small">{prog.target_duration_weeks} veckor</AppText>
                  </XStack>
                )}
                {getGoalLabel(prog.target_goal) && (
                  <XStack justifyContent="space-between">
                    <AppText variant="small" muted>
                      Mål
                    </AppText>
                    <AppText variant="small">{getGoalLabel(prog.target_goal)}</AppText>
                  </XStack>
                )}
                {program?.progressionPercent != null && program.progressionPercent > 0 && (
                  <XStack justifyContent="space-between">
                    <AppText variant="small" muted>
                      Genomfört
                    </AppText>
                    <AppText variant="small">{program.progressionPercent}%</AppText>
                  </XStack>
                )}
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        {blocks.length > 0 && (
          <Section title="Struktur">
            <YStack gap="$3">
              {blocks.map((block) => (
                <Card key={block.id}>
                  <Card.Content>
                    <YStack gap="$2">
                      <AppText variant="h3">{block.name}</AppText>
                      {block.weeks_count && (
                        <AppText variant="small" muted>
                          {block.weeks_count} veckor
                        </AppText>
                      )}
                    </YStack>
                  </Card.Content>
                </Card>
              ))}
            </YStack>
          </Section>
        )}

        <Section title="Kommande pass">
          <YStack gap="$3">
            {weeks.slice(0, 4).map((week) => {
              const weekSessions = sessionsByWeek[week.id] ?? [];
              if (weekSessions.length === 0) return null;
              return (
                <Card key={week.id}>
                  <Card.Content>
                    <YStack gap="$3">
                      <AppText variant="h3" muted>
                        Vecka {week.week_number}
                        {week.name ? ` – ${week.name}` : ""}
                      </AppText>
                      <YStack gap="$2">
                        {weekSessions
                          .sort((a, b) => a.day_of_week - b.day_of_week)
                          .map((session) => (
                            <XStack
                              key={session.id}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <AppText variant="body">
                                {DAY_NAMES[session.day_of_week] ?? `Dag ${session.day_of_week}`}
                              </AppText>
                              <YStack alignItems="flex-end">
                                <AppText variant="small">{session.name}</AppText>
                                {session.focus && (
                                  <AppText variant="caption" muted>
                                    {session.focus}
                                  </AppText>
                                )}
                              </YStack>
                            </XStack>
                          ))}
                      </YStack>
                    </YStack>
                  </Card.Content>
                </Card>
              );
            })}
          </YStack>
        </Section>

        {!isActive && (
          <YStack paddingVertical="$4">
            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSwitching}
              onPress={handleActivateOrSwitch}
            >
              {isSwitching ? "Byter..." : "Aktivera program"}
            </AppButton>
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}
