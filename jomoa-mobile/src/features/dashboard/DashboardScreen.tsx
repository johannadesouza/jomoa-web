import React, { useEffect, useState } from "react";
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
  AppIcon,
  LoadingScreen,
  ErrorState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useAppNow } from "../../shared/context/AppNowContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import { useDashboard } from "../../lib/hooks/useDashboard";
import { useDashboardRefetch } from "../../lib/hooks/useDashboardRefetch";
import { useCycleContext } from "../../shared/context/CycleContext";
import { OverdueBanner } from "../cycle/OverdueBanner";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { useReadinessHistory } from "../../lib/hooks/useReadinessHistory";
import { useDailyInsight } from "../../lib/hooks/useDailyInsight";
import { useDailyPhaseInsight } from "../../lib/hooks/useDailyPhaseInsight";
import { useInProgressWorkout } from "../../lib/hooks/useInProgressWorkout";
import { getLocalDateString } from "../../lib/utils/date";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { TopBar } from "../../components/layout/TopBar";
import { DashboardWeekStrip } from "./DashboardWeekStrip";
import { DashboardHighlights } from "./DashboardHighlights";
import { DashboardInsightsBlock } from "./DashboardInsightsBlock";
import { QuickActionsSection } from "./QuickActionsSection";
import { RestTimerModal } from "./RestTimerModal";
import { MorningRoutineModal } from "./MorningRoutineModal";
import { RecommendedProgramsSection } from "../train/RecommendedProgramsSection";
import { fetchReadinessInsight, type ReadinessInsight } from "../../lib/repos/contentRepo/cycleContent";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  const {
    phase,
    phaseLabel,
    cycleDay,
    daysUntilNextPeriod,
    cycleLengthDisplay,
    rollingAvg,
    overdueState,
    mode: cycleMode,
    logPeriodStart,
    refetch: refetchCycle,
  } = useCycleContext();
  const { readiness, refetch: refetchReadiness } = useReadiness(client?.id, selectedDate);
  const { refetch: refetchReadinessHistory } = useReadinessHistory(client?.id, 7);
  const copy = useAppCopy("sv");
  const showCycleInUI = client?.presentation_profile !== "male";
  const isCycleOnly = client?.onboarding_path === "cycle_only";
  const dashboardHeroLine = isCycleOnly
    ? "Din dag, din cykel"
    : getAppCopy(copy, "dashboard_hero_line", "Din dag, din träning");
  const { insight, refetch: refetchInsight } = useDailyInsight(client?.id, {
    defaultInsightTitle: getAppCopy(copy, "default_insight_title", "Dagens träningsrekommendation"),
  });

  const refetch = useDashboardRefetch({
    refetchDashboard,
    refetchInProgress,
    refetchReadiness,
    refetchReadinessHistory,
    refetchCycle,
    refetchInsight,
  });
  useFocusEffect(React.useCallback(() => refetch(), [refetch]));

  const phaseInsight = useDailyPhaseInsight(client?.id);
  const appNow = useAppNow();

  const getGreeting = () => {
    const hour = appNow.now().getHours();
    if (hour < 12) return "God morgon";
    if (hour < 17) return "God eftermiddag";
    return "God kväll";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "du";
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [morningRoutineVisible, setMorningRoutineVisible] = useState(false);
  const [readinessInsight, setReadinessInsight] = useState<ReadinessInsight | null>(null);

  useEffect(() => {
    if (readiness?.readiness_score != null) {
      fetchReadinessInsight(readiness.readiness_score).then(setReadinessInsight);
    } else {
      setReadinessInsight(null);
    }
  }, [readiness?.readiness_score]);

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
  const handleProfile = () => navigation.navigate("Profile");

  return (
    <Screen scroll padded>
      <TopBar rightIcons={["profile", "settings"]} onProfile={handleProfile} onSettings={handleSettings} />
      <YStack gap="$8" paddingTop="$4" paddingBottom="$8">
        <YStack gap="$2">
          <AppText variant="h2" color="$textPrimary">
            {getGreeting()}, {firstName}
          </AppText>
          <AppText variant="small" muted>
            {dashboardHeroLine}
          </AppText>
        </YStack>

        <DashboardWeekStrip
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          weekDays={weekDays}
          onViewCalendar={() => navigation.navigate("Calendar")}
        />

        {!assignment && !isCycleOnly && (
          <Card pressable onPress={() => navigation.navigate("Main", { screen: "TrainTab" })}>
            <Card.Content>
              <XStack alignItems="center" gap="$4">
                <YStack
                  width={48}
                  height={48}
                  borderRadius="$full"
                  backgroundColor="$accent"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <AppIcon name="barbell-outline" size={24} color="$background" />
                </YStack>
                <YStack flex={1} gap="$1">
                  <AppText variant="h3">{getAppCopy(copy, "dashboard_choose_program_title", "Välj ditt första program")}</AppText>
                  <AppText variant="small" muted>
                    {getAppCopy(copy, "dashboard_choose_program_subtitle", "Gå till Träna och välj ett program som matchar dina mål.")}
                  </AppText>
                </YStack>
                <AppText variant="body" color="$textSecondary">→</AppText>
              </XStack>
            </Card.Content>
          </Card>
        )}

        {isCycleOnly && (
          <Card pressable onPress={() => navigation.navigate("ProgramSelect")}>
            <Card.Content>
              <XStack alignItems="center" gap="$4">
                <YStack
                  width={48}
                  height={48}
                  borderRadius="$full"
                  backgroundColor="$surface3"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <AppIcon name="barbell-outline" size={24} />
                </YStack>
                <YStack flex={1} gap="$1">
                  <AppText variant="h3">Lägg till träning när du vill</AppText>
                  <AppText variant="small" muted>
                    Du fokuserar på cykel nu. Här kan du välja ett träningsprogram när du känner dig redo.
                  </AppText>
                </YStack>
                <AppText variant="body" color="$textSecondary">→</AppText>
              </XStack>
            </Card.Content>
          </Card>
        )}

        <DashboardHighlights
          isViewingToday={isViewingToday}
          assignment={assignment}
          readiness={readiness}
          todaySession={todaySession}
          todaySessionCompleted={todaySessionCompleted}
          selectedDate={selectedDate}
          inProgressSessionId={inProgress?.sessionId ?? null}
          todayString={appNow.todayString()}
          onOpenMorningRoutine={() => setMorningRoutineVisible(true)}
          onNavigateWorkoutSession={(sessionId) => navigation.navigate("WorkoutSession", { sessionId })}
          onNavigateTrain={() => navigation.navigate("Main", { screen: "TrainTab" })}
          isCycleOnly={isCycleOnly}
        />

        <QuickActionsSection
          onLogEnergie={() => navigation.navigate("Readiness")}
          onLogSymptom={() => navigation.navigate("Cycle")}
          onOpenRestTimer={() => setRestTimerVisible(true)}
          onOpenCalendar={() => navigation.navigate("Calendar")}
          showSymptomLog={showCycleInUI}
        />

        {showCycleInUI && overdueState !== "none" && (
          <OverdueBanner
            overdueState={overdueState}
            onLogPeriod={() => navigation.navigate("Cycle")}
          />
        )}

        {showCycleInUI && (
          cycleMode !== "regular" ? (
            <Card pressable onPress={() => navigation.navigate("Cycle")}>
              <Card.Content>
                <XStack alignItems="center" gap="$4">
                  <YStack flex={1} gap="$1">
                    <AppText variant="h3">
                      {cycleMode === "perimenopause"
                        ? getAppCopy(copy, "cycle_card_perimenopause_title", "Peri-/menopaus")
                        : getAppCopy(copy, "cycle_card_no_cycle_title", "Utebliven mens")}
                    </AppText>
                    <AppText variant="small" muted>
                      {cycleMode === "perimenopause"
                        ? getAppCopy(copy, "cycle_card_perimenopause_subtitle", "Logga symtom för anpassad träning")
                        : getAppCopy(copy, "cycle_card_no_cycle_subtitle", "Träning baseras på dagsform och historia")}
                    </AppText>
                  </YStack>
                  <AppText variant="body" color="$textSecondary">→</AppText>
                </XStack>
              </Card.Content>
            </Card>
          ) : phase ? (
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
                        : `Dag ${cycleDay}${rollingAvg ? ` av ~${cycleLengthDisplay}` : " i cykeln"}`}
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
                    <AppText variant="body">
                      {getAppCopy(copy, "cycle_get_started_title", "Kom igång med cykelspårning")}
                    </AppText>
                    <AppText variant="small" muted>
                      {getAppCopy(copy, "cycle_get_started_subtitle", "Logga period för anpassade rekommendationer")}
                    </AppText>
                  </YStack>
                  <AppText variant="body" color="$textSecondary">→</AppText>
                </XStack>
              </Card.Content>
            </Card>
          )
        )}

        <DashboardInsightsBlock
          sectionTitle={getAppCopy(copy, "insights_section_title", "Insikter")}
          insight={insight}
          phase={phase}
          phaseInsight={phaseInsight}
          readinessInsight={readinessInsight}
          readiness={readiness}
          onNavigateReadiness={() => navigation.navigate("Readiness")}
          onNavigateCycleInsights={() => navigation.navigate("CycleInsights")}
        />

        {isViewingToday && !todaySession && !(readiness && !todaySession) && !isCycleOnly && (
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
                  <AppIcon name="barbell-outline" size={24} />
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

        {!assignment && !isCycleOnly && (
          <RecommendedProgramsSection primaryGoal={client?.primary_goal} maxItems={2} />
        )}

        <Divider />
      </YStack>

      <RestTimerModal
        visible={restTimerVisible}
        onClose={() => setRestTimerVisible(false)}
      />

      <MorningRoutineModal
        visible={morningRoutineVisible}
        todaySession={todaySession}
        onClose={() => setMorningRoutineVisible(false)}
        onReadinessSaved={() => {
          refetchReadiness();
          refetchReadinessHistory();
        }}
      />
    </Screen>
  );
}
