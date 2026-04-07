import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert } from "react-native";

import { Screen, AppText, AppButton } from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { OnboardingStepDots } from "./OnboardingStepDots";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycleContext } from "../../shared/context/CycleContext";
import { updateClient } from "../../lib/repos/userRepo/clients";
import { savePeriodStart } from "../../lib/services/cycleService";
import { updateCycleMode } from "../../lib/services/cycleEngineService";
import { createGoal } from "../../lib/services/goalsService";
import { getPrimaryGoalLabel, getTrainingDaysLabel } from "../../lib/utils/profileLabels";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Complete">;

export function CompleteScreen({ navigation }: Props) {
  const { data } = useOnboarding();
  const { client, refreshClient } = useAuth();
  const { refetch: refetchCycle } = useCycleContext();
  const copy = useAppCopy("sv", data.presentationProfile);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!client?.id) {
      Alert.alert("Fel", "Kunde inte hitta din profil");
      return;
    }

    setIsLoading(true);

    try {
      const clientUpdate: Record<string, unknown> = {
        onboarding_stage: "completed",
        presentation_profile: data.presentationProfile ?? "female",
        presentation_theme: data.presentationTheme ?? "neutral",
        onboarding_path: data.onboardingPath ?? "both",
      };

      if (data.onboardingPath !== "cycle_only") {
        clientUpdate.primary_goal = data.primaryGoal;
        clientUpdate.training_frequency = data.trainingFrequency;
        clientUpdate.training_days = data.trainingDays;
      }

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

      const { error } = await updateClient(client.id, clientUpdate);

      if (error) throw error;

      if (data.wantsCycleTracking === false) {
        await updateCycleMode(client.id, "missing_period");
        await refetchCycle();
      }

      if (data.lastPeriodStart) {
        await savePeriodStart(client.id, data.lastPeriodStart);
        await refetchCycle();
      }

      if (data.onboardingPath !== "cycle_only" && data.primaryGoal) {
        await createGoal(client.id, "fitness", getPrimaryGoalLabel(data.primaryGoal), null);
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

  const goalLabel = getPrimaryGoalLabel(data.primaryGoal);
  const daysLabel = getTrainingDaysLabel(data.trainingDays);

  return (
    <Screen padded>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$8" paddingTop="$4">
          <YStack gap="$2" alignItems="center">
            <Text fontSize={64}>🎉</Text>
            <AppText variant="h1" center>
              {getAppCopy(copy, "complete_title", "Allt klart!")}
            </AppText>
            <AppText variant="body" muted center>
              {getAppCopy(copy, "complete_subtitle", "Här är en sammanfattning av dina val")}
            </AppText>
          </YStack>

          <YStack gap="$4" backgroundColor="$backgroundStrong" padding="$4" borderRadius="$4">
            {data.onboardingPath !== "cycle_only" && (
              <>
                <YStack gap="$2">
                  <AppText variant="small" muted>
                    Ditt mål
                  </AppText>
                  <AppText variant="h3">{goalLabel}</AppText>
                </YStack>

                <YStack gap="$2">
                  <AppText variant="small" muted>
                    Träningsfrekvens
                  </AppText>
                  <AppText variant="h3">
                    {data.trainingFrequency} dagar/vecka
                  </AppText>
                </YStack>

                {data.trainingDays?.length ? (
                  <YStack gap="$2">
                    <AppText variant="small" muted>
                      Träningsdagar
                    </AppText>
                    <AppText variant="h3">{daysLabel}</AppText>
                  </YStack>
                ) : null}
              </>
            )}

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

          <AppText variant="small" muted center paddingHorizontal="$4">
            {getAppCopy(copy, "complete_checkin_copy", "Varje dag kan du logga sömn, energi och stress – då får du tydliga beslut: Öka, Behåll eller Justera.")}
          </AppText>

          <YStack gap="$3" paddingHorizontal="$2">
            <AppText variant="h3">Nästa steg</AppText>
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <AppText variant="body" fontWeight="600" minWidth={24}>1.</AppText>
                <AppText variant="body">{getAppCopy(copy, "complete_next_step_1", "Gå till Hem")}</AppText>
              </XStack>
              <XStack gap="$2" alignItems="center">
                <AppText variant="body" fontWeight="600" minWidth={24}>2.</AppText>
                <AppText variant="body">{getAppCopy(copy, "complete_next_step_2", "Välj program om du inte har ett")}</AppText>
              </XStack>
              <XStack gap="$2" alignItems="center">
                <AppText variant="body" fontWeight="600" minWidth={24}>3.</AppText>
                <AppText variant="body">{getAppCopy(copy, "complete_next_step_3", "Logga check-in imorgon")}</AppText>
              </XStack>
              {data.wantsCycleTracking === true && (
                <XStack gap="$2" alignItems="center">
                  <AppText variant="body" fontWeight="600" minWidth={24}>4.</AppText>
                  <AppText variant="body">
                    {data.lastPeriodStart
                      ? getAppCopy(copy, "complete_next_step_cycle", "Logga periodstart under Cykel (eller Inställningar → Menscykel) när nästa period börjar")
                      : getAppCopy(copy, "complete_next_step_cycle_no_date", "Du kan logga din senaste period under Cykel när du vill")}
                  </AppText>
                </XStack>
              )}
            </YStack>
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
            Kom igång
          </AppButton>
          <AppText variant="small" muted center>
            Du kommer till Hem
          </AppText>
          <AppButton
            variant="ghost"
            size="md"
            fullWidth
            onPress={handleBack}
          >
            Tillbaka
          </AppButton>
          <OnboardingStepDots path={data.onboardingPath} screen="Complete" />
        </YStack>
      </YStack>
    </Screen>
  );
}
