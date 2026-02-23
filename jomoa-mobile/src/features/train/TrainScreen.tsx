import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { YStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen, Section, AppText, Card, AppButton } from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { useAuth } from "../../shared/context/AuthContext";
import { useActiveAssignment } from "../../lib/hooks/useActiveAssignment";
import { getWeekIdForDate } from "../../lib/services/programService";
import { fetchSessionsByWeekId } from "../../lib/services/workoutService";
import type { ProgramSessionData } from "../../lib/services/workoutService";
import { getLocalDateString, getDayOfWeekFromDateStr } from "../../lib/utils/date";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { FeaturedProgramCard } from "./FeaturedProgramCard";
import { FavoritesSection } from "./FavoritesSection";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TrainScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const { assignment, refetch } = useActiveAssignment(client?.id);
  const [todaySession, setTodaySession] = useState<ProgramSessionData | null>(null);

  useEffect(() => {
    if (!assignment) {
      setTodaySession(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const todayStr = getLocalDateString();
      const weekId = await getWeekIdForDate(
        assignment.program_id,
        assignment.start_date,
        todayStr
      );
      if (!weekId || cancelled) return;
      const sessions = await fetchSessionsByWeekId(weekId);
      if (cancelled) return;
      const todayDb = getDayOfWeekFromDateStr(todayStr);
      const session = sessions.find((s) => s.day_of_week === todayDb) ?? null;
      setTodaySession(session);
    })();
    return () => {
      cancelled = true;
    };
  }, [assignment?.program_id, assignment?.start_date]);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleSettings = () => navigation.navigate("Settings");
  const handleCalendar = () => navigation.navigate("Calendar");
  const handleProfile = () => navigation.navigate("Profile");

  return (
    <Screen padded scroll>
      <TopBar
        title="Träning"
        rightIcons={["calendar", "profile", "settings"]}
        onCalendar={handleCalendar}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />
      <YStack gap="$8" paddingTop="$4">
        <Section title="Dagens pass" spacing="md">
          <YStack gap="$4">
            {todaySession ? (
              <Card
                pressable
                onPress={() =>
                  navigation.navigate("WorkoutSession", {
                    sessionId: todaySession.id,
                    isStandalone: false,
                  })
                }
              >
                <Card.Header>
                  <Card.Title>{todaySession.name}</Card.Title>
                  {todaySession.focus && (
                    <AppText variant="caption" color="$colorSecondary">
                      {todaySession.focus}
                    </AppText>
                  )}
                </Card.Header>
                <Card.Content>
                  <AppText variant="small" muted>
                    {(todaySession.session_exercises ?? []).length} övningar ·{" "}
                    {(todaySession.session_exercises ?? []).reduce(
                      (sum, e) => sum + (e.sets_planned || 0),
                      0
                    )}{" "}
                    set
                  </AppText>
                </Card.Content>
                <Card.Footer>
                  <AppButton
                    variant="primary"
                    size="sm"
                    onPress={() =>
                      navigation.navigate("WorkoutSession", {
                        sessionId: todaySession.id,
                        isStandalone: false,
                      })
                    }
                  >
                    Starta pass
                  </AppButton>
                </Card.Footer>
              </Card>
            ) : (
              <Card>
                <Card.Content padding="$6">
                  <AppText variant="body" muted center>
                    Inget pass idag i programmet.
                  </AppText>
                  <AppText variant="small" muted center marginTop="$2">
                    Kika i programmet för att se hela veckan.
                  </AppText>
                </Card.Content>
              </Card>
            )}
            <AppButton
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate("ProgramList")}
            >
              Se alla pass i programmet →
            </AppButton>
          </YStack>
        </Section>

        <Section title="Träna mer eller planera in" spacing="md">
          <YStack gap="$4">
            <AppText variant="body" muted>
              Vill du träna mer eller har du ingen pass idag? Välj från Favoriter nedan eller planera in pass för valfri dag i kalendern.
            </AppText>
            <AppButton
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate("Calendar")}
            >
              Planera in pass i kalendern →
            </AppButton>
          </YStack>
        </Section>

        <Section title="Favoriter" spacing="md">
          <FavoritesSection clientId={client?.id} embedded />
        </Section>

        {assignment && (
          <Section title="Ditt program" spacing="md">
            <FeaturedProgramCard
              assignment={assignment}
              onPress={() => navigation.navigate("ProgramList")}
            />
          </Section>
        )}
      </YStack>
    </Screen>
  );
}
