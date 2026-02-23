import React, { useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable } from "react-native";
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
  InsightCard,
  LoadingScreen,
  ErrorState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useDashboard } from "../../lib/hooks/useDashboard";
import { useCycle } from "../../lib/hooks/useCycle";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { useReadinessHistory } from "../../lib/hooks/useReadinessHistory";
import { useDailyInsight } from "../../lib/hooks/useDailyInsight";
import { useInsights } from "../../lib/hooks/useInsights";
import { useDailyPhaseInsight } from "../../lib/hooks/useDailyPhaseInsight";
import { useInProgressWorkout } from "../../lib/hooks/useInProgressWorkout";
import { PHASE_KNOWLEDGE_COPY } from "../../lib/data/phaseKnowledgeCopy";
import { getLocalDateString, getDateForWeekDay, addDaysToDateStr } from "../../lib/utils/date";
import { HighlightsSection } from "./HighlightsSection";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { TopBar } from "../../components/layout/TopBar";
import { QuickActionsSection } from "./QuickActionsSection";
import { RestTimerModal } from "./RestTimerModal";

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
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

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
    isViewingToday,
  } = useDashboard(client?.id, selectedDate);

  const { inProgress, refetch: refetchInProgress } = useInProgressWorkout();
  const { phase, phaseLabel, cycleDay, daysUntilNextPeriod, refetch: refetchCycle } = useCycle(client?.id);
  const { readiness, refetch: refetchReadiness } = useReadiness(client?.id, selectedDate);
  const { refetch: refetchReadinessHistory } = useReadinessHistory(client?.id, 7);
  const { insight, refetch: refetchInsight } = useDailyInsight(client?.id);
  const { stats: insightStats, refetch: refetchInsights } = useInsights(client?.id);

  const refetchRef = useRef({
    refetchDashboard,
    refetchInProgress,
    refetchReadiness,
    refetchReadinessHistory,
    refetchCycle,
    refetchInsight,
    refetchInsights,
  });
  refetchRef.current = {
    refetchDashboard,
    refetchInProgress,
    refetchReadiness,
    refetchReadinessHistory,
    refetchCycle,
    refetchInsight,
    refetchInsights,
  };

  useFocusEffect(
    React.useCallback(() => {
      const r = refetchRef.current;
      r.refetchDashboard();
      r.refetchInProgress();
      r.refetchReadiness();
      r.refetchReadinessHistory();
      r.refetchCycle();
      r.refetchInsight();
      r.refetchInsights();
    }, [])
  );
  const phaseInsight = useDailyPhaseInsight(client?.id);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "God morgon";
    if (hour < 17) return "God eftermiddag";
    return "God kväll";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "du";
  const [restTimerVisible, setRestTimerVisible] = useState(false);

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

  const handleSettings = () => navigation.navigate("Settings");

  return (
    <Screen scroll padded>
      <TopBar rightIcons={["settings"]} onSettings={handleSettings} />
      <YStack gap="$8" paddingTop="$4" paddingBottom="$8">
        <YStack gap="$4">
          <AppText variant="h2" color="$textPrimary">
            {getGreeting()}, {firstName}
          </AppText>
        </YStack>

        <Section
          title="Vecka"
          viewAllLabel="Kalender"
          onViewAll={() => navigation.navigate("Calendar")}
        >
          <Card>
            <Card.Content>
              <XStack alignItems="center" gap="$2" marginBottom="$3">
                <Pressable
                  onPress={() => setSelectedDate(addDaysToDateStr(selectedDate, -7))}
                  hitSlop={12}
                >
                  <AppText variant="body" color="$textSecondary">‹</AppText>
                </Pressable>
                <AppText variant="small" muted flex={1} textAlign="center">
                  {getDateForWeekDay(selectedDate, 1).slice(-2).replace(/^0/, "")}–{getDateForWeekDay(selectedDate, 7).slice(-2).replace(/^0/, "")}
                </AppText>
                <Pressable
                  onPress={() => setSelectedDate(addDaysToDateStr(selectedDate, 7))}
                  hitSlop={12}
                >
                  <AppText variant="body" color="$textSecondary">›</AppText>
                </Pressable>
              </XStack>
              <XStack justifyContent="space-between">
                {weekDays.map((day) => {
                  const dayDateStr = getDateForWeekDay(selectedDate, day.dayOfWeek);
                  const isSelected = dayDateStr === selectedDate;
                  const dayNum = dayDateStr.slice(-2).replace(/^0/, "");
                  return (
                    <Pressable
                      key={day.dayOfWeek}
                      onPress={() => setSelectedDate(dayDateStr)}
                    >
                      <YStack
                        alignItems="center"
                        gap="$1"
                        opacity={day.session ? 1 : 0.4}
                      >
                        <YStack
                          width={40}
                          height={40}
                          borderRadius="$full"
                          backgroundColor={
                            isSelected
                              ? "$accent"
                              : day.isToday
                              ? "$surface3"
                              : day.session
                              ? "$surface3"
                              : "transparent"
                          }
                          alignItems="center"
                          justifyContent="center"
                          borderWidth={isSelected || day.isToday ? 0 : 1}
                          borderColor="$borderSoft"
                        >
                          <Text
                            fontSize="$xs"
                            fontWeight="600"
                            color={isSelected || day.isToday ? "$background" : "$textPrimary"}
                          >
                            {day.shortName}
                          </Text>
                          <Text
                            fontSize={10}
                            fontWeight="500"
                            color={isSelected || day.isToday ? "$background" : "$textMuted"}
                          >
                            {dayNum}
                          </Text>
                        </YStack>
                        <SessionIndicator hasSession={!!day.session} />
                      </YStack>
                    </Pressable>
                  );
                })}
              </XStack>
            </Card.Content>
          </Card>
        </Section>

        <Section
          title={isViewingToday ? "Dagens fokus" : "Fokus"}
          subtitle={assignment ? `${assignment.program.name}` : undefined}
        >
          {isViewingToday && !readiness && !todaySession && (
            <Card pressable onPress={() => navigation.navigate("Readiness")}>
              <Card.Content>
                <YStack alignItems="center" gap="$3" paddingVertical="$2">
                  <YStack
                    width={56}
                    height={56}
                    borderRadius="$full"
                    backgroundColor="$surface3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="$xxl">💚</Text>
                  </YStack>
                  <AppText variant="h3" center>
                    Logga hur du mår idag
                  </AppText>
                  <AppText variant="small" muted center>
                    Sömn, stress, energi – få personliga rekommendationer
                  </AppText>
                  <AppText variant="caption" color="$accent" fontWeight="600">
                    Gör check-in →
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {!readiness && todaySession && !todaySessionCompleted && isViewingToday && (
            <Card pressable onPress={() => navigation.navigate("WorkoutSession", { sessionId: todaySession.id })}>
              <Card.Content>
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      width={48}
                      height={48}
                      borderRadius="$full"
                      backgroundColor="$accent"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="$xl">💪</Text>
                    </YStack>
                    <YStack flex={1} gap="$1">
                      <AppText variant="h3">{todaySession.name}</AppText>
                      <AppText variant="small" muted>
                        {todaySession.session_exercises?.length || 0} övningar · {todaySession.focus || "Träning"}
                      </AppText>
                    </YStack>
                  </XStack>
                  <AppButton
                    variant="primary"
                    fullWidth
                    onPress={() => navigation.navigate("WorkoutSession", { sessionId: todaySession.id })}
                  >
                    {inProgress?.sessionId === todaySession.id ? "Fortsätt pass" : "Starta pass"}
                  </AppButton>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {todaySession && todaySessionCompleted && (
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$2" paddingVertical="$2">
                  <Text fontSize="$xxl">✓</Text>
                  <AppText variant="h3" center>Bra jobbat!</AppText>
                  <AppText variant="small" muted center>
                    {todaySession.name} genomförd
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {readiness && !todaySession && (
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$2" paddingVertical="$2">
                  <Text fontSize="$xxl">🌿</Text>
                  <AppText variant="h3" center>Lugn dag</AppText>
                  <AppText variant="small" muted center>
                    Inget pass planerat – vila eller utforska fritt
                  </AppText>
                  <AppButton
                    variant="secondary"
                    size="sm"
                    marginTop="$2"
                    onPress={() => navigation.navigate("Main", { screen: "TrainTab" })}
                  >
                    Utforska pass
                  </AppButton>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {readiness && todaySession && todaySessionCompleted && (
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$2" paddingVertical="$2">
                  <Text fontSize="$xxl">✓</Text>
                  <AppText variant="h3" center>Bra jobbat!</AppText>
                  <AppText variant="small" muted center>
                    {todaySession.name} genomförd
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {readiness && todaySession && !todaySessionCompleted && isViewingToday && (
            <Card pressable onPress={() => navigation.navigate("WorkoutSession", { sessionId: todaySession.id })}>
              <Card.Content>
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      width={48}
                      height={48}
                      borderRadius="$full"
                      backgroundColor="$accent"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="$xl">💪</Text>
                    </YStack>
                    <YStack flex={1} gap="$1">
                      <AppText variant="h3">{todaySession.name}</AppText>
                      <AppText variant="small" muted>
                        {todaySession.session_exercises?.length || 0} övningar
                      </AppText>
                    </YStack>
                  </XStack>
                  <AppButton
                    variant="primary"
                    fullWidth
                    onPress={() => navigation.navigate("WorkoutSession", { sessionId: todaySession.id })}
                  >
                    {inProgress?.sessionId === todaySession.id ? "Fortsätt pass" : "Starta pass"}
                  </AppButton>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {!isViewingToday && todaySession && !todaySessionCompleted && (
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$2" paddingVertical="$2">
                  <Text fontSize="$xxl">📋</Text>
                  <AppText variant="h3" center>
                    {todaySession.name}
                  </AppText>
                  <AppText variant="small" muted center>
                    {selectedDate > getLocalDateString()
                      ? "Planerat"
                      : "Ej genomfört"}
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          )}
          {!isViewingToday && !todaySession && !readiness && (
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$2" paddingVertical="$2">
                  <Text fontSize="$xxl">—</Text>
                  <AppText variant="small" muted center>
                    Ingen check-in eller pass denna dag
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          )}
        </Section>

        <QuickActionsSection
          onLogEnergie={() => navigation.navigate("Readiness")}
          onLogSymptom={() => navigation.navigate("Cycle")}
          onOpenRestTimer={() => setRestTimerVisible(true)}
          onOpenCalendar={() => navigation.navigate("Calendar")}
        />

        <HighlightsSection
          sessionsThisMonth={insightStats?.sessionsThisMonth ?? 0}
          totalVolume={insightStats?.totalVolume ?? 0}
          streak={streak}
          weeklyWorkouts={weeklyWorkouts}
          onViewAll={() => navigation.navigate("Main", { screen: "InsightsTab" })}
        />

        {phase ? (
          <Card pressable onPress={() => navigation.navigate("Cycle")}>
            <Card.Content>
              <XStack alignItems="center" justifyContent="space-between" gap="$4">
                <YStack flex={1} gap="$1">
                  <AppText variant="h3">{phaseLabel}</AppText>
                  <AppText variant="small" muted>
                    {daysUntilNextPeriod != null
                      ? daysUntilNextPeriod === 0
                        ? "Mens idag"
                        : `Mens om ${daysUntilNextPeriod} ${daysUntilNextPeriod === 1 ? "dag" : "dagar"}`
                      : `Dag ${cycleDay} i cykeln`}
                  </AppText>
                </YStack>
                <AppText variant="body" color="$textSecondary">→</AppText>
              </XStack>
            </Card.Content>
          </Card>
        ) : (
          <Card pressable onPress={() => navigation.navigate("Cycle")}>
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
                <YStack flex={1} gap="$1">
                  <AppText variant="body">Kom igång med cykelspårning</AppText>
                  <AppText variant="small" muted>
                    Logga period för anpassade rekommendationer
                  </AppText>
                </YStack>
                <AppText variant="body" color="$textSecondary">→</AppText>
              </XStack>
            </Card.Content>
          </Card>
        )}

        {(insight || (phase && phaseInsight)) && (
          <Section title="Insikter">
            {insight && (
              <Card>
                <Card.Content>
                  <YStack gap="$2">
                    <AppText variant="h3">{insight.insight_title}</AppText>
                    {insight.insight_body && (
                      <AppText variant="small" muted>{insight.insight_body}</AppText>
                    )}
                  </YStack>
                </Card.Content>
              </Card>
            )}
            {phase && phaseInsight && (
              <InsightCard
                icon="🌙"
                headline={phaseInsight.headline}
                bullets={phaseInsight.bullets}
                footer={PHASE_KNOWLEDGE_COPY.homeTapForMore(getPhaseLabel(phaseInsight.phase ?? null))}
                onPress={() => navigation.navigate("CycleInsights")}
              />
            )}
          </Section>
        )}

        {isViewingToday && !todaySession && !(readiness && !todaySession) && (
          <Card pressable onPress={() => navigation.navigate("Main", { screen: "TrainTab" })}>
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
                  <Text fontSize="$xl">💪</Text>
                </YStack>
                <YStack flex={1} gap="$1">
                  <AppText variant="body">Utforska pass</AppText>
                  <AppText variant="small" muted>
                    {!assignment ? "Välj program eller bläddra fristående pass" : "Se pass från ditt program"}
                  </AppText>
                </YStack>
                <AppText variant="body" color="$textSecondary">→</AppText>
              </XStack>
            </Card.Content>
          </Card>
        )}

        <Divider />
      </YStack>

      <RestTimerModal
        visible={restTimerVisible}
        onClose={() => setRestTimerVisible(false)}
      />
    </Screen>
  );
}
