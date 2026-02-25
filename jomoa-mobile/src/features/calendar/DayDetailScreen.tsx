import React, { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppInput,
  LoadingScreen,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycleContext } from "../../shared/context/CycleContext";
import { DayNotesSection } from "./DayNotesSection";
import {
  getEntriesForRange,
  upsertEntry,
  deleteEntry,
} from "../../lib/services/calendarEntryService";
import {
  fetchSessionsByWeekId,
  fetchSessionById,
} from "../../lib/services/workoutService";
import {
  fetchStandaloneSessions,
  fetchSessionTemplateById,
} from "../../lib/services/sessionTemplateService";
import {
  fetchActiveAssignment,
  getWeekIdForDate,
} from "../../lib/services/programService";
import { getDayOfWeekFromDateStr } from "../../lib/utils/date";
import type { ProgramSessionData } from "../../lib/services/workoutService";
import { getDaysUntilNextPeriod } from "../../lib/utils/cycleUtils";
import type { CyclePhase } from "../../lib/utils/cycleUtils";
import { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "DayDetail">;

function DayDetailKostView({ date }: { date: string }) {
  return (
    <Screen scroll padded>
      <Section title="Kost" subtitle="Logga mat för denna dag">
        <Card borderRadius="$4">
          <Card.Content padding="$6">
            <AppText variant="body" muted center>
              Kostlogg kommer snart – du kommer kunna logga måltider och näring här.
            </AppText>
          </Card.Content>
        </Card>
      </Section>
    </Screen>
  );
}

function DayDetailÖvrigtContainer({
  date,
  clientId,
}: {
  date: string;
  clientId: string | null;
}) {
  if (!clientId) return null;
  return (
    <Screen scroll padded>
      <DayNotesSection
        clientId={clientId}
        date={date}
        category="övrigt"
        subtitle="T.ex. middag, läkarbesök, resa, träff med vänner"
      />
    </Screen>
  );
}

const PHASE_SHORT_TIPS: Record<Exclude<CyclePhase, null>, string> = {
  menstruation: "Vila och återhämta. Lyssna på kroppen.",
  follicular: "Bra fas för att bygga styrka och uthållighet.",
  ovulation: "Peak energi – passa på krävande pass.",
  luteal: "Fokus på återhämtning och mildare träning kan passa.",
};

function DayDetailCykelView({
  date,
  onCyclePress,
}: {
  date: string;
  onCyclePress: () => void;
}) {
  const { getPhaseForDate, latestPeriodStart, cycleLength } = useCycleContext();
  const d = new Date(date + "T12:00:00");
  const { phase, cycleDay, phaseLabel } = getPhaseForDate(d);
  const daysUntilNext = getDaysUntilNextPeriod(latestPeriodStart, cycleLength, d);
  const phaseTip = phase ? PHASE_SHORT_TIPS[phase] : null;

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Cykelinfo" subtitle={`${date} – information för denna dag`}>
          <Card borderRadius="$4">
            <Card.Content padding="$6">
              <YStack gap="$4">
                {phase ? (
                  <>
                    <YStack gap="$1">
                      <AppText variant="small" muted>
                        Fas
                      </AppText>
                      <AppText variant="h3">{phaseLabel}</AppText>
                    </YStack>
                    <YStack gap="$1">
                      <AppText variant="small" muted>
                        Cykeldag
                      </AppText>
                      <AppText variant="body" fontWeight="600">
                        Dag {cycleDay} i cykeln
                      </AppText>
                    </YStack>
                    {phaseTip ? (
                      <YStack gap="$1">
                        <AppText variant="small" muted>
                          Kort om fasen
                        </AppText>
                        <AppText variant="body">{phaseTip}</AppText>
                      </YStack>
                    ) : null}
                    {daysUntilNext !== null && daysUntilNext >= 0 && (
                      <YStack gap="$1">
                        <AppText variant="small" muted>
                          Nästa mens (beräknat)
                        </AppText>
                        <AppText variant="body">
                          {daysUntilNext === 0
                            ? "Idag"
                            : daysUntilNext === 1
                            ? "Imorgon"
                            : `Om ${daysUntilNext} dagar`}
                        </AppText>
                      </YStack>
                    )}
                  </>
                ) : (
                  <AppText variant="body" muted>
                    Logga din senaste mensstart i Cykel för att se fas och cykeldag för denna dag.
                  </AppText>
                )}
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        <AppButton variant="secondary" onPress={onCyclePress}>
          Öppna Cykel
        </AppButton>
      </YStack>
    </Screen>
  );
}

