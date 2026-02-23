/**
 * JourneyScreen – Insikter först, logga som segment
 * Hormona-inspirerad UX: Hur mår du idag?, Symtomlindring, Min prognos, Vad kan jag göra?
 */
import React, { useState } from "react";
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
  AppIcon,
  LoadingScreen,
} from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { SegmentBar } from "../../components/layout/SegmentBar";
import { QuickLogStrip } from "../../components/log/QuickLogStrip";
import { SymptomReliefCards } from "../insights/SymptomReliefCards";
import { SymptomReliefModal } from "../insights/SymptomReliefModal";
import { CycleHeroCard } from "../insights/CycleHeroCard";
import { HeroInsightCard } from "../insights/HeroInsightCard";
import { InsightCategoryStrip } from "../insights/InsightCategoryStrip";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { useInsights } from "../../lib/hooks/useInsights";
import { usePhasePerformance } from "../../lib/hooks/usePhasePerformance";
import { useDailyPhaseInsight } from "../../lib/hooks/useDailyPhaseInsight";
import { useDailyInsight } from "../../lib/hooks/useDailyInsight";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { useReadinessHistory } from "../../lib/hooks/useReadinessHistory";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import { RootStackParamList } from "../../navigation/RootNavigator";
import type { SymptomId } from "../../lib/data/symptomReliefData";
import { AwardsSection } from "../insights/AwardsSection";
import { GoalsSection } from "../insights/GoalsSection";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type JourneySegment = "idag" | "historik" | "logga";

const SEGMENTS: { id: JourneySegment; label: string }[] = [
  { id: "idag", label: "Idag" },
  { id: "historik", label: "Historik" },
  { id: "logga", label: "Logga" },
];

const SECONDARY_ACTIONS = [
  { iconName: "moon-outline" as const, label: "Period & symtom", desc: "Mensstart, kramper", route: "Cycle" as const },
  { iconName: "body-outline" as const, label: "Mätningar", desc: "Vikt och kroppsmått", route: "Measurements" as const },
] as const;

