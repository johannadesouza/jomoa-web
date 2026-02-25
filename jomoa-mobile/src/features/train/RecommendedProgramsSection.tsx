/**
 * Rekommenderat för dig – program som matchar användarens mål från onboarding
 */
import React, { useMemo } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";

import { Section, Card, AppText, Badge } from "../../shared/ui";
import { usePrograms } from "../../lib/hooks/usePrograms";
import {
  getPrimaryGoalLabel,
  getProgramGoalLabel,
  programMatchesPrimaryGoal,
} from "../../lib/utils/profileLabels";
import type { TrainingGoal } from "../../shared/types/onboarding";
import type { Program } from "../../lib/services/programService";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_RECOMMENDED = 3;

interface RecommendedProgramsSectionProps {
  primaryGoal: TrainingGoal | null | undefined;
  maxItems?: number;
}

function sortByGoalMatch(programs: Program[], primaryGoal: TrainingGoal | null | undefined): Program[] {
  if (!primaryGoal) return programs;
  const matching = programs.filter((p) => programMatchesPrimaryGoal(p.target_goal, primaryGoal));
  const rest = programs.filter((p) => !programMatchesPrimaryGoal(p.target_goal, primaryGoal));
  return [...matching, ...rest];
}

export function RecommendedProgramsSection({
  primaryGoal,
  maxItems = MAX_RECOMMENDED,
}: RecommendedProgramsSectionProps) {
  const navigation = useNavigation<NavigationProp>();
  const { programs, isLoading } = usePrograms();

  const recommended = useMemo(() => {
    const sorted = sortByGoalMatch(programs, primaryGoal);
    return sorted.slice(0, maxItems);
  }, [programs, primaryGoal, maxItems]);

  if (isLoading || recommended.length === 0) return null;

  const subtitle = primaryGoal
    ? `Baserat på ditt mål: ${getPrimaryGoalLabel(primaryGoal)}`
    : "Utforska program som passar dig";

  return (
    <Section
      title="Rekommenderat för dig"
      subtitle={subtitle}
      viewAllLabel="Se alla program"
      onViewAll={() => navigation.navigate("ProgramSelect")}
    >
      <YStack gap="$3">
        {recommended.map((program) => {
          const matchesGoal = programMatchesPrimaryGoal(program.target_goal, primaryGoal);
          return (
            <Pressable
              key={program.id}
              onPress={() => navigation.navigate("ProgramDetail", { programId: program.id })}
            >
              <Card>
                <Card.Content>
                  <YStack gap="$2">
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1} gap="$1">
                        <AppText variant="h3">{program.name}</AppText>
                        {program.description ? (
                          <AppText variant="small" muted numberOfLines={2}>
                            {program.description}
                          </AppText>
                        ) : null}
                      </YStack>
                      <AppText variant="body" color="$colorSecondary">
                        →
                      </AppText>
                    </XStack>
                    <XStack gap="$2" flexWrap="wrap">
                      {matchesGoal && (
                        <Badge variant="accent" label="Passar ditt mål" />
                      )}
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
                    </XStack>
                  </YStack>
                </Card.Content>
              </Card>
            </Pressable>
          );
        })}
      </YStack>
    </Section>
  );
}