export function DayDetailScreen({ navigation, route }: Props) {
  const { client } = useAuth();
  const { date, mode } = route.params;
  const effectiveMode = mode ?? "träning";
  const [programSessions, setProgramSessions] = useState<ProgramSessionData[]>([]);
  const [standaloneSessions, setStandaloneSessions] = useState<Array<{ id: string; name: string; focus: string | null }>>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedIsStandalone, setSelectedIsStandalone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPlaneraIn, setShowPlaneraIn] = useState(false);

  const load = useCallback(async () => {
    if (!client?.id || effectiveMode !== "träning") return;
    setIsLoading(true);
    try {
      const [entries, assignment, standalone] = await Promise.all([
        getEntriesForRange(client.id, date, date),
        fetchActiveAssignment(client.id),
        fetchStandaloneSessions(),
      ]);

      let programSessionsForWeek: ProgramSessionData[] = [];
      if (assignment?.program_id && assignment?.start_date) {
        const weekId = await getWeekIdForDate(
          assignment.program_id,
          assignment.start_date,
          date
        );
        if (weekId) {
          programSessionsForWeek = await fetchSessionsByWeekId(weekId);
        }
      }

      const dbDayOfWeek = getDayOfWeekFromDateStr(date);
      const programDefault = programSessionsForWeek.find(
        (s) => s.day_of_week === dbDayOfWeek
      );

      const entry = entries[0];
      let plannedSession: ProgramSessionData | null = null;
      let plannedIsStandalone = false;

      if (entry?.program_session_id) {
        plannedSession = await fetchSessionById(entry.program_session_id);
        plannedIsStandalone = false;
      } else if (entry?.session_template_id) {
        const tmpl = await fetchSessionTemplateById(entry.session_template_id);
        plannedSession = tmpl
          ? { ...tmpl, day_of_week: 0, session_exercises: [] }
          : null;
        plannedIsStandalone = true;
      } else if (programDefault) {
        plannedSession = programDefault;
        plannedIsStandalone = false;
      }

      if (plannedSession) {
        setSelectedSessionId(plannedSession.id);
        setSelectedIsStandalone(plannedIsStandalone);
      } else {
        setSelectedSessionId(null);
        setSelectedIsStandalone(false);
      }
      setProgramSessions(programSessionsForWeek);
      setStandaloneSessions(standalone.map((s) => ({ id: s.id, name: s.name, focus: s.focus })));
    } finally {
      setIsLoading(false);
    }
  }, [client?.id, date, effectiveMode]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const handleSave = async () => {
    if (!client?.id) return;
    setIsSaving(true);
    await upsertEntry({
      client_id: client.id,
      date,
      program_session_id: selectedIsStandalone ? null : selectedSessionId ?? null,
      session_template_id: selectedIsStandalone ? selectedSessionId : null,
      note: null,
    });
    setIsSaving(false);
    setShowPlaneraIn(false);
    load();
  };

  const handleRemoveSession = async () => {
    setSelectedSessionId(null);
    setSelectedIsStandalone(false);
    if (!client?.id) return;
    const entries = await getEntriesForRange(client.id, date, date);
    const entry = entries[0];
    if (entry) {
      await upsertEntry({
        client_id: client.id,
        date,
        program_session_id: null,
        session_template_id: null,
        note: null,
      });
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Rensa planerat pass",
      "Vill du ta bort det planerade passet för denna dag?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Ta bort",
          style: "destructive",
          onPress: async () => {
            if (!client?.id) return;
            await deleteEntry(client.id, date);
            setSelectedSessionId(null);
            setSelectedIsStandalone(false);
          },
        },
      ]
    );
  };

  const programSessionsWithFlag = programSessions.map((s) => ({ ...s, isStandalone: false }));
  const standaloneWithFlag = standaloneSessions.map((s) => ({ ...s, isStandalone: true }));
  const allSessions = [...programSessionsWithFlag, ...standaloneWithFlag];
  const hasPass = !!selectedSessionId;
  const plannedSession = hasPass
    ? allSessions.find((s) => s.id === selectedSessionId && s.isStandalone === selectedIsStandalone)
    : null;

  type SessionWithFlag = (typeof allSessions)[number];

  if (effectiveMode === "cykel") {
    return (
      <DayDetailCykelView
        date={date}
        onCyclePress={() => navigation.navigate("Cycle")}
      />
    );
  }

  if (effectiveMode === "kost") {
    return <DayDetailKostView date={date} />;
  }

  if (effectiveMode === "övrigt") {
    return (
      <DayDetailÖvrigtContainer
        date={date}
        clientId={client?.id ?? null}
      />
    );
  }

  if (isLoading) return <LoadingScreen message="Laddar..." />;

  const renderSessionCard = (s: SessionWithFlag) => (
    <Card
      key={s.isStandalone ? `t-${s.id}` : s.id}
      pressable
      borderRadius="$4"
      backgroundColor={selectedSessionId === s.id && selectedIsStandalone === s.isStandalone ? "$surface3" : undefined}
      borderWidth={selectedSessionId === s.id && selectedIsStandalone === s.isStandalone ? 2 : 1}
      borderColor={selectedSessionId === s.id && selectedIsStandalone === s.isStandalone ? "$accent" : "$borderSoft"}
      onPress={() => {
        setSelectedSessionId(s.id);
        setSelectedIsStandalone(s.isStandalone);
      }}
    >
      <Card.Content padding="$5">
        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
          <AppText variant="h3" flex={1}>
            {s.name}
          </AppText>
          {s.focus && (
            <AppText variant="caption" muted>
              {s.focus}
            </AppText>
          )}
        </XStack>
      </Card.Content>
    </Card>
  );

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        {hasPass && plannedSession ? (
          /* Dagens pass – visa endast det bokade passet */
          <Section title="Dagens pass">
            <Card borderRadius="$4">
              <Card.Content padding="$6">
                <YStack gap="$4">
                  <AppText variant="h3">{plannedSession.name}</AppText>
                  {plannedSession.focus && (
                    <AppText variant="caption" muted>
                      {plannedSession.focus}
                    </AppText>
                  )}
                  <XStack gap="$3" flexWrap="wrap">
                    <AppButton
                      variant="primary"
                      size="sm"
                      onPress={() =>
                        navigation.navigate("WorkoutSession", {
                          sessionId: plannedSession.id,
                          isStandalone: plannedSession.isStandalone,
                        })
                      }
                    >
                      Starta pass
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onPress={() =>
                        navigation.navigate("WorkoutPreview", {
                          sessionId: plannedSession.id,
                          isStandalone: plannedSession.isStandalone,
                        })
                      }
                    >
                      Förhandsgranska
                    </AppButton>
                    <AppButton variant="ghost" size="sm" onPress={handleRemoveSession}>
                      Ta bort pass
                    </AppButton>
                  </XStack>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        ) : showPlaneraIn ? (
          /* Planera in – visa passlista */
          <Section title="Planera in ett pass" subtitle="Välj pass att boka in">
            {allSessions.length === 0 ? (
              <Card borderRadius="$4">
                <Card.Content padding="$6">
                  <AppText variant="body" muted center>
                    Du har inget aktivt program. Gå till Mina program eller Träna för att se tillgängliga pass.
                  </AppText>
                </Card.Content>
              </Card>
            ) : (
              <YStack gap="$3">
                {programSessionsWithFlag.length > 0 &&
                  programSessionsWithFlag.map(renderSessionCard)}
                {standaloneWithFlag.length > 0 &&
                  standaloneWithFlag.map(renderSessionCard)}
              </YStack>
            )}
            <YStack gap="$2" marginTop="$4">
              <AppButton
                variant="primary"
                onPress={handleSave}
                disabled={isSaving || !selectedSessionId}
              >
                Spara
              </AppButton>
              <AppButton variant="ghost" size="sm" onPress={() => setShowPlaneraIn(false)}>
                Avbryt
              </AppButton>
            </YStack>
          </Section>
        ) : (
          /* Inget pass – vila eller planera in */
          <Section title="Dagens pass">
            <Card borderRadius="$4">
              <Card.Content padding="$6">
                <YStack gap="$4">
                  <AppText variant="body" muted center>
                    Inget pass idag
                  </AppText>
                  <AppText variant="caption" muted center>
                    Vila eller planera in ett pass.
                  </AppText>
                  <YStack gap="$3">
                    <AppButton
                      variant="primary"
                      onPress={() => setShowPlaneraIn(true)}
                    >
                      Planera in ett pass
                    </AppButton>
                    <AppText variant="caption" muted center>
                      Eller ta en vilodag
                    </AppText>
                  </YStack>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        {client?.id && (
          <DayNotesSection
            clientId={client.id}
            date={date}
            category="träning"
            subtitle="Hur det kändes, vad du tränade, extra löpning..."
          />
        )}

        {hasPass && (
          <AppButton variant="ghost" size="sm" onPress={handleClearAll}>
            Rensa planerat pass
          </AppButton>
        )}
      </YStack>
    </Screen>
  );
}
