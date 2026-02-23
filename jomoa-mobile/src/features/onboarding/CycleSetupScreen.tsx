import React, { useState } from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import {
  Screen,
  AppText,
  AppButton,
  Card,
  AppInput,
} from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { OnboardingStepDots } from "./OnboardingStepDots";

type Props = NativeStackScreenProps<OnboardingStackParamList, "CycleSetup">;

export function CycleSetupScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [lastPeriodInput, setLastPeriodInput] = useState(
    data.lastPeriodStart ?? ""
  );

  const isCycleOnly = data.onboardingPath === "cycle_only";
  const wantsTracking = isCycleOnly || data.wantsCycleTracking === true;

  const handleSelect = (value: boolean | null) => {
    updateData({ wantsCycleTracking: value });
    if (value === false) {
      updateData({ lastPeriodStart: null });
      setLastPeriodInput("");
    }
  };

  const handleContinue = () => {
    const dateMatch = lastPeriodInput.match(/^\d{4}-\d{2}-\d{2}$/);
    if (wantsTracking && dateMatch) {
      updateData({ lastPeriodStart: lastPeriodInput });
    } else if (wantsTracking && lastPeriodInput.trim() === "") {
      updateData({ lastPeriodStart: null });
    }
    setCurrentStep(5);
    navigation.navigate("Complete");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$6" paddingTop="$4">
          <YStack gap="$2">
            <AppText variant="h1">
              {isCycleOnly ? "Logga din period" : "Menscykel"}
            </AppText>
            <AppText variant="body" muted>
              {isCycleOnly
                ? "När började din senaste period? Vi anpassar rekommendationer utifrån din cykelfas."
                : "Vill du spåra din cykel för anpassade träningsrekommendationer?"}
            </AppText>
          </YStack>

          {!isCycleOnly && (
          <YStack gap="$2">
            <Pressable onPress={() => handleSelect(true)}>
              <Card
                backgroundColor={
                  wantsTracking ? "$accent" : "$backgroundStrong"
                }
                borderColor={wantsTracking ? "$accent" : "$borderColor"}
                borderWidth={1}
              >
                <Card.Content>
                  <XStack gap="$3" alignItems="center">
                    <AppText variant="h2">🌙</AppText>
                    <YStack flex={1}>
                      <AppText
                        variant="h3"
                        color={wantsTracking ? "$background" : "$color"}
                      >
                        Ja, spåra min cykel
                      </AppText>
                      <AppText
                        variant="small"
                        color={wantsTracking ? "$background" : "$colorSecondary"}
                      >
                        Få rekommendationer utifrån din fas
                      </AppText>
                    </YStack>
                  </XStack>
                </Card.Content>
              </Card>
            </Pressable>

            <Pressable onPress={() => handleSelect(false)}>
              <Card
                backgroundColor={
                  data.wantsCycleTracking === false ? "$accent" : "$backgroundStrong"
                }
                borderColor={
                  data.wantsCycleTracking === false ? "$accent" : "$borderColor"
                }
                borderWidth={1}
              >
                <Card.Content>
                  <XStack gap="$3" alignItems="center">
                    <AppText variant="h2">✗</AppText>
                    <YStack flex={1}>
                      <AppText
                        variant="h3"
                        color={
                          data.wantsCycleTracking === false
                            ? "$background"
                            : "$color"
                        }
                      >
                        Nej, tack
                      </AppText>
                      <AppText
                        variant="small"
                        color={
                          data.wantsCycleTracking === false
                            ? "$background"
                            : "$colorSecondary"
                        }
                      >
                        Jag vill inte spåra min cykel
                      </AppText>
                    </YStack>
                  </XStack>
                </Card.Content>
              </Card>
            </Pressable>
          </YStack>
          )}

          {wantsTracking && (
              <YStack gap="$2" marginTop={isCycleOnly ? 0 : "$2"} padding="$4" backgroundColor="$surface3" borderRadius="$3">
                <AppText variant="small" muted>
                  {isCycleOnly
                    ? "När började din senaste period?"
                    : "När började din senaste period? (valfritt)"}
                </AppText>
                <AppInput
                  placeholder="ÅÅÅÅ-MM-DD"
                  value={lastPeriodInput}
                  onChangeText={setLastPeriodInput}
                />
                <AppText variant="caption" muted>
                  Du kan alltid logga detta senare under Inställningar → Menscykel
                </AppText>
              </YStack>
            )}
        </YStack>

        <YStack gap="$4" paddingBottom="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
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
          <OnboardingStepDots path={data.onboardingPath} screen="CycleSetup" />
        </YStack>
      </YStack>
    </Screen>
  );
}
