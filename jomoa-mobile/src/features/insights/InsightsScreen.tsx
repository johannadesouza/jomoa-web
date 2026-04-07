/**
 * Insikter – output/analys. Så här presterar du.
 * Cykel-koppling: visa fas, mens-countdown, fasbaserade insikter.
 */
import React, { useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppIcon,
  DataScreen,
} from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { SegmentBar } from "../../components/layout/SegmentBar";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { useInsights } from "../../lib/hooks/useInsights";
import { usePhasePerformance } from "../../lib/hooks/usePhasePerformance";
import { useDailyPhaseInsight } from "../../lib/hooks/useDailyPhaseInsight";
import { useDailyInsight } from "../../lib/hooks/useDailyInsight";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { useReadinessHistory } from "../../lib/hooks/useReadinessHistory";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import { getLocalDateString } from "../../lib/utils/date";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { AwardsSection } from "./AwardsSection";
import { GoalsSection } from "./GoalsSection";
import { PhaseIndicatorBar } from "../../components/cycle/PhaseIndicatorBar";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type InsightsSegment = "idag" | "statistik" | "cykel" | "historik";

const SEGMENTS: { id: InsightsSegment; label: string }[] = [
  { id: "idag", label: "Idag" },
  { id: "statistik", label: "Statistik" },
  { id: "cykel", label: "Cykel" },
  { id: "historik", label: "Historik" },
];

