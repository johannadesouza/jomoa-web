/**
 * Dashboard "Fokus" / "Dagens fokus" – visar check-in- och passkort.
 * Morning routine-korten styrs av feature flag show_morning_routine.
 */
import React from "react";
import { YStack, XStack, Text } from "tamagui";
import { Section, Card, AppText, AppButton } from "../../shared/ui";
import { useFeatureFlags } from "../../shared/context/FeatureFlagsContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import type { ProgramSessionData } from "../../lib/services/workoutService";
import type { ProgramAssignmentData } from "../../lib/services/programService";
import type { ReadinessRecord } from "../../lib/services/readinessService";

export interface DashboardHighlightsProps {
  isViewingToday: boolean;
  assignment: ProgramAssignmentData | null;
  readiness: ReadinessRecord | null;
  todaySession: ProgramSessionData | null;
  todaySessionCompleted: boolean;
  selectedDate: string;
  inProgressSessionId: string | null;
  todayString: string;
  onOpenMorningRoutine: () => void;
  onNavigateWorkoutSession: (sessionId: string) => void;
  onNavigateTrain: () => void;
}

export function DashboardHighlights({
  isViewingToday,
  assignment,
  readiness,
  todaySession,
  todaySessionCompleted,
  selectedDate,
  inProgressSessionId,
  todayString,
  onOpenMorningRoutine,
  onNavigateWorkoutSession,
  onNavigateTrain,
}: DashboardHighlightsProps) {
  const flags = useFeatureFlags();
  const copy = useAppCopy("sv");
  const showMorningRoutine = flags.show_morning_routine !== false;

  return (
    <Section
      title={isViewingToday ? "Dagens fokus" : "Fokus"}
      subtitle={assignment ? `${assignment.program.name}` : undefined}
    >
      {showMorningRoutine && isViewingToday && !readiness && !todaySession && (
        <Card pressable onPress={onOpenMorningRoutine}>
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
                {getAppCopy(copy, "highlights_do_checkin", "Gör check-in")} →
              </AppText>
            </YStack>
          </Card.Content>
        </Card>
      )}
      {showMorningRoutine && !readiness && todaySession && !todaySessionCompleted && isViewingToday && (
        <Card pressable onPress={onOpenMorningRoutine}>
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
              <AppButton variant="primary" fullWidth onPress={onOpenMorningRoutine}>
                Check-in + starta pass
              </AppButton>
            </YStack>
          </Card.Content>
        </Card>
      )}
      {todaySession && todaySessionCompleted && !readiness && (
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
                onPress={onNavigateTrain}
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
        <Card pressable onPress={() => onNavigateWorkoutSession(todaySession.id)}>
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
                onPress={() => onNavigateWorkoutSession(todaySession.id)}
              >
                {inProgressSessionId === todaySession.id ? "Fortsätt pass" : "Starta pass"}
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
                {selectedDate > todayString
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
                {getAppCopy(copy, "highlights_no_activity", "Ingen check-in eller pass denna dag")}
              </AppText>
            </YStack>
          </Card.Content>
        </Card>
      )}
    </Section>
  );
}
