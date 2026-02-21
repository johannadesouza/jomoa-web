import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert } from "react-native";

import { Screen, AppText, AppButton } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { useAuth } from "../../shared/context/AuthContext";
import { supabase } from "../../config/supabase";
import { savePeriodStart } from "../../lib/services/cycleService";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Complete">;

export function CompleteScreen({ navigation }: Props) {
  const { data } = useOnboarding();
  const { client, refreshClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!client?.id) {
      Alert.alert("Fel", "Kunde inte hitta din profil");
      return;
    }

    setIsLoading(true);

    try {
      const clientUpdate: Record<string, unknown> = {
        primary_goal: data.primaryGoal,
        training_frequency: data.trainingFrequency,
        training_days: data.trainingDays,
        onboarding_stage: "completed",
      };

      if (data.wantsCycleTracking === true) {
        clientUpdate.cycle_length = data.cycleLength ?? 28;
        clientUpdate.irregular_cycle = data.irregularCycle ?? null;
        clientUpdate.no_period = data.noPeriod ?? null;
        clientUpdate.peri_menopause = data.periMenopause ?? null;
      } else if (data.wantsCycleTracking === false) {
        clientUpdate.cycle_length = null;
        clientUpdate.irregular_cycle = null;
        clientUpdate.no_period = null;
        clientUpdate.peri_menopause = null;
      }

      const { error } = await supabase
        .from("clients")
        .update(clientUpdate)
        .eq("id", client.id);

      if (error) throw error;

      if (data.lastPeriodStart) {
        await savePeriodStart(client.id, data.lastPeriodStart);
      }

      await refreshClient();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert("Fel", "Kunde inte spara dina inställningar. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getGoalLabel = () => {
    const goals: Record<string, string> = {
      muscle_growth: "Bygga muskler",
      strength: "Bli starkare",
      fat_loss: "Gå ner i vikt",
      performance: "Bättre prestation",
      maintenance: "Hålla formen",
    };
    return data.primaryGoal ? goals[data.primaryGoal] : "Inte valt";
  };

  const getDaysLabel = () => {
    const dayNames: Record<number, string> = {
      1: "Mån",
      2: "Tis",
      3: "Ons",
      4: "Tor",
      5: "Fre",
      6: "Lör",
      7: "Sön",
    };
    return data.trainingDays?.map((d) => dayNames[d]).join(", ") || "Inte valt";
  };

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$8" paddingTop="$4">
          <YStack gap="$2" alignItems="center">
            <Text fontSize={64}>🎉</Text>
            <AppText variant="h1" center>
              Allt klart!
            </AppText>
            <AppText variant="body" muted center>
              Här är en sammanfattning av dina val
            </AppText>
          </YStack>

          <YStack gap="$4" backgroundColor="$backgroundStrong" padding="$4" borderRadius="$4">
            <YStack gap="$2">
              <AppText variant="small" muted>
                Ditt mål
              </AppText>
              <AppText variant="h3">{getGoalLabel()}</AppText>
            </YStack>

            <YStack gap="$2">
              <AppText variant="small" muted>
                Träningsfrekvens
              </AppText>
              <AppText variant="h3">{data.trainingFrequency} dagar/vecka</AppText>
            </YStack>

            <YStack gap="$2">
              <AppText variant="small" muted>
                Träningsdagar
              </AppText>
              <AppText variant="h3">{getDaysLabel()}</AppText>
            </YStack>

            {data.wantsCycleTracking && (
              <YStack gap="$2">
                <AppText variant="small" muted>
                  Menscykel
                </AppText>
                <AppText variant="h3">
                  {data.lastPeriodStart
                    ? `Senast: ${data.lastPeriodStart}`
                    : "Spårning aktiverad – logga period senare"}
                </AppText>
              </YStack>
            )}
          </YStack>
        </YStack>

        <YStack gap="$4" paddingBottom="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleComplete}
          >
            Starta min resa
          </AppButton>
          <AppButton
            variant="ghost"
            size="md"
            fullWidth
            onPress={handleBack}
          >
            Tillbaka
          </AppButton>
          <XStack justifyContent="center" gap="$2">
            {[1, 2, 3, 4, 5].map((step) => (
              <XStack
                key={step}
                width={8}
                height={8}
                borderRadius="$full"
                backgroundColor={step === 5 ? "$accent" : "$borderColor"}
              />
            ))}
          </XStack>
        </YStack>
      </YStack>
    </Screen>
  );
}