export function InsightsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [segment, setSegment] = useState<InsightsSegment>("idag");
  const prevRefetchRef = useRef<{
    refetchCycle?: unknown;
    refetchInsight?: unknown;
    refetchReadiness?: unknown;
    refetchReadinessHistory?: unknown;
  } | null>(null);
  const { client } = useAuth();
  const {
    phase,
    phaseLabel,
    cycleDay,
    daysUntilNextPeriod,
    refetch: refetchCycle,
  } = useCycle(client?.id);
  const { stats, isLoading } = useInsights(client?.id);
  const { comparison: phaseComparison } = usePhasePerformance(client?.id);
  const phaseInsight = useDailyPhaseInsight(client?.id);
  const phaseProfile = phase ? getPhaseProfile(phase) : null;
  const { insight, refetch: refetchInsight } = useDailyInsight(client?.id);
  const { readiness, refetch: refetchReadiness } = useReadiness(client?.id);
  const { refetch: refetchReadinessHistory } = useReadinessHistory(client?.id, 7);

  // #region agent log
  {
    const prev = prevRefetchRef.current;
    const changed = {
      refetchCycle: prev ? prev.refetchCycle !== refetchCycle : null,
      refetchInsight: prev ? prev.refetchInsight !== refetchInsight : null,
      refetchReadiness: prev ? prev.refetchReadiness !== refetchReadiness : null,
      refetchReadinessHistory: prev ? prev.refetchReadinessHistory !== refetchReadinessHistory : null,
    };
    prevRefetchRef.current = { refetchCycle, refetchInsight, refetchReadiness, refetchReadinessHistory };
    if (changed.refetchCycle || changed.refetchInsight || changed.refetchReadiness || changed.refetchReadinessHistory) {
      fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H8',location:'InsightsScreen.tsx:render',message:'refetch identity changed',data:{clientIdPresent:!!client?.id,changed},timestamp:Date.now()})}).catch(()=>{});
    }
  }
  // #endregion

  useFocusEffect(
    React.useCallback(() => {
      // #region agent log
      fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H8',location:'InsightsScreen.tsx:useFocusEffect',message:'focus effect runs',data:{clientIdPresent:!!client?.id},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      refetchCycle();
      refetchInsight();
      refetchReadiness();
      refetchReadinessHistory();
    }, [refetchCycle, refetchInsight, refetchReadiness, refetchReadinessHistory])
  );

  const statCards = [
    {
      label: "Total volym",
      value: stats ? String(stats.totalVolume) : "0",
      unit: "kg",
      iconName: "bar-chart-outline" as const,
    },
    {
      label: "Pass denna månad",
      value: stats ? String(stats.sessionsThisMonth) : "0",
      unit: "",
      iconName: "barbell-outline" as const,
    },
    {
      label: "Streak",
      value: stats ? String(stats.streak) : "0",
      unit: "dagar",
      iconName: "flame-outline" as const,
    },
  ];

  const hasData = stats && (stats.sessionsThisMonth > 0 || stats.streak > 0);
  const handleSettings = () => navigation.navigate("Settings");

  return (
    <DataScreen loading={isLoading} loadingMessage="Laddar insikter...">
      <Screen scroll padded>
      <TopBar
        title="Insikter"
        subtitle="Baserat på det du loggat"
        rightIcons={["settings"]}
        onSettings={handleSettings}
      />
      <YStack gap="$4" paddingTop="$4">
        {phase && (
          <Card
            pressable
            onPress={() => navigation.navigate("Cycle")}
            paddingVertical="$5"
            paddingHorizontal="$5"
          >
            <Card.Content>
              <YStack gap="$3">
                <AppText variant="caption" muted>
                  Din cykelfas
                </AppText>
                <PhaseIndicatorBar activePhase={phase} />
                <XStack flexWrap="wrap" gap="$2" alignItems="center">
                  <Text fontSize="$5" fontWeight="700" color="$accent">
                    {phaseLabel}
                  </Text>
                </XStack>
                {daysUntilNextPeriod != null && (
                  <YStack alignItems="flex-start" gap="$1">
                    <Text
                      fontSize="$6"
                      fontWeight="700"
                      color="$accent"
                      lineHeight="$5"
                    >
                      {daysUntilNextPeriod === 0
                        ? "Mens idag"
                        : `Mens om ${daysUntilNextPeriod} ${daysUntilNextPeriod === 1 ? "dag" : "dagar"}`}
                    </Text>
                    <AppText variant="small" muted>
                      Cykeldag {cycleDay} · Tryck för mer →
                    </AppText>
                  </YStack>
                )}
              </YStack>
            </Card.Content>
          </Card>
        )}

        <SegmentBar segments={SEGMENTS} activeId={segment} onSelect={setSegment} />

        {segment === "idag" && (
          <>
            {insight && (
              <Section title="Rekommendation" subtitle="Baserat på din fas och readiness idag">
                <Card>
                  <Card.Content>
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
                  </Card.Content>
                </Card>
              </Section>
            )}
            {!insight && !readiness && (
              <Section title="Dagens rekommendation" subtitle="Baserat på cykel och hur du mår">
                <Card
                  pressable
                  onPress={() => navigation.navigate("Main", { screen: "LogTab" })}
                >
                  <Card.Content>
                    <YStack alignItems="center" gap="$3" paddingVertical="$2">
                      <Text fontSize="$xxl">📋</Text>
                      <AppText variant="body" center>
                        Logga hur du mår under fliken Logga för att få dagens rekommendation
                      </AppText>
                      <AppText variant="caption" color="$accent">
                        Gå till Logga →
                      </AppText>
                    </YStack>
                  </Card.Content>
                </Card>
              </Section>
            )}
            {readiness && !insight && (
              <Section title="Idag" subtitle="Du har loggat för idag">
                <Card>
                  <Card.Content>
                    <YStack alignItems="center" gap="$2">
                      <Text fontSize="$xxl">✓</Text>
                      <AppText variant="body" center>
                        Du har loggat hur du mår idag
                      </AppText>
                      <AppText variant="small" muted center>
                        Sömn, stress och energi – bra! Rekommendationer visas när vi har tillräckligt med data.
                      </AppText>
                    </YStack>
                  </Card.Content>
                </Card>
              </Section>
            )}
          </>
        )}

        {segment === "statistik" && (
          <>
            <AwardsSection clientId={client?.id} />
            <GoalsSection clientId={client?.id} />
            <Section
              title="Din träningsstatistik"
              subtitle="Baserat på dina loggade pass"
            >
              <XStack flexWrap="wrap" gap="$4">
                {statCards.map((s, i) => (
                  <Card key={i} flex={1} minWidth="45%">
                    <Card.Content>
                      <YStack alignItems="center" gap="$3">
                        <YStack
                          width={40}
                          height={40}
                          borderRadius="$full"
                          backgroundColor="$surface3"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <AppIcon name={s.iconName} size={20} />
                        </YStack>
                        <XStack alignItems="baseline" gap="$1">
                          <Text fontSize="$xxl" fontWeight="700" color="$accent">
                            {s.value}
                          </Text>
                          {s.unit ? (
                            <Text fontSize="$sm" color="$textSecondary">
                              {s.unit}
                            </Text>
                          ) : null}
                        </XStack>
                        <AppText variant="caption">{s.label}</AppText>
                      </YStack>
                    </Card.Content>
                  </Card>
                ))}
              </XStack>
            </Section>
          </>
        )}

        {segment === "cykel" && (
          <>
            {phaseProfile ? (
              <>
                {(phaseInsight?.headline || (phaseInsight?.bullets?.length ?? 0) > 0) ? (
                  <Section title="Rekommendation idag">
                    <Card>
                      <Card.Content>
                        <YStack gap="$3">
                          {phaseInsight?.headline && (
                            <AppText variant="h3">{phaseInsight.headline}</AppText>
                          )}
                          {phaseInsight?.bullets?.map((b, i) => (
                            <XStack key={i} gap="$2">
                              <AppText variant="body" color="$accent">•</AppText>
                              <AppText variant="body" flex={1}>{b}</AppText>
                            </XStack>
                          ))}
                        </YStack>
                      </Card.Content>
                    </Card>
                  </Section>
                ) : null}

                <Section title="Träning" subtitle={`${phaseLabel} – vad som fungerar bra`}>
                  <Card>
                    <Card.Content>
                      <YStack gap="$2">
                        {phaseProfile.trainingFocus.map((t: string, i: number) => (
                          <AppText key={i} variant="body" muted>
                            • {t}
                          </AppText>
                        ))}
                      </YStack>
                    </Card.Content>
                  </Card>
                </Section>

                <Section title="Återhämtning">
                  <Card>
                    <Card.Content>
                      <YStack gap="$2">
                        {phaseProfile.recoveryFocus.map((r: string, i: number) => (
                          <AppText key={i} variant="body" muted>
                            • {r}
                          </AppText>
                        ))}
                      </YStack>
                    </Card.Content>
                  </Card>
                </Section>

                <Section title="Nutrition">
                  <Card>
                    <Card.Content>
                      <YStack gap="$2">
                        {phaseProfile.nutritionFocus.map((n: string, i: number) => (
                          <AppText key={i} variant="body" muted>
                            • {n}
                          </AppText>
                        ))}
                      </YStack>
                    </Card.Content>
                  </Card>
                </Section>

                {phaseComparison && (
                  <Section title="Din prestation per fas">
                    <Card
                      pressable
                      onPress={() => navigation.navigate("CycleInsights")}
                    >
                      <Card.Content>
                        <AppText variant="h3">{phaseComparison.insight}</AppText>
                        <AppText variant="small" muted>
                          Baserat på träningsloggar senaste 90 dagarna.
                        </AppText>
                      </Card.Content>
                    </Card>
                  </Section>
                )}

                <Section title="Symtomtrender" subtitle="Förutse symtom över tid">
                  <Card
                    pressable
                    onPress={() => navigation.navigate("Cycle")}
                  >
                    <Card.Content>
                      <YStack alignItems="center" gap="$3" paddingVertical="$2">
                        <Text fontSize="$xxl">📈</Text>
                        <AppText variant="body" muted center>
                          Logga symtom för att se trender över tid
                        </AppText>
                        <AppText variant="caption" color="$accent">
                          Logga symptom i Cykel →
                        </AppText>
                      </YStack>
                    </Card.Content>
                  </Card>
                </Section>

                <Card
                  pressable
                  onPress={() => navigation.navigate("CycleInsights")}
                >
                  <Card.Content>
                    <AppText variant="small" color="$accent">
                      Läs mer om alla fyra faser →
                    </AppText>
                  </Card.Content>
                </Card>
              </>
            ) : (
              <Section title="Cykelinsikter">
                <Card
                  pressable
                  onPress={() => navigation.navigate("Cycle")}
                >
                  <Card.Content>
                    <YStack alignItems="center" gap="$3" paddingVertical="$4">
                      <Text fontSize="$xxl">🌙</Text>
                      <AppText variant="body" muted center>
                        Logga period för att få tips och råd anpassade efter din cykelfas.
                      </AppText>
                      <AppText variant="caption" color="$accent">
                        Logga period →
                      </AppText>
                    </YStack>
                  </Card.Content>
                </Card>
              </Section>
            )}
          </>
        )}

        {segment === "historik" && (
          <Section
            title="Träningshistorik"
            subtitle="Se kalendern för att bläddra bland dina pass"
          >
            <Card
              pressable
              onPress={() => navigation.navigate("Calendar")}
            >
              <Card.Content>
                <YStack alignItems="center" paddingVertical="$6" gap="$3">
                  <Text fontSize="$xxxl">📅</Text>
                  <AppText variant="body" muted center>
                    {hasData
                      ? "Se dina loggade pass i kalendern."
                      : "Logga pass under Träna – historiken visas i kalendern."}
                  </AppText>
                  <AppText variant="caption" color="$accent">
                    Öppna Kalender →
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}
      </YStack>
    </Screen>
    </DataScreen>
  );
}
