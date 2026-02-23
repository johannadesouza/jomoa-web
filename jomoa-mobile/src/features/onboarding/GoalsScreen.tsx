import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, AppButton, Card } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { OnboardingStepDots } from "./OnboardingStepDots";
import { TrainingGoal } from "../../shared/types/onboarding";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Goals">;

const GOALS: { id: TrainingGoal; label: string; icon: string; description: string }[] = [
  {
    id: "muscle_growth",
    label: "Bygga muskler",
    icon: "💪",
    description: "Öka muskelmassa och forma kroppen",
  },
  {
    id: "strength",
    label: "Bli starkare",
    icon: "🏋️",
    description: "Öka styrka och kraft",
  },
  {
    id: "fat_loss",
    label: "Gå ner i vikt",
    icon: "🔥",
    description: "Bränna fett och bli smalare",
  },
  {
    id: "performance",
    label: "Bättre prestation",
    icon: "⚡",
    description: "Förbättra uthållighet och kondition",
  },
  {
    id: "maintenance",
    label: "Hålla formen",
    icon: "✨",
    description: "Behålla nuvarande nivå",
  },
];

export function GoalsScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleSelectGoal = (goal: TrainingGoal) => {
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
            <AppText variant="h1">Vad är ditt mål?</AppText>
            <AppText variant="body" muted>
              Välj det som passar dig bäst
            </AppText>
          </YStack>

          <YStack gap="$3">
            {GOALS.map((goal) => {
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
                          <AppText variant="h2">{goal.icon}</AppText>
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
                            {goal.description}
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
