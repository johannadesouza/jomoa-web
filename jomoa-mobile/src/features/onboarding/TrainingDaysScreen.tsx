import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, AppButton, Card } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { DayOfWeek } from "../../shared/types/onboarding";

type Props = NativeStackScreenProps<OnboardingStackParamList, "TrainingDays">;

const DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 1, label: "Måndag", short: "Mån" },
  { value: 2, label: "Tisdag", short: "Tis" },
  { value: 3, label: "Onsdag", short: "Ons" },
  { value: 4, label: "Torsdag", short: "Tor" },
  { value: 5, label: "Fredag", short: "Fre" },
  { value: 6, label: "Lördag", short: "Lör" },
  { value: 7, label: "Söndag", short: "Sön" },
];

export function TrainingDaysScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleToggleDay = (day: DayOfWeek) => {
    const currentDays = data.trainingDays || [];
    if (currentDays.includes(day)) {
      updateData({ trainingDays: currentDays.filter((d) => d !== day) });
    } else {
      updateData({ trainingDays: [...currentDays, day] });
    }
  };

  const handleContinue = () => {
    setCurrentStep(4);
    navigation.navigate("CycleSetup");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const selectedCount = data.trainingDays?.length || 0;
  const targetCount = data.trainingFrequency || 3;
  const canContinue = selectedCount >= targetCount;

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$6" paddingTop="$4">
          <YStack gap="$2">
            <AppText variant="h1">Vilka dagar passar dig?</AppText>
            <AppText variant="body" muted>
              Välj minst {targetCount} dagar (valt: {selectedCount})
            </AppText>
          </YStack>

          <YStack gap="$2">
            {DAYS.map((day) => {
              const isSelected = data.trainingDays?.includes(day.value) || false;
              return (
                <Pressable key={day.value} onPress={() => handleToggleDay(day.value)}>
                  <Card
                    backgroundColor={isSelected ? "$accent" : "$backgroundStrong"}
                    borderColor={isSelected ? "$accent" : "$borderColor"}
                    borderWidth={1}
                  >
                    <Card.Content>
                      <XStack justifyContent="space-between" alignItems="center">
                        <AppText
                          variant="h3"
                          color={isSelected ? "$background" : "$color"}
                        >
                          {day.label}
                        </AppText>
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
          <AppButton
            variant="ghost"
            size="md"
            fullWidth
            onPress={handleBack}
          >
            Tillbaka
          </AppButton>
          <XStack justifyContent="center" gap="$2">
            {[1, 2, 3, 4, 5].map((step) => (
              <XStack
                key={step}
                width={8}
                height={8}
                borderRadius="$full"
                backgroundColor={step === 3 ? "$accent" : "$borderColor"}
              />
            ))}
          </XStack>
        </YStack>
      </YStack>
    </Screen>
  );
}
