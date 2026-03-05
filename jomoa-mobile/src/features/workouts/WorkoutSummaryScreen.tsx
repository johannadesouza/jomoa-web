import React from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  Screen,
  AppText,
  AppButton,
  Card,
  Section,
} from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutSummary">;

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const sessionName = route.params?.sessionName ?? "Pass";
  const totalSets = route.params?.totalSets ?? 0;
  const totalVolume = route.params?.totalVolume ?? 0;
  const adaptationApplied = route.params?.adaptationApplied ?? false;

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$6">
          <YStack gap="$2" alignItems="center" paddingTop="$8">
            <AppText variant="h1" center>
              Pass klart!
            </AppText>
            <AppText variant="body" muted center>
              {sessionName}
            </AppText>
            {adaptationApplied && (
              <AppText variant="caption" color="$accent" center marginTop="$1">
                Du tränade smart idag – anpassat för din kropp
              </AppText>
            )}
          </YStack>

          <Section title="Sammanfattning">
            <Card>
              <Card.Content>
                <YStack gap="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <AppText variant="body" muted>
                      Volym
                    </AppText>
                    <AppText variant="h3">
                      {totalVolume.toLocaleString("sv-SE")} kg
                    </AppText>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center">
                    <AppText variant="body" muted>
                      Antal set
                    </AppText>
                    <AppText variant="h3">{totalSets}</AppText>
                  </XStack>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        </YStack>

        <YStack paddingBottom="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            onPress={() =>
              navigation.navigate("Main", { screen: "HomeTab" })
            }
          >
            Tillbaka till hem
          </AppButton>
        </YStack>
      </YStack>
    </Screen>
  );
}
