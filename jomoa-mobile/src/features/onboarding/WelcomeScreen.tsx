import React from "react";
import { YStack, XStack, Text } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen, AppText, AppButton } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$8">
          <YStack alignItems="center" gap="$4">
            <Text fontSize={64}>💪</Text>
            <AppText variant="h1" center>
              Välkommen till JOMOA
            </AppText>
            <AppText variant="body" muted center>
              Din personliga träningscoach som anpassar sig efter dig
            </AppText>
          </YStack>

          <YStack gap="$4" width="100%">
            <XStack gap="$3" alignItems="center">
              <XStack
                width={48}
                height={48}
                borderRadius="$full"
                backgroundColor="$accent"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={24}>🎯</Text>
              </XStack>
              <YStack flex={1}>
                <AppText variant="h3">Anpassade program</AppText>
                <AppText variant="small" muted>
                  Baserat på dina mål och livsstil
                </AppText>
              </YStack>
            </XStack>

            <XStack gap="$3" alignItems="center">
              <XStack
                width={48}
                height={48}
                borderRadius="$full"
                backgroundColor="$accent"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={24}>📊</Text>
              </XStack>
              <YStack flex={1}>
                <AppText variant="h3">Smart spårning</AppText>
                <AppText variant="small" muted>
                  Följ din progress och se resultat
                </AppText>
              </YStack>
            </XStack>

            <XStack gap="$3" alignItems="center">
              <XStack
                width={48}
                height={48}
                borderRadius="$full"
                backgroundColor="$accent"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={24}>🔄</Text>
              </XStack>
              <YStack flex={1}>
                <AppText variant="h3">Flexibel planering</AppText>
                <AppText variant="small" muted>
                  Anpassar sig efter din vardag
                </AppText>
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        <YStack gap="$4" paddingBottom="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate("Goals")}
          >
            Kom igång
          </AppButton>
          <AppText variant="caption" center muted>
            Det tar bara 2 minuter
          </AppText>
        </YStack>
      </YStack>
    </Screen>
  );
}
