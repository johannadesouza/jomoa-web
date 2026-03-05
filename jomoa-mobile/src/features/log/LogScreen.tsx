/**
 * Log – input only. Fyll i så får du insikter.
 * Tydlig skillnad mot Insikter (output/analys).
 */
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppIcon,
} from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { useAuth } from "../../shared/context/AuthContext";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SECONDARY_ACTIONS = [
  {
    iconName: "moon-outline" as const,
    label: "Period & symtom",
    desc: "Mensstart, kramper, energi",
    route: "Cycle" as const,
  },
] as const;

export function LogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const { readiness, refetch } = useReadiness(client?.id);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleSettings = () => navigation.navigate("Settings");

  return (
    <Screen padded>
      <TopBar
        title="Logga"
        subtitle="Fyll i för personliga insikter"
        rightIcons={["settings"]}
        onSettings={handleSettings}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$6" paddingTop="$4" paddingBottom="$8">
          <Section
            title="Hur mår du idag?"
            subtitle="Sömn, stress, energi – fyll i för dagens rekommendationer"
          >
            {readiness ? (
              <Card>
                <Card.Content>
                  <YStack alignItems="center" gap="$3" paddingVertical="$4">
                    <AppIcon name="checkmark-circle-outline" size={40} />
                    <AppText variant="body" center>
                      Du har loggat hur du mår idag
                    </AppText>
                    <AppText variant="small" muted center>
                      Bra! Se insikter under fliken Insikter
                    </AppText>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onPress={() => navigation.navigate("Readiness")}
                    >
                      Uppdatera
                    </AppButton>
                  </YStack>
                </Card.Content>
              </Card>
            ) : (
              <Card
                pressable
                onPress={() => navigation.navigate("Readiness")}
              >
                <Card.Content>
                  <YStack alignItems="center" gap="$4" paddingVertical="$4">
                    <AppIcon name="heart-outline" size={48} />
                    <YStack alignItems="center" gap="$1">
                      <AppText variant="h3">Hur mår du idag?</AppText>
                      <AppText variant="small" muted center>
                        Sömn, stress, energi, ömhet – få rekommendationer
                      </AppText>
                    </YStack>
                    <AppButton
                      variant="primary"
                      onPress={() => navigation.navigate("Readiness")}
                    >
                      Logga hur du mår
                    </AppButton>
                  </YStack>
                </Card.Content>
              </Card>
            )}
          </Section>

          <Section title="Mer att logga" subtitle="Cykel och symtom">
            <XStack flexWrap="wrap" gap="$3">
              {SECONDARY_ACTIONS.map((action) => (
                <Card
                  key={action.label}
                  flex={1}
                  minWidth="45%"
                  pressable
                  onPress={() => navigation.navigate(action.route)}
                >
                  <Card.Content>
                    <YStack alignItems="center" gap="$2" paddingVertical="$4">
                      <AppIcon name={action.iconName} size={32} />
                      <AppText variant="body" fontWeight="600">
                        {action.label}
                      </AppText>
                      <AppText variant="caption" muted center>
                        {action.desc}
                      </AppText>
                    </YStack>
                  </Card.Content>
                </Card>
              ))}
            </XStack>
          </Section>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
