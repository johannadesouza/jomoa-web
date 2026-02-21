import React from "react";
import { Alert } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  Divider,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsItem {
  icon: string;
  label: string;
  onPress: () => void;
}

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Logga ut",
      "Är du säker på att du vill logga ut?",
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Logga ut", style: "destructive", onPress: signOut },
      ]
    );
  };

  const showComingSoon = (label: string) => () => {
    Alert.alert("Kommer snart", `${label} kommer snart.`);
  };

  const settingsItems: SettingsItem[] = [
    { icon: "👤", label: "Profil", onPress: showComingSoon("Profil") },
    { icon: "💪", label: "Mina program", onPress: () => navigation.navigate("ProgramList") },
    { icon: "🎯", label: "Mål", onPress: () => navigation.navigate("ProgramSelect") },
    { icon: "💚", label: "Hur mår du idag?", onPress: () => navigation.navigate("Readiness") },
    { icon: "🔔", label: "Notifikationer", onPress: showComingSoon("Notifikationer") },
    { icon: "🌙", label: "Menscykel", onPress: () => navigation.navigate("Cycle") },
  ];

  const supportItems: SettingsItem[] = [
    { icon: "❓", label: "Hjälp & support", onPress: showComingSoon("Hjälp") },
    { icon: "📝", label: "Feedback", onPress: showComingSoon("Feedback") },
    { icon: "📜", label: "Villkor", onPress: showComingSoon("Villkor") },
  ];

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Inställningar">
          <Card>
            <Card.Content>
              <XStack alignItems="center" gap="$4">
                <YStack
                  width={56}
                  height={56}
                  borderRadius="$full"
                  backgroundColor="$surface3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$xl">👤</Text>
                </YStack>
                <YStack flex={1} gap="$1">
                  <AppText variant="h3">
                    {user?.user_metadata?.full_name || "Användare"}
                  </AppText>
                  <AppText variant="small">
                    {user?.email}
                  </AppText>
                </YStack>
              </XStack>
            </Card.Content>
          </Card>
        </Section>

        <Section title="Konto">
          <Card>
            <Card.Content>
              <YStack gap="$1">
                {settingsItems.map((item, index) => (
                  <React.Fragment key={item.label}>
                    <XStack
                      paddingVertical="$3"
                      alignItems="center"
                      gap="$3"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={item.onPress}
                    >
                      <Text fontSize="$lg">{item.icon}</Text>
                      <AppText variant="body" flex={1}>
                        {item.label}
                      </AppText>
                      <Text color="$textSecondary">→</Text>
                    </XStack>
                    {index < settingsItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        <Section title="Support">
          <Card>
            <Card.Content>
              <YStack gap="$1">
                {supportItems.map((item, index) => (
                  <React.Fragment key={item.label}>
                    <XStack
                      paddingVertical="$3"
                      alignItems="center"
                      gap="$3"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={item.onPress}
                    >
                      <Text fontSize="$lg">{item.icon}</Text>
                      <AppText variant="body" flex={1}>
                        {item.label}
                      </AppText>
                      <Text color="$textSecondary">→</Text>
                    </XStack>
                    {index < supportItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        <YStack paddingVertical="$4">
          <AppButton
            variant="destructive"
            fullWidth
            onPress={handleSignOut}
          >
            Logga ut
          </AppButton>
        </YStack>

        <YStack alignItems="center" paddingBottom="$8">
          <AppText variant="caption">
            JOMOA v1.0.0
          </AppText>
        </YStack>
      </YStack>
    </Screen>
  );
}
