import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, Card } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import type { OnboardingPath } from "../../shared/types/onboarding";

type Props = NativeStackScreenProps<OnboardingStackParamList, "PathChoice">;

const PATHS: {
  id: OnboardingPath;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "cycle_only",
    label: "Endast cykelspårning",
    icon: "🌙",
    description: "Spåra menscykel och readiness – utan träningsprogram",
  },
  {
    id: "training_only",
    label: "Endast träning",
    icon: "💪",
    description: "Träningsprogram och pass – utan cykelspårning",
  },
  {
    id: "both",
    label: "Båda",
    icon: "✨",
    description: "Cykelspårning + träning – full anpassning utifrån din fas",
  },
];

export function PathChoiceScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const copy = useAppCopy("sv", data.presentationProfile);

  const handleSelect = (path: OnboardingPath) => {
    updateData({ onboardingPath: path });
    if (path === "cycle_only") {
      updateData({ wantsCycleTracking: true });
      setCurrentStep(1);
      navigation.navigate("CycleSetup");
    } else if (path === "training_only") {
      updateData({ wantsCycleTracking: false });
      navigation.navigate("Goals");
    } else {
      navigation.navigate("Goals");
    }
  };

  return (
    <Screen padded>
      <YStack flex={1} gap="$6" paddingTop="$4">
        <YStack gap="$2">
          <AppText variant="h1">{getAppCopy(copy, "path_choice_title", "Vad vill du använda JOMOA till?")}</AppText>
          <AppText variant="body" muted>
            {getAppCopy(copy, "path_choice_subtitle", "Välj vad som passar – du kan lägga till cykel senare om du vill.")}
          </AppText>
        </YStack>

        <YStack gap="$3">
          {PATHS.map((path) => {
            const isSelected = data.onboardingPath === path.id;
            return (
              <Pressable
                key={path.id}
                onPress={() => handleSelect(path.id)}
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
                        <AppText variant="h2">{path.icon}</AppText>
                      </XStack>
                      <YStack flex={1}>
                        <AppText
                          variant="h3"
                          color={isSelected ? "$background" : "$color"}
                        >
                          {path.label}
                        </AppText>
                        <AppText
                          variant="small"
                          color={isSelected ? "$background" : "$colorSecondary"}
                        >
                          {path.description}
                        </AppText>
                      </YStack>
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
