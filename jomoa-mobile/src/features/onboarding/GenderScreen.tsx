import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, Card } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import type { PresentationProfile } from "../../shared/types/onboarding";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Gender">;

const OPTIONS: { id: PresentationProfile; label: string; icon: string }[] = [
  { id: "male", label: "Man", icon: "♂" },
  { id: "female", label: "Kvinna", icon: "♀" },
  { id: "neutral", label: "Annat", icon: "◇" },
];

export function GenderScreen({ navigation }: Props) {
  const { data, updateData } = useOnboarding();

  const handleSelect = (profile: PresentationProfile) => {
    updateData({ presentationProfile: profile });
    navigation.navigate("Theme");
  };

  return (
    <Screen padded>
      <YStack flex={1} gap="$6" paddingTop="$4">
        <YStack gap="$2">
          <AppText variant="h1">Hur vill du att vi anpassar upplevelsen?</AppText>
          <AppText variant="body" muted>
            Vi anpassar program, tips och ton utifrån ditt val. Du kan alltid ändra i inställningar.
          </AppText>
        </YStack>

        <YStack gap="$3">
          {OPTIONS.map((opt) => {
            const isSelected = data.presentationProfile === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => handleSelect(opt.id)}
              >
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
                        backgroundColor={isSelected ? "$background" : "$surface3"}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppText variant="h2">{opt.icon}</AppText>
                      </XStack>
                      <AppText
                        variant="h3"
                        color={isSelected ? "$background" : "$color"}
                      >
                        {opt.label}
                      </AppText>
                    </XStack>
                  </Card.Content>
                </Card>
              </Pressable>
            );
          })}
        </YStack>
      </YStack>
    </Screen>
  );
}
