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
import { getPrimaryGoalLabel, getTrainingDaysLabel } from "../../lib/utils/profileLabels";
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

          {client?.onboarding_stage === "completed" && (
            <Section title="Min träningsprofil" subtitle="Så har du satt upp din träning">
              <Card>
                <Card.Content>
                  <YStack gap="$4" paddingVertical="$2">
                    {client.primary_goal != null && (
                      <YStack gap="$1">
                        <AppText variant="small" muted>Mål</AppText>
                        <AppText variant="body">{getPrimaryGoalLabel(client.primary_goal)}</AppText>
                      </YStack>
                    )}
                    {client.training_frequency != null && client.training_frequency > 0 && (
                      <YStack gap="$1">
                        <AppText variant="small" muted>Träningsfrekvens</AppText>
                        <AppText variant="body">{client.training_frequency} dagar/vecka</AppText>
                      </YStack>
                    )}
                    {client.training_days != null && client.training_days.length > 0 && (
                      <YStack gap="$1">
                        <AppText variant="small" muted>Träningsdagar</AppText>
                        <AppText variant="body">{getTrainingDaysLabel(client.training_days)}</AppText>
                      </YStack>
                    )}
                    {client.cycle_length != null && client.cycle_length > 0 && (
                      <YStack gap="$1">
                        <AppText variant="small" muted>Cykel</AppText>
                        <AppText variant="body">Cykelspårning aktiverad</AppText>
                      </YStack>
                    )}
                    {!client.primary_goal && !client.training_frequency && (!client.training_days || client.training_days.length === 0) && !client.cycle_length && (
                      <AppText variant="small" muted>Inga träningsinställningar sparade</AppText>
                    )}
                  </YStack>
                </Card.Content>
              </Card>
            </Section>
          )}

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
