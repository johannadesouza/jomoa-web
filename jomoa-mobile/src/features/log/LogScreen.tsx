/**
 * Log – input only. "Hur mår du idag?" + quick actions.
 * Tydlig skillnad mot Insikter (output/analys).
 */
import React from "react";
import { ScrollView } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
} from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { QuickLogStrip } from "../../components/log/QuickLogStrip";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS = [
  {
    icon: "🌙",
    label: "Period",
    desc: "Logga mensstart",
    route: "Cycle" as const,
  },
  {
    icon: "📋",
    label: "Symtom",
    desc: "Kramper, energi",
    route: "Cycle" as const,
  },
  {
    icon: "📏",
    label: "Mätningar",
    desc: "Vikt, mått",
    route: "Measurements" as const,
  },
];

export function LogScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleSettings = () => navigation.navigate("Settings");

  return (
    <Screen padded>
      <TopBar
        title="Logga"
        subtitle="Fyll i – insikter visas under Insikter"
        rightIcons={["settings"]}
        onSettings={handleSettings}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$6" paddingTop="$4" paddingBottom="$8">
          <Section
            title="Hur mår du idag?"
            subtitle="Logga här – dina insikter visas under Insikter"
          >
            <QuickLogStrip />
            <Card
              pressable
              marginTop="$4"
              onPress={() => navigation.navigate("Readiness")}
            >
              <Card.Content>
                <YStack alignItems="center" gap="$4" paddingVertical="$4">
                  <Text fontSize="$xxxl">💚</Text>
                  <YStack alignItems="center" gap="$1">
                    <AppText variant="h3">Logga energi & readiness</AppText>
                    <AppText variant="small" muted center>
                      Sömn, stress, energi, smärta
                    </AppText>
                  </YStack>
                  <AppText variant="caption" color="$accent" fontWeight="600">
                    Tryck för att logga →
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>

          <Section title="Mer att logga" subtitle="Cykel, symtom och mätningar">
            <XStack flexWrap="wrap" gap="$3">
              {QUICK_ACTIONS.map((action) => (
                <Card
                  key={action.label}
                  flex={1}
                  minWidth="45%"
                  pressable
                  onPress={() => navigation.navigate(action.route)}
                >
                  <Card.Content>
                    <YStack alignItems="center" gap="$2" paddingVertical="$3">
                      <Text fontSize="$xl">{action.icon}</Text>
                      <AppText variant="body" fontWeight="600">
                        {action.label}
                      </AppText>
                      <AppText variant="caption" muted>
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
