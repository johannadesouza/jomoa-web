import React, { useEffect, useState } from "react";
import { Alert, Switch } from "react-native";
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
  type AppIconName,
  Divider,
} from "../../shared/ui";
import { CycleModeSettingsSection } from "./CycleModeSettingsSection";
import { PresentationSettingsSection } from "./PresentationSettingsSection";
import { useAuth } from "../../shared/context/AuthContext";
import { useTheme } from "../../shared/context/ThemeContext";
import { RootStackParamList } from "../../navigation/RootNavigator";
import {
  requestNotificationPermissions,
  scheduleDailyCheckin,
  cancelDailyCheckin,
  isDailyCheckinScheduled,
} from "../../lib/services/notificationService";
import { getItem, setItem, storageKeys } from "../../lib/store/storage";
import { useThemeColors } from "../../shared/theme/useThemeColors";
import { isDemoMode } from "../../lib/demo/demoMode";
import { useDemoPersona } from "../../shared/context/DemoPersonaContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsItem {
  iconName: AppIconName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, client, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const colors = useThemeColors();
  const demo = useDemoPersona();
  const showCycleInUI = client?.presentation_profile !== "male";
  const isCycleOnly = client?.onboarding_path === "cycle_only";

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getItem<boolean>(storageKeys.DAILY_CHECKIN_NOTIFICATIONS);
      const scheduled = await isDailyCheckinScheduled();
      if (!cancelled) {
        setNotificationsEnabled(stored ?? scheduled);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await setItem(storageKeys.DAILY_CHECKIN_NOTIFICATIONS, value);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyCheckin();
      } else {
        setNotificationsEnabled(false);
        await setItem(storageKeys.DAILY_CHECKIN_NOTIFICATIONS, false);
        Alert.alert(
          "Tillstånd krävs",
          "Aktivera notiser i enhetsinställningarna för att få daglig check-in-påminnelse."
        );
      }
    } else {
      await cancelDailyCheckin();
    }
  };

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

  const settingsItems: SettingsItem[] = [
    ...(isCycleOnly ? [{ iconName: "barbell-outline" as const, label: "Lägg till träning", subtitle: "Välj program när du känner dig redo", onPress: () => navigation.navigate("ProgramSelect") }] : []),
    { iconName: "person-outline", label: "Min profil", onPress: () => navigation.navigate("Profile") },
    { iconName: "barbell-outline", label: "Mina program", onPress: () => navigation.navigate("ProgramList") },
    ...(showCycleInUI ? [{ iconName: "moon-outline" as const, label: "Menscykel", onPress: () => navigation.navigate("Cycle") }] : []),
  ];

  const supportItems: SettingsItem[] = [
    { iconName: "help-circle-outline", label: "Hjälp & support", subtitle: "Kommer snart" },
    { iconName: "chatbubble-outline", label: "Feedback", subtitle: "Kommer snart" },
    { iconName: "document-text-outline", label: "Villkor", subtitle: "Kommer snart" },
  ];

  const devItems: SettingsItem[] = __DEV__
    ? [{ iconName: "bug-outline", label: "Scenario (dev)", subtitle: "Sätt idag, fas, readiness", onPress: () => navigation.navigate("Scenario") }]
    : [];

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
                  <AppIcon name="person-outline" size={28} />
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

        <Section title="Utseende">
          <Card>
            <Card.Content>
              <YStack gap="$3">
                <AppText variant="small" muted>
                  Välj mörkt eller ljust läge
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
                        <AppText
                          variant="body"
                          fontWeight="600"
                          color={theme === "dark" ? "#FFF" : "$color"}
                        >
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
                        <AppText
                          variant="body"
                          fontWeight="600"
                          color={theme === "light" ? "#FFF" : "$color"}
                        >
                          Ljust
                        </AppText>
                      </YStack>
                    </Card.Content>
                  </Card>
                </XStack>
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        <PresentationSettingsSection />

        {showCycleInUI && <CycleModeSettingsSection />}

        {isDemoMode() && demo.isReady && (
          <Section title="Demo">
            <Card>
              <Card.Content>
                <YStack gap="$3">
                  <AppText variant="small" muted>
                    Byt persona för att se hur appen anpassar innehåll och navigation.
                  </AppText>
                  <YStack gap="$2">
                    <AppButton
                      variant={demo.persona === "strength_3x" ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      onPress={() => demo.setPersona("strength_3x")}
                    >
                      Strength 3x/vecka
                    </AppButton>
                    <AppButton
                      variant={demo.persona === "cycle_only" ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      onPress={() => demo.setPersona("cycle_only")}
                    >
                      Cycle-only
                    </AppButton>
                    <AppButton
                      variant={demo.persona === "perimenopause" ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      onPress={() => demo.setPersona("perimenopause")}
                    >
                      Perimenopause
                    </AppButton>
                  </YStack>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        {devItems.length > 0 && (
          <Section title="Utvecklare">
            <Card>
              <Card.Content>
                <YStack gap="$1">
                  {devItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <XStack
                        paddingVertical="$3"
                        alignItems="center"
                        gap="$3"
                        pressStyle={item.onPress ? { opacity: 0.7 } : undefined}
                        onPress={item.onPress}
                      >
                        <AppIcon name={item.iconName} size={22} />
                        <YStack flex={1}>
                          <AppText variant="body">{item.label}</AppText>
                          {item.subtitle && (
                            <AppText variant="small" color="$colorSecondary">{item.subtitle}</AppText>
                          )}
                        </YStack>
                        {item.onPress ? <Text color="$textSecondary">→</Text> : null}
                      </XStack>
                      {index < devItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

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
                      pressStyle={item.onPress ? { opacity: 0.7 } : undefined}
                      onPress={item.onPress}
                    >
                      <AppIcon name={item.iconName} size={22} />
                      <YStack flex={1}>
                        <AppText variant="body">{item.label}</AppText>
                        {item.subtitle && (
                          <AppText variant="small" color="$colorSecondary">{item.subtitle}</AppText>
                        )}
                      </YStack>
                      {item.onPress ? <Text color="$textSecondary">→</Text> : null}
                    </XStack>
                    {index < settingsItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                <Divider />
                <XStack paddingVertical="$3" alignItems="center" gap="$3">
                  <AppIcon name="notifications-outline" size={22} />
                  <YStack flex={1}>
                    <AppText variant="body">Daglig check-in-påminnelse</AppText>
                    <AppText variant="small" color="$colorSecondary">
                      Påminnelse kl. 07:30 varje dag
                    </AppText>
                  </YStack>
                  <Switch
                    value={notificationsEnabled ?? false}
                    onValueChange={handleNotificationsToggle}
                    disabled={notificationsEnabled === null}
                    trackColor={{ false: colors.borderSoft, true: colors.accent }}
                    thumbColor="#FFF"
                  />
                </XStack>
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
                      pressStyle={item.onPress ? { opacity: 0.7 } : undefined}
                      onPress={item.onPress}
                    >
                      <AppIcon name={item.iconName} size={22} />
                      <YStack flex={1}>
                        <AppText variant="body">{item.label}</AppText>
                        {item.subtitle && (
                          <AppText variant="small" color="$colorSecondary">{item.subtitle}</AppText>
                        )}
                      </YStack>
                      {item.onPress ? <Text color="$textSecondary">→</Text> : null}
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
