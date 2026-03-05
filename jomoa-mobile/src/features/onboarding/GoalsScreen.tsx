import React, { useEffect, useState } from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, AppButton, Card } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { OnboardingStepDots } from "./OnboardingStepDots";
import { TrainingGoal } from "../../shared/types/onboarding";
import { fetchTrainingGoals, type TrainingGoalEntry } from "../../lib/repos/contentRepo";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Goals">;

const FALLBACK_GOALS: TrainingGoalEntry[] = [
  { id: "muscle_growth", label: "Bygga muskler", description: "Öka muskelmassa och forma kroppen", icon: "💪", program_target_goal: "hypertrophy", order_index: 0 },
  { id: "strength", label: "Bli starkare", description: "Öka styrka och kraft", icon: "🏋️", program_target_goal: "strength", order_index: 1 },
  { id: "fat_loss", label: "Gå ner i vikt", description: "Bränna fett och bli smalare", icon: "🔥", program_target_goal: "general_fitness", order_index: 2 },
  { id: "performance", label: "Bättre prestation", description: "Förbättra uthållighet och kondition", icon: "⚡", program_target_goal: "endurance", order_index: 3 },
  { id: "maintenance", label: "Hålla formen", description: "Behålla nuvarande nivå", icon: "✨", program_target_goal: "general_fitness", order_index: 4 },
];

export function GoalsScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [goals, setGoals] = useState<TrainingGoalEntry[]>(FALLBACK_GOALS);
  const copy = useAppCopy("sv", data.presentationProfile);

  useEffect(() => {
    let cancelled = false;
    fetchTrainingGoals()
      .then((list) => { if (!cancelled) setGoals(list.length ? list : FALLBACK_GOALS); })
      .catch(() => { if (!cancelled) setGoals(FALLBACK_GOALS); });
    return () => { cancelled = true; };
  }, []);

  const handleSelectGoal = (goalId: string) => {
    const goal = goalId as TrainingGoal;
    if (data.primaryGoal === goal) {
      updateData({ primaryGoal: null });
    } else {
      updateData({ primaryGoal: goal });
    }
  };

  const handleContinue = () => {
    setCurrentStep(2);
    navigation.navigate("Frequency");
  };

  const canContinue = data.primaryGoal !== null;

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$6" paddingTop="$4">
          <YStack gap="$2">
            <AppText variant="h1">{getAppCopy(copy, "goals_title", "Vad är ditt mål?")}</AppText>
            <AppText variant="body" muted>
              {getAppCopy(copy, "goals_subtitle", "Välj det som passar dig bäst")}
            </AppText>
          </YStack>

          <YStack gap="$3">
            {goals.map((goal) => {
              const isSelected = data.primaryGoal === goal.id;
              return (
                <Pressable key={goal.id} onPress={() => handleSelectGoal(goal.id)}>
                  <Card
                    backgroundColor={isSelected ? "$accent" : "$backgroundStrong"}
                    borderColor={isSelected ? "$accent" : "$borderColor"}
                    borderWidth={1}
                  >
                    <Card.Content>
                      <XStack gap="$3" alignItems="center">
                        <XStack
                          width={48}
                          height={48}
                          borderRadius="$full"
                          backgroundColor={isSelected ? "$background" : "$background"}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <AppText variant="h2">{goal.icon ?? "•"}</AppText>
                        </XStack>
                        <YStack flex={1}>
                          <AppText
                            variant="h3"
                            color={isSelected ? "$background" : "$color"}
                          >
                            {goal.label}
                          </AppText>
                          <AppText
                            variant="small"
                            color={isSelected ? "$background" : "$colorSecondary"}
                          >
                            {goal.description ?? ""}
                          </AppText>
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
                    </Card.Content>
                  </Card>
                </Pressable>
              );
            })}
          </YStack>
        </YStack>

        <YStack gap="$4" paddingBottom="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onPress={handleContinue}
          >
            Fortsätt
          </AppButton>
          <OnboardingStepDots path={data.onboardingPath} screen="Goals" />
        </YStack>
      </YStack>
    </Screen>
  );
}
