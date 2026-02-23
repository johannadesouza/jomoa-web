import React from "react";
import { YStack } from "tamagui";

import {
  Screen,
  Section,
  Card,
  AppText,
  LoadingScreen,
  EmptyState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import {
  PHASE_SECTION_LABELS,
  type PhaseProfile,
} from "../../lib/data/phaseProfiles";
import { PHASE_KNOWLEDGE_COPY } from "../../lib/data/phaseKnowledgeCopy";
import { Text } from "tamagui";

function PhaseProfileSection({
  profile,
}: {
  profile: PhaseProfile;
}) {
  const sections: {
    key: keyof typeof PHASE_SECTION_LABELS;
    items: string[];
  }[] = [
    { key: "physiology", items: profile.physiology },
    { key: "commonPatterns", items: profile.commonPatterns },
    { key: "trainingFocus", items: profile.trainingFocus },
    { key: "recoveryFocus", items: profile.recoveryFocus },
    { key: "nutritionFocus", items: profile.nutritionFocus },
    { key: "socialEnergyPattern", items: profile.socialEnergyPattern },
    { key: "cautionFlags", items: profile.cautionFlags },
  ];

  return (
    <YStack gap="$6">
      {sections.map(
        ({ key, items }) =>
          items.length > 0 && (
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
          )
      )}
    </YStack>
  );
}

export function CycleInsightsScreen() {
  const { client } = useAuth();
  const { phase, phaseLabel, isLoading, latestPeriodStart } = useCycle(
    client?.id
  );
  const profile = phase ? getPhaseProfile(phase) : null;

  if (isLoading) return <LoadingScreen />;

  if (!latestPeriodStart) {
    return (
      <Screen padded>
        <EmptyState
          icon={<Text fontSize="$xxxl">🌙</Text>}
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
        <Section title={PHASE_KNOWLEDGE_COPY.cycleInsightsTitle}>
          <AppText variant="body" muted>
            {PHASE_KNOWLEDGE_COPY.cycleInsightsSubtitle}
          </AppText>
        </Section>

        <Section title={PHASE_KNOWLEDGE_COPY.currentPhase}>
          <Card>
            <Card.Content>
              <AppText variant="h3" color="$accent">
                {phaseLabel}
              </AppText>
            </Card.Content>
          </Card>
        </Section>

        <PhaseProfileSection profile={profile} />
      </YStack>
    </Screen>
  );
}
