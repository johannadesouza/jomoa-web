import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, Card, AppButton, AppIcon } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import { useTheme } from "../../shared/context/ThemeContext";
import type { PresentationTheme } from "../../shared/types/onboarding";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Theme">;

const OPTIONS: { id: PresentationTheme; label: string; description: string; icon: string }[] = [
  {
    id: "bold",
    label: "Kraftfull & tydlig",
    description: "Rak på sak, tydliga mål och stark ton",
    icon: "◆",
  },
  {
    id: "soft",
    label: "Ljusare & mjukare",
    description: "Lugnare ton, fokus på välmående och flow",
    icon: "○",
  },
  {
    id: "neutral",
    label: "Neutral",
    description: "Balanserad och professionell stil",
    icon: "◇",
  },
];

export function ThemeScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const { theme, setTheme } = useTheme();
  const copy = useAppCopy("sv", data.presentationProfile);

  const handleSelectStyle = (presentationTheme: PresentationTheme) => {
    updateData({ presentationTheme });
  };

  const handleContinue = () => {
    if (data.presentationProfile === "male") {
      updateData({ wantsCycleTracking: false, onboardingPath: "training_only" });
      setCurrentStep(1);
      navigation.navigate("Goals");
    } else {
      navigation.navigate("CycleQuestion");
    }
  };

  return (
    <Screen padded>
      <YStack flex={1} gap="$6" paddingTop="$4">
        <YStack gap="$2">
          <AppText variant="h1">{getAppCopy(copy, "theme_title", "Vilken stil passar dig bäst?")}</AppText>
          <AppText variant="body" muted>
            {getAppCopy(copy, "theme_subtitle", "Prova och se – tonen i appen anpassas.")}
          </AppText>
        </YStack>

        <YStack gap="$2">
          <AppText variant="small" muted>
            Ljust eller mörkt läge
          </AppText>
          <XStack gap="$3">
            <Card
              pressable
              flex={1}
              backgroundColor={theme === "dark" ? "$accent" : "$card"}
              borderColor={theme === "dark" ? "$accent" : "$borderColor"}
              onPress={() => setTheme("dark")}
            >
              <Card.Content>
                <YStack alignItems="center" gap="$1">
                  <AppIcon name="moon-outline" size={24} color={theme === "dark" ? "#FFF" : undefined} />
                  <AppText variant="body" fontWeight="600" color={theme === "dark" ? "#FFF" : "$color"}>
                    Mörkt
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
            <Card
              pressable
              flex={1}
              backgroundColor={theme === "light" ? "$accent" : "$card"}
              borderColor={theme === "light" ? "$accent" : "$borderColor"}
              onPress={() => setTheme("light")}
            >
              <Card.Content>
                <YStack alignItems="center" gap="$1">
                  <AppIcon name="sunny-outline" size={24} color={theme === "light" ? "#FFF" : undefined} />
                  <AppText variant="body" fontWeight="600" color={theme === "light" ? "#FFF" : "$color"}>
                    Ljust
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </XStack>
        </YStack>

        <YStack gap="$2">
          <AppText variant="small" muted>
            Stil (ton och färger)
          </AppText>
          <YStack gap="$3">
            {OPTIONS.map((opt) => {
              const isSelected = data.presentationTheme === opt.id;
              return (
                <Pressable key={opt.id} onPress={() => handleSelectStyle(opt.id)}>
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
                        <YStack flex={1}>
                          <AppText variant="h3" color={isSelected ? "$background" : "$color"}>
                            {opt.label}
                          </AppText>
                          <AppText variant="small" color={isSelected ? "$background" : "$colorSecondary"}>
                            {opt.description}
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

        <YStack flex={1} justifyContent="flex-end" gap="$3" paddingBottom="$4">
          <AppButton variant="primary" size="lg" fullWidth onPress={handleContinue}>
            Fortsätt
          </AppButton>
        </YStack>
      </YStack>
    </Screen>
  );
}