export function JourneyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [segment, setSegment] = useState<JourneySegment>("idag");
  const [symptomModal, setSymptomModal] = useState<{ visible: boolean; symptomId: SymptomId | null }>({
    visible: false,
    symptomId: null,
  });
  const { client } = useAuth();
  const {
    phase,
    phaseLabel,
    cycleDay,
    cycleLength,
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

  useFocusEffect(
    React.useCallback(() => {
      refetchCycle();
      refetchInsight();
      refetchReadiness();
      refetchReadinessHistory();
    }, [refetchCycle, refetchInsight, refetchReadiness, refetchReadinessHistory])
  );

  if (isLoading) return <LoadingScreen message="Laddar..." />;

  const statCards = [
    { label: "Total volym", value: stats ? String(stats.totalVolume) : "0", unit: "kg", iconName: "bar-chart-outline" as const },
    { label: "Pass denna månad", value: stats ? String(stats.sessionsThisMonth) : "0", unit: "", iconName: "barbell-outline" as const },
    { label: "Streak", value: stats ? String(stats.streak) : "0", unit: "dagar", iconName: "flame-outline" as const },
  ];
  const hasData = stats && (stats.sessionsThisMonth > 0 || stats.streak > 0);

  return (
    <Screen scroll padded>
      <TopBar
        title="Insikter"
        subtitle="Din resa – rekommendationer och statistik"
        rightIcons={["profile", "settings"]}
        onProfile={() => navigation.navigate("Profile")}
        onSettings={() => navigation.navigate("Settings")}
      />
      <YStack gap="$4" paddingTop="$4">
        <CycleHeroCard
          phase={phase ?? null}
          cycleDay={cycleDay}
          cycleLength={cycleLength}
          daysUntilNextPeriod={daysUntilNextPeriod ?? null}
          onPress={() => navigation.navigate("Cycle")}
        />

        <SegmentBar segments={SEGMENTS} activeId={segment} onSelect={setSegment} />

        {segment === "idag" && (
          <>
            <Section title="Dagens insikt" subtitle="Vad kan jag förvänta mig och göra?">
              <HeroInsightCard
                phase={phase ?? null}
                insight={insight}
                trainingBullets={phaseInsight?.bullets}
                onPress={() => navigation.navigate("CycleInsights")}
              />
            </Section>

            <Section title="Hur mår du idag?" subtitle="Klicka för symtomlindring eller logga">
              <QuickLogStrip
                onLogOther={() => setSegment("logga")}
                onSymptomPress={(id) => setSymptomModal({ visible: true, symptomId: id })}
              />
            </Section>

            <SymptomReliefModal
              visible={symptomModal.visible}
              symptomId={symptomModal.symptomId}
              onClose={() => setSymptomModal({ visible: false, symptomId: null })}
              onLogReadiness={() => navigation.navigate("Readiness")}
            />

            <Section
              title="Symtomlindring"
              subtitle={
                readiness
                  ? "Rekommendationer baserat på hur du mår"
                  : "Logga hur du mår för att låsa upp tips"
              }
            >
              <SymptomReliefCards
                phase={phase ?? null}
                lowEnergy={(readiness?.energy_level ?? 10) <= 4}
                poorSleep={(readiness?.sleep_quality ?? 10) <= 4}
                highStress={(readiness?.stress_level ?? 0) >= 7}
                onPress={() => navigation.navigate("CycleInsights")}
              />
            </Section>

            <Section title="Utforska" subtitle="Träning, kost och välmående">
              <InsightCategoryStrip
                onSelectCategory={(id) => {
                  if (id === "näring") (navigation.getParent() as { navigate: (n: string) => void })?.navigate("NutritionTab");
                  else if (id === "fysiskt") navigation.navigate("CycleInsights");
                  else navigation.navigate("Readiness");
                }}
              />
            </Section>
          </>
        )}

        {segment === "historik" && (
          <>
            <AwardsSection clientId={client?.id} />
            <GoalsSection clientId={client?.id} />
            <Section title="Din träningsstatistik" subtitle="Baserat på dina loggade pass">
              <XStack flexWrap="wrap" gap="$4">
                {statCards.map((s, i) => (
                  <Card key={i} flex={1} minWidth="45%">
                    <Card.Content>
                      <YStack alignItems="center" gap="$3">
                        <YStack width={40} height={40} borderRadius="$full" backgroundColor="$surface3" alignItems="center" justifyContent="center">
                          <AppIcon name={s.iconName} size={20} />
                        </YStack>
                        <XStack alignItems="baseline" gap="$1">
                          <Text fontSize="$xxl" fontWeight="700" color="$accent">{s.value}</Text>
                          {s.unit ? <Text fontSize="$sm" color="$textSecondary">{s.unit}</Text> : null}
                        </XStack>
                        <AppText variant="caption">{s.label}</AppText>
                      </YStack>
                    </Card.Content>
                  </Card>
                ))}
              </XStack>
            </Section>
            <Section title="Träningshistorik" subtitle="Se kalendern för dina pass">
              <Card pressable onPress={() => navigation.navigate("Calendar")}>
                <Card.Content>
                  <YStack alignItems="center" paddingVertical="$4" gap="$3">
                    <AppIcon name="calendar-outline" size={40} />
                    <AppText variant="body" muted center>
                      {hasData ? "Se dina loggade pass i kalendern." : "Logga pass under Träna – historiken visas i kalendern."}
                    </AppText>
                    <AppText variant="caption" color="$accent">Öppna Kalender →</AppText>
                  </YStack>
                </Card.Content>
              </Card>
            </Section>
            {phaseProfile && (
              <Card pressable onPress={() => navigation.navigate("CycleInsights")}>
                <Card.Content>
                  <YStack alignItems="center" gap="$2">
                    <AppIcon name="moon-outline" size={32} />
                    <AppText variant="body" fontWeight="600">Cykelinsikter</AppText>
                    <AppText variant="small" muted center>Träning, kost och återhämtning per fas</AppText>
                    <AppText variant="caption" color="$accent">Läs mer →</AppText>
                  </YStack>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {segment === "logga" && (
          <>
            <Section title="Hur mår du idag?" subtitle="Sömn, stress, energi – fyll i för rekommendationer">
              {readiness ? (
                <Card>
                  <Card.Content>
                    <YStack alignItems="center" gap="$3" paddingVertical="$4">
                      <AppIcon name="checkmark-circle-outline" size={40} />
                      <AppText variant="body" center>Du har loggat hur du mår idag</AppText>
                      <AppButton variant="secondary" size="sm" onPress={() => navigation.navigate("Readiness")}>
                        Uppdatera
                      </AppButton>
                    </YStack>
                  </Card.Content>
                </Card>
              ) : (
                <Card pressable onPress={() => navigation.navigate("Readiness")}>
                  <Card.Content>
                    <YStack alignItems="center" gap="$4" paddingVertical="$4">
                      <AppIcon name="heart-outline" size={48} />
                      <YStack alignItems="center" gap="$1">
                        <AppText variant="h3">Hur mår du idag?</AppText>
                        <AppText variant="small" muted center>Sömn, stress, energi – få rekommendationer</AppText>
                      </YStack>
                      <AppButton variant="primary" onPress={() => navigation.navigate("Readiness")}>
                        Logga hur du mår
                      </AppButton>
                    </YStack>
                  </Card.Content>
                </Card>
              )}
            </Section>
            <Section title="Mer att logga" subtitle="Cykel och mätningar">
              <XStack flexWrap="wrap" gap="$3">
                {SECONDARY_ACTIONS.map((action) => (
                  <Card key={action.label} flex={1} minWidth="45%" pressable onPress={() => navigation.navigate(action.route)}>
                    <Card.Content>
                      <YStack alignItems="center" gap="$2" paddingVertical="$4">
                        <AppIcon name={action.iconName} size={32} />
                        <AppText variant="body" fontWeight="600">{action.label}</AppText>
                        <AppText variant="caption" muted center>{action.desc}</AppText>
                      </YStack>
                    </Card.Content>
                  </Card>
                ))}
              </XStack>
            </Section>
          </>
        )}

      </YStack>
    </Screen>
  );
}
