import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  Badge,
  Divider,
  LoadingScreen,
  ErrorState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useDashboard } from "../../lib/hooks/useDashboard";
import { useCycle } from "../../lib/hooks/useCycle";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { useReadinessHistory } from "../../lib/hooks/useReadinessHistory";
import { useDailyInsight } from "../../lib/hooks/useDailyInsight";
import { useTrainingAdaptation } from "../../lib/hooks/useTrainingAdaptation";
import { getAdjustmentRecommendation } from "../../lib/services/adjustmentService";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { CycleGraphSection } from "../cycle/CycleGraphSection";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SessionIndicator({ hasSession }: { hasSession: boolean }) {
  if (!hasSession) return null;
  return (
    <YStack
      width={6}
      height={6}
      borderRadius="$full"
      backgroundColor="$accent"
    />
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, client } = useAuth();
  const {
    assignment,
    todaySession,
    todaySessionCompleted,
    weekDays,
    weeklyWorkouts,
    streak,
    isLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard(client?.id);

  useFocusEffect(
    React.useCallback(() => {
      refetchDashboard();
    }, [refetchDashboard])
  );
  const { phase, phaseLabel, cycleDay } = useCycle(client?.id);
  const { readiness } = useReadiness(client?.id);
  const { records: readinessHistory } = useReadinessHistory(client?.id, 7);
  const { insight } = useDailyInsight(client?.id);
  const adaptation = useTrainingAdaptation(client?.id);
  const recommendation = getAdjustmentRecommendation(phase ?? undefined, readiness);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "God morgon";
    if (hour < 17) return "God eftermiddag";
    return "God kväll";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "du";

  if (isLoading) return <LoadingScreen />;

  if (dashboardError) {
    return (
      <Screen padded centered>
        <ErrorState
          title="Kunde inte ladda"
          description={dashboardError}
          retryLabel="Försök igen"
          onRetry={refetchDashboard}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title={`${getGreeting()}, ${firstName}`}>
          <XStack flexWrap="wrap" gap="$2" alignItems="center">
            <AppText variant="body" muted>
              {assignment
                ? `Vecka 1 av ${assignment.program.name}`
                : "Inget aktivt program"}
            </AppText>
            {phase && (
              <Badge
                variant="outline"
                label={phaseLabel}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => navigation.navigate("Cycle")}
              />
            )}
          </XStack>
        </Section>

        {(adaptation.volumeModifier !== 1 || adaptation.rpeModifier !== 0) && todaySession && !todaySessionCompleted && (
          <Section title="Dagens beslut">
            <Card pressable onPress={() => navigation.navigate("WorkoutSession", { sessionId: todaySession.id })}>
              <Card.Content>
                <YStack gap="$2">
                  <AppText variant="small" color="$accent" fontWeight="600">
                    {adaptation.rpeModifier !== 0 &&
                      `${adaptation.rpeModifier > 0 ? "+" : ""}${adaptation.rpeModifier} RPE`}
                    {adaptation.rpeModifier !== 0 && adaptation.volumeModifier !== 1 && " · "}
                    {adaptation.volumeModifier !== 1 &&
                      (adaptation.volumeModifier < 1
                        ? `−${Math.round((1 - adaptation.volumeModifier) * 100)}% volym`
                        : `+${Math.round((adaptation.volumeModifier - 1) * 100)}% volym`)}
                  </AppText>
                  {adaptation.topDrivers.length > 0 && (
                    <AppText variant="caption" muted>
                      Varför: {adaptation.topDrivers.join(" ")}
                    </AppText>
                  )}
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        {(insight || recommendation) && (
          <Section title="Idag">
            <Card>
              <Card.Content>
                {insight ? (
                  <YStack gap="$3">
                    <AppText variant="h3">{insight.insight_title}</AppText>
                    {insight.insight_body && (
                      <AppText variant="small" muted>
                        {insight.insight_body}
                      </AppText>
                    )}
                    {Array.isArray(insight.actions) && insight.actions.length > 0 && (
                      <YStack gap="$1">
                        {insight.actions.map((a, i) => (
                          <AppText key={i} variant="caption" muted>
                            • {a}
                          </AppText>
                        ))}
                      </YStack>
                    )}
                  </YStack>
                ) : (
                  <AppText variant="small">{recommendation!.reason}</AppText>
                )}
              </Card.Content>
            </Card>
          </Section>
        )}
        {!insight && !recommendation && !readiness && (
          <Section title="Idag">
            <Card pressable onPress={() => navigation.navigate("Readiness")}>
              <Card.Content>
                <YStack alignItems="center" gap="$2">
                  <Text fontSize="$xxl">💚</Text>
                  <AppText variant="body" center>
                    Logga hur du mår idag
                  </AppText>
                  <AppText variant="small" muted center>
                    Sömn, stress, energi – få personliga rekommendationer
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        {(readinessHistory ?? []).length > 0 && (
          <Section title="Readiness trend">
            <Card>
              <Card.Content>
                <XStack justifyContent="space-between" alignItems="flex-end" gap="$2">
                  {(readinessHistory ?? []).slice(-7).map((r) => {
                    const score = r.readiness_score ?? 0;
                    const h = Math.max(8, (score / 100) * 48);
                    return (
                      <YStack key={r.id} flex={1} alignItems="center" gap="$1">
                        <YStack
                          width="100%"
                          height={48}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <YStack
                            width="100%"
                            minHeight={8}
                            height={h}
                            backgroundColor="$accent"
                            opacity={0.6 + (score / 100) * 0.4}
                            borderRadius="$2"
                          />
                        </YStack>
                        <AppText variant="caption" muted>
                          {r.date.slice(-2)}
                        </AppText>
                      </YStack>
                    );
                  })}
                </XStack>
                {readiness?.readiness_score != null && (
                  <AppText variant="caption" muted marginTop="$2">
                    Idag: {readiness.readiness_score}%
                  </AppText>
                )}
              </Card.Content>
            </Card>
          </Section>
        )}

        <Section title="Menscykel">
          <Card
            pressable
            onPress={() => navigation.navigate("Cycle")}
          >
            <Card.Content>
              <XStack alignItems="center" gap="$4">
                <YStack
                  width={48}
                  height={48}
                  borderRadius="$full"
                  backgroundColor="$surface3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$xl">🌙</Text>
                </YStack>
                <YStack flex={1} gap="$2">
                  {phase ? (
                    <>
                      <AppText variant="h3">{phaseLabel}</AppText>
                      <AppText variant="small" muted>
                        Dag {cycleDay} i cykeln · Tryck för mer
                      </AppText>
                      <CycleGraphSection clientId={client?.id} />
                    </>
                  ) : (
                    <>
                      <AppText variant="body">
                        Kom igång med cykelspårning
                      </AppText>
                      <AppText variant="small" muted>
                        Logga period för anpassade träningsrekommendationer
                      </AppText>
                    </>
                  )}
                </YStack>
                <AppText variant="body" color="$colorSecondary">→</AppText>
              </XStack>
            </Card.Content>
          </Card>
        </Section>

        {todaySession ? (
          <Section title="Dagens pass">
            <Card pressable={!todaySessionCompleted}>
              <Card.Header>
                <XStack justifyContent="space-between" alignItems="center">
                  <Card.Title>{todaySession.name}</Card.Title>
                  <Badge
                    variant={todaySessionCompleted ? "outline" : "accent"}
                    label={todaySessionCompleted ? "Genomfört" : (todaySession.focus || "Träning")}
                  />
                </XStack>
              </Card.Header>
              <Card.Content>
                <AppText variant="small">
                  {todaySession.session_exercises?.length || 0} övningar
                </AppText>
              </Card.Content>
              {!todaySessionCompleted && (
                <Card.Footer>
                  <AppButton
                    variant="primary"
                    fullWidth
                    onPress={() =>
                      navigation.navigate("WorkoutSession", {
                        sessionId: todaySession.id,
                      })
                    }
                  >
                    Starta pass
                  </AppButton>
                </Card.Footer>
              )}
            </Card>
          </Section>
        ) : (
          <Section title="Dagens pass">
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$3" paddingVertical="$4">
                  <Text fontSize="$xxxl">🌿</Text>
                  <AppText variant="body" muted center>
                    Ingen träning planerad idag.{"\n"}Vila och återhämta dig!
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        <Section title="Denna vecka">
          <Card>
            <Card.Content>
              <XStack justifyContent="space-between">
                {weekDays.map((day) => (
                  <YStack
                    key={day.dayOfWeek}
                    alignItems="center"
                    gap="$2"
                    opacity={day.session ? 1 : 0.4}
                  >
                    <YStack
                      width={36}
                      height={36}
                      borderRadius="$full"
                      backgroundColor={
                        day.isToday
                          ? "$accent"
                          : day.session
                          ? "$surface3"
                          : "transparent"
                      }
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={day.isToday ? 0 : 1}
                      borderColor="$borderSoft"
                    >
                      <Text
                        fontSize="$sm"
                        fontWeight="600"
                        color={day.isToday ? "$background" : "$textPrimary"}
                      >
                        {day.shortName}
                      </Text>
                    </YStack>
                    <SessionIndicator hasSession={!!day.session} />
                  </YStack>
                ))}
              </XStack>
            </Card.Content>
          </Card>
        </Section>

        <Divider />

        <Section title="Snabbstatistik">
          <XStack gap="$4">
            <Card flex={1}>
              <Card.Content>
                <YStack alignItems="center" gap="$2">
                  <Text fontSize="$xxl" fontWeight="700" color="$accent">
                    {weeklyWorkouts}
                  </Text>
                  <AppText variant="caption">Pass denna vecka</AppText>
                </YStack>
              </Card.Content>
            </Card>
            <Card flex={1}>
              <Card.Content>
                <YStack alignItems="center" gap="$2">
                  <Text fontSize="$xxl" fontWeight="700" color="$accent">
                    {streak}
                  </Text>
                  <AppText variant="caption">
                    {streak === 1 ? "Dag streak" : "Dagars streak"}
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </XStack>
        </Section>
      </YStack>
    </Screen>
  );
}
