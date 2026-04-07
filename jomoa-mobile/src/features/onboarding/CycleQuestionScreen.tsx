import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";

import { Screen, AppText, Card, AppIcon } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";

type Props = NativeStackScreenProps<OnboardingStackParamList, "CycleQuestion">;

export function CycleQuestionScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleYes = () => {
    updateData({ wantsCycleTracking: true });
    setCurrentStep(1);
    navigation.navigate("PathChoice");
  };

  const handleNo = () => {
    updateData({ wantsCycleTracking: false, onboardingPath: "training_only" });
    setCurrentStep(1);
    navigation.navigate("Goals");
  };

  return (
    <Screen padded>
      <YStack flex={1} gap="$6" paddingTop="$4">
        <YStack gap="$2">
          <AppText variant="h1">Har du menscykel?</AppText>
          <AppText variant="body" muted>
            Vi frågar alla – oavsett kön – så att vi kan ge rätt rekommendationer. Om du har en cykel kan vi anpassa träning och återhämtning utifrån den. På nästa steg kan du välja endast cykel, endast träning eller båda. Om inte fokuserar vi på mål och readiness.
          </AppText>
        </YStack>

        <YStack gap="$3">
          <Pressable onPress={handleYes}>
            <Card
              backgroundColor={data.wantsCycleTracking === true ? "$accent" : "$backgroundStrong"}
              borderColor={data.wantsCycleTracking === true ? "$accent" : "$borderColor"}
              borderWidth={1}
            >
              <Card.Content>
                <XStack gap="$3" alignItems="center">
                  <XStack
                    width={48}
                    height={48}
                    borderRadius="$full"
                    backgroundColor={data.wantsCycleTracking === true ? "$background" : "$surface3"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AppText variant="h2">🌙</AppText>
                  </XStack>
                  <YStack flex={1}>
                    <AppText
                      variant="h3"
                      color={data.wantsCycleTracking === true ? "$background" : "$color"}
                    >
                      Ja
                    </AppText>
                    <AppText
                      variant="small"
                      color={data.wantsCycleTracking === true ? "$background" : "$colorSecondary"}
                    >
                      Jag vill spåra cykeln och få anpassade rekommendationer
                    </AppText>
                  </YStack>
                  {data.wantsCycleTracking === true && (
                    <AppIcon name="checkmark-circle" size={24} color="$background" />
                  )}
                </XStack>
              </Card.Content>
            </Card>
          </Pressable>

          <Pressable onPress={handleNo}>
            <Card
              backgroundColor={data.wantsCycleTracking === false ? "$accent" : "$backgroundStrong"}
              borderColor={data.wantsCycleTracking === false ? "$accent" : "$borderColor"}
              borderWidth={1}
            >
              <Card.Content>
                <XStack gap="$3" alignItems="center">
                  <XStack
                    width={48}
                    height={48}
                    borderRadius="$full"
                    backgroundColor={data.wantsCycleTracking === false ? "$background" : "$surface3"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AppText variant="h2">💪</AppText>
                  </XStack>
                  <YStack flex={1}>
                    <AppText
                      variant="h3"
                      color={data.wantsCycleTracking === false ? "$background" : "$color"}
                    >
                      Nej
                    </AppText>
                    <AppText
                      variant="small"
                      color={data.wantsCycleTracking === false ? "$background" : "$colorSecondary"}
                    >
                      Jag vill fokusera på träning och mål utan cykelspårning
                    </AppText>
                  </YStack>
                  {data.wantsCycleTracking === false && (
                    <AppIcon name="checkmark-circle" size={24} color="$background" />
                  )}
                </XStack>
              </Card.Content>
            </Card>
          </Pressable>
        </YStack>
      </YStack>
    </Screen>
  );
}
