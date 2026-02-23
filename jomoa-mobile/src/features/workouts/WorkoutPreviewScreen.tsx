import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  LoadingScreen,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useFavorites } from "../../lib/hooks/useFavorites";
import { useTrainingAdaptation } from "../../lib/hooks/useTrainingAdaptation";
import { useCycle } from "../../lib/hooks/useCycle";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { getAdjustmentRecommendation } from "../../lib/services/adjustmentService";
import { saveStrategyDecision } from "../../lib/services/strategyDecisionService";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { fetchSessionById } from "../../lib/services/workoutService";
import { fetchSessionTemplateById } from "../../lib/services/sessionTemplateService";
import type { ProgramSessionData } from "../../lib/services/workoutService";
import type { SessionTemplateData } from "../../lib/services/sessionTemplateService";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutPreview">;

export function WorkoutPreviewScreen({ navigation, route }: Props) {
  const { client } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { isFavorite, toggle } = useFavorites(client?.id);
  const { phase } = useCycle(client?.id);
  const { readiness } = useReadiness(client?.id);
  const adaptation = useTrainingAdaptation(client?.id);
  const recommendation = getAdjustmentRecommendation(phase ?? null, readiness);
  const { sessionId, isStandalone } = route.params;
  const [session, setSession] = useState<(ProgramSessionData | SessionTemplateData) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyAdjustment, setApplyAdjustment] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const hasSuggestion =
    !!recommendation || (adaptation.volumeModifier !== 1 && !adaptation.appliedRules.includes("weekly_progression"));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = isStandalone
        ? await fetchSessionTemplateById(sessionId)
        : await fetchSessionById(sessionId);
      if (!cancelled) setSession(data);
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, isStandalone]);

  if (isLoading) return <LoadingScreen message="Laddar pass..." />;

  if (!session) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Kunde inte hitta passet
        </AppText>
        <AppButton variant="secondary" onPress={() => navigation.goBack()}>
          Tillbaka
        </AppButton>
      </Screen>
    );
  }

  const exercises = [...(session.session_exercises ?? [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  const totalSets = exercises.reduce(
    (sum, e) => sum + (e.sets_planned ?? 0),
    0
  );

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <AppText variant="h1" flex={1}>{session.name}</AppText>
            {!isStandalone && (
              <Pressable
                onPress={() => toggle(session.id)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 8 })}
              >
                <Ionicons
                  name={isFavorite(session.id) ? "heart" : "heart-outline"}
                  size={28}
                  color={isFavorite(session.id) ? colors.accent : colors.textSecondary}
                />
              </Pressable>
            )}
          </XStack>
          {session.focus && (
            <AppText variant="small" muted>
              Fokus: {session.focus}
            </AppText>
          )}
          <XStack gap="$4">
            <AppText variant="caption" muted>
              {exercises.length} övningar · {totalSets} set
            </AppText>
          </XStack>
        </YStack>

        {(recommendation || (adaptation.volumeModifier !== 1 && !adaptation.appliedRules.includes("weekly_progression"))) && (
          <Card backgroundColor="$surface3">
            <Card.Content>
              <YStack gap="$2">
                <AppText variant="h3">Dagens strategi</AppText>
                <AppText variant="small" color="$accent" fontWeight="600">
                  {recommendation?.reason ??
                    (adaptation.volumeModifier < 1
                      ? `−${Math.round((1 - adaptation.volumeModifier) * 100)}% volym`
                      : `+${Math.round((adaptation.volumeModifier - 1) * 100)}% volym`)}
                </AppText>
                {!recommendation && adaptation.topDrivers.length > 0 && (
                  <AppText variant="caption" muted>
                    Varför: {adaptation.topDrivers.join(" ")}
                  </AppText>
                )}
                <XStack gap="$3" marginTop="$2">
                  <Pressable
                    onPress={() => setApplyAdjustment(true)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      flex: 1,
                    })}
                  >
                    <Card
                      backgroundColor={applyAdjustment === true ? "$accent" : "$surface3"}
                      padding="$3"
                      borderWidth={applyAdjustment === true ? 2 : 0}
                      borderColor="$accent"
                    >
                      <Card.Content padding="$0">
                        <AppText
                          variant="small"
                          fontWeight="600"
                          color={applyAdjustment === true ? "$softLight" : "$color"}
                          textAlign="center"
                        >
                          Tillämpa justering
                        </AppText>
                      </Card.Content>
                    </Card>
                  </Pressable>
                  <Pressable
                    onPress={() => setApplyAdjustment(false)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      flex: 1,
                    })}
                  >
                    <Card
                      backgroundColor={applyAdjustment === false ? "$surface3" : "$card"}
                      padding="$3"
                      borderWidth={applyAdjustment === false ? 2 : 0}
                      borderColor="$borderSoft"
                    >
                      <Card.Content padding="$0">
                        <AppText
                          variant="small"
                          fontWeight="600"
                          color="$color"
                          textAlign="center"
                        >
                          Behåll plan
                        </AppText>
                      </Card.Content>
                    </Card>
                  </Pressable>
                </XStack>
              </YStack>
            </Card.Content>
          </Card>
        )}

        <Section title="Övningar">
          <YStack gap="$3">
            {exercises.map((se, index) => (
              <Card key={se.id}>
                <Card.Content>
                  <YStack gap="$2">
                    <AppText variant="h3">
                      {index + 1}. {se.exercise?.name ?? "Övning"}
                    </AppText>
                    <XStack gap="$2" alignItems="center">
                      <AppText variant="small" muted>
                        {se.sets_planned ?? 0} × {String(se.reps_planned ?? "-")}
                      </AppText>
                      {se.rest_seconds != null && se.rest_seconds > 0 && (
                        <AppText variant="caption" muted>
                          · {se.rest_seconds}s vila
                        </AppText>
                      )}
                    </XStack>
                  </YStack>
                </Card.Content>
              </Card>
            ))}
          </YStack>
        </Section>

        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={isStarting}
          onPress={async () => {
            const accepted = hasSuggestion ? (applyAdjustment ?? false) : undefined;
            if (client?.id && hasSuggestion) {
              setIsStarting(true);
              await saveStrategyDecision({
                clientId: client.id,
                sessionId: session.id,
                isStandalone: isStandalone ?? false,
                suggestedVolumeModifier: adaptation.volumeModifier,
                accepted: accepted ?? false,
              });
              setIsStarting(false);
            }
            navigation.replace("WorkoutSession", {
              sessionId: session.id,
              isStandalone,
              applyAdjustment: accepted,
            });
          }}
        >
          {isStarting ? "Sparar..." : "Starta pass"}
        </AppButton>
      </YStack>
    </Screen>
  );
}
