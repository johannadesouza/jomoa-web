import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, AppButton, Card, AppIcon } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { OnboardingStepDots } from "./OnboardingStepDots";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Frequency">;

const FREQUENCIES = [
  { value: 2, label: "2 dagar/vecka", description: "Perfekt för nybörjare" },
  { value: 3, label: "3 dagar/vecka", description: "Balanserat upplägg" },
  { value: 4, label: "4 dagar/vecka", description: "För den motiverade" },
  { value: 5, label: "5+ dagar/vecka", description: "Avancerad nivå" },
];

export function FrequencyScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const copy = useAppCopy("sv", data.presentationProfile);

  const handleSelectFrequency = (frequency: number) => {
    if (data.trainingFrequency === frequency) {
      updateData({ trainingFrequency: null });
    } else {
      updateData({ trainingFrequency: frequency });
    }
  };

  const handleContinue = () => {
    if (data.onboardingPath === "training_only") {
      setCurrentStep(3);
      navigation.navigate("Complete");
    } else {
      setCurrentStep(3);
      navigation.navigate("CycleSetup");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const canContinue = data.trainingFrequency !== null;

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$6" paddingTop="$4">
          <YStack gap="$2">
            <AppText variant="h1">{getAppCopy(copy, "frequency_title", "Hur ofta vill du träna?")}</AppText>
            <AppText variant="body" muted>
              {getAppCopy(copy, "frequency_subtitle", "Vi anpassar programmet efter din tid")}
            </AppText>
          </YStack>

          <YStack gap="$3">
            {FREQUENCIES.map((freq) => {
              const isSelected = data.trainingFrequency === freq.value;
              return (
                <Pressable key={freq.value} onPress={() => handleSelectFrequency(freq.value)}>
                  <Card
                    backgroundColor={isSelected ? "$accent" : "$backgroundStrong"}
                    borderColor={isSelected ? "$accent" : "$borderColor"}
                    borderWidth={1}
                  >
                    <Card.Content>
                      <XStack justifyContent="space-between" alignItems="center" gap="$3">
                        <YStack flex={1}>
                          <AppText
                            variant="h3"
                            color={isSelected ? "$background" : "$color"}
                          >
                            {freq.label}
                          </AppText>
                          <AppText
                            variant="small"
                            color={isSelected ? "$background" : "$colorSecondary"}
                          >
                            {freq.description}
                          </AppText>
                        </YStack>
                        {isSelected && (
                          <AppIcon name="checkmark-circle" size={24} color="$background" />
                        )}
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
          <OnboardingStepDots path={data.onboardingPath} screen="Frequency" />
        </YStack>
      </YStack>
    </Screen>
  );
}
