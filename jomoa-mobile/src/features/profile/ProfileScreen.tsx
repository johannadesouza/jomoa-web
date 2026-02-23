/**
 * Profil – mål, före/efter, peppande ord
 */
import React from "react";
import { ScrollView } from "react-native";
import { YStack, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppIcon,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { GoalsSection } from "../insights/GoalsSection";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PEPPANDE = [
  "Varje steg räknas.",
  "Du gör det du kan, med det du har.",
  "Små förändringar skapar stora resultat.",
  "Din kropp är stark – ge den tid.",
];

function getPeppandeOrd(): string {
  const day = new Date().getDate();
  return PEPPANDE[day % PEPPANDE.length];
}

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, client } = useAuth();

  return (
    <Screen padded>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$6" paddingTop="$4" paddingBottom="$8">
          <Section title="Min resa" subtitle={user?.user_metadata?.full_name || user?.email || "Din resa"}>
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$4" paddingVertical="$4">
                  <YStack
                    width={80}
                    height={80}
                    borderRadius="$full"
                    backgroundColor="$surface3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AppIcon name="person-outline" size={40} />
                  </YStack>
                  <YStack alignItems="center" gap="$1">
                    <AppText variant="h3">{user?.user_metadata?.full_name || "Användare"}</AppText>
                    <AppText variant="small" muted>{user?.email}</AppText>
                  </YStack>
                  <Card
                    padding="$4"
                    backgroundColor="$surface3"
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="$borderSoft"
                  >
                    <AppText variant="body" textAlign="center" fontStyle="italic" color="$accent">
                      {getPeppandeOrd()}
                    </AppText>
                  </Card>
                </YStack>
              </Card.Content>
            </Card>
          </Section>

          <Section title="Före & efter" subtitle="Din utveckling över tid">
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$4" paddingVertical="$6">
                  <XStack gap="$4" alignItems="center" justifyContent="center">
                    <YStack
                      width={120}
                      height={140}
                      borderRadius="$3"
                      backgroundColor="$surface3"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={1}
                      borderColor="$borderSoft"
                    >
                      <AppIcon name="image-outline" size={40} />
                      <AppText variant="caption" muted marginTop="$2">Start</AppText>
                    </YStack>
                    <AppText variant="h2" color="$accent">→</AppText>
                    <YStack
                      width={120}
                      height={140}
                      borderRadius="$3"
                      backgroundColor="$surface3"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={1}
                      borderColor="$borderSoft"
                    >
                      <AppIcon name="image-outline" size={40} />
                      <AppText variant="caption" muted marginTop="$2">Nu</AppText>
                    </YStack>
                  </XStack>
                  <AppText variant="small" muted center>
                    Lägg till bilder för att följa din utveckling – kommer snart
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>

          <GoalsSection clientId={client?.id} />
        </YStack>
      </ScrollView>
    </Screen>
  );
}
