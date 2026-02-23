import React, { useState, useEffect } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { YStack, XStack } from "tamagui";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppIcon,
  LoadingScreen,
  EmptyState,
} from "../../shared/ui";
import { SegmentBar } from "../../components/layout/SegmentBar";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import {
  PHASE_SECTION_LABELS,
  type PhaseProfile,
} from "../../lib/data/phaseProfiles";
import { PHASE_KNOWLEDGE_COPY } from "../../lib/data/phaseKnowledgeCopy";
import { RootStackParamList } from "../../navigation/RootNavigator";
import type { CycleCategoryId } from "../../components/cycle/CycleCategoryStrip";
import { PhaseIndicatorBar } from "../../components/cycle/PhaseIndicatorBar";

type CycleInsightsRoute = RouteProp<RootStackParamList, "CycleInsights">;

const SEGMENTS: { id: CycleCategoryId; label: string }[] = [
  { id: "alla", label: "Alla" },
  { id: "hormoner", label: "Hormoner" },
  { id: "traning", label: "Träning" },
  { id: "kost", label: "Kost" },
  { id: "sex", label: "Sex" },
  { id: "livsstil", label: "Livsstil" },
];

const SEGMENT_TO_SECTIONS: Record<
  Exclude<CycleCategoryId, "alla">,
  (keyof PhaseProfile)[]
> = {
  hormoner: ["physiology", "commonPatterns"],
  traning: ["trainingFocus", "recoveryFocus"],
  kost: ["nutritionFocus"],
  sex: ["libidoPattern", "enjoymentFocus"],
  livsstil: ["lifestyleTips", "socialEnergyPattern"],
};

function PhaseProfileSection({
  profile,
  segment,
}: {
  profile: PhaseProfile;
  segment: CycleCategoryId;
}) {
  const allSections: {
    key: keyof PhaseProfile;
    items: string[];
  }[] = [
    { key: "physiology", items: profile.physiology },
    { key: "commonPatterns", items: profile.commonPatterns },
    { key: "trainingFocus", items: profile.trainingFocus },
    { key: "recoveryFocus", items: profile.recoveryFocus },
    { key: "nutritionFocus", items: profile.nutritionFocus },
    { key: "libidoPattern", items: profile.libidoPattern },
    { key: "enjoymentFocus", items: profile.enjoymentFocus },
    { key: "lifestyleTips", items: profile.lifestyleTips },
    { key: "socialEnergyPattern", items: profile.socialEnergyPattern },
    { key: "cautionFlags", items: profile.cautionFlags },
  ];

  const filtered =
    segment === "alla"
      ? allSections
      : allSections.filter((s) =>
          (SEGMENT_TO_SECTIONS[segment] as (keyof PhaseProfile)[]).includes(s.key)
        );

  const contentSections = filtered.filter((s) => s.items.length > 0);
  const showCautionFlagsSeparately =
    profile.cautionFlags.length > 0 && segment !== "alla";

  return (
    <YStack gap="$6">
      {contentSections.map(({ key, items }) => (
        <Section key={key} title={PHASE_SECTION_LABELS[key]}>
          <Card>
            <Card.Content>
              <YStack gap="$2">
                {items.map((item, i) => (
                  <AppText key={i} variant="small" muted>
                    • {item}
                  </AppText>
                ))}
              </YStack>
            </Card.Content>
          </Card>
        </Section>
      ))}

      {contentSections.length === 0 && (
        <Card>
          <Card.Content>
            <YStack alignItems="center" gap="$3" paddingVertical="$4">
              <AppIcon name="information-circle-outline" size={32} />
              <AppText variant="small" muted center>
                Ingen specifik info för detta ämne. Prova "Alla" för hela översikten.
              </AppText>
            </YStack>
          </Card.Content>
        </Card>
      )}

      {showCautionFlagsSeparately && (
        <Section title={PHASE_SECTION_LABELS.cautionFlags}>
          <Card>
            <Card.Content>
              <YStack gap="$2">
                {profile.cautionFlags.map((item, i) => (
                  <AppText key={i} variant="small" muted>
                    • {item}
                  </AppText>
                ))}
              </YStack>
            </Card.Content>
          </Card>
        </Section>
      )}
    </YStack>
  );
}

export function CycleInsightsScreen() {
  const route = useRoute<CycleInsightsRoute>();
  const initialSegment = (route.params?.initialSegment ?? "alla") as CycleCategoryId;
  const [segment, setSegment] = useState<CycleCategoryId>(initialSegment);

  useEffect(() => {
    setSegment(initialSegment);
  }, [initialSegment]);

  const { client } = useAuth();
  const { phase, phaseLabel, isLoading, latestPeriodStart } = useCycle(client?.id);
  const profile = phase ? getPhaseProfile(phase) : null;

  if (isLoading) return <LoadingScreen />;

  if (!latestPeriodStart) {
    return (
      <Screen padded>
        <EmptyState
          iconName="moon-outline"
          title={PHASE_KNOWLEDGE_COPY.noPhaseData}
        />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen padded>
        <Section title={PHASE_KNOWLEDGE_COPY.cycleInsightsTitle}>
          <Card>
            <Card.Content>
              <AppText variant="body" muted>
                {PHASE_KNOWLEDGE_COPY.noPhaseData}
              </AppText>
            </Card.Content>
          </Card>
        </Section>
      </Screen>
    );
  }

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section
          title={PHASE_KNOWLEDGE_COPY.cycleInsightsTitle}
          subtitle={PHASE_KNOWLEDGE_COPY.cycleInsightsSubtitle}
        />

        <Section title={PHASE_KNOWLEDGE_COPY.currentPhase}>
          <Card>
            <Card.Content>
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <AppText variant="h3" color="$accent">
                    {phaseLabel}
                  </AppText>
                  {phase && <PhaseIndicatorBar activePhase={phase} />}
                </XStack>
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        <SegmentBar
          segments={SEGMENTS}
          activeId={segment}
          onSelect={setSegment}
          scrollable
        />

        <PhaseProfileSection profile={profile} segment={segment} />
      </YStack>
    </Screen>
  );
}
