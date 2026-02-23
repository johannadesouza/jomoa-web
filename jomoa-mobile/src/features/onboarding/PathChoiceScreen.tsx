import React from "react";
import { YStack, XStack, Text } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, Card } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
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
  const { data, updateData } = useOnboarding();

  const handleSelect = (path: OnboardingPath) => {
    updateData({ onboardingPath: path });
    if (path === "cycle_only") {
      updateData({ wantsCycleTracking: true });
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
          <AppText variant="h1">Vad vill du använda JOMOA till?</AppText>
          <AppText variant="body" muted>
            Välj vad som passar dig – du kan alltid lägga till mer senare
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
                        <Text fontSize={24}>{path.icon}</Text>
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
