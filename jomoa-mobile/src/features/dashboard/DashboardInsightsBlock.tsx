/**
 * Dashboard "Insikter" – readiness-insight, dagens insight, fas-insight.
 */
import React from "react";
import { YStack, XStack } from "tamagui";
import { Section, Card, AppText, InsightCard } from "../../shared/ui";
import { PHASE_KNOWLEDGE_COPY } from "../../lib/data/phaseKnowledgeCopy";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import type { DailyInsight } from "../../lib/services/insightService";
import type { DailyPhaseInsight } from "../../lib/services/phaseKnowledgeService";
import type { ReadinessRecord } from "../../lib/services/readinessService";
import type { ReadinessInsight } from "../../lib/repos/contentRepo/cycleContent";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

export interface DashboardInsightsBlockProps {
  sectionTitle?: string;
  insight: DailyInsight | null;
  phase: CyclePhase;
  phaseInsight: DailyPhaseInsight | null;
  readinessInsight: ReadinessInsight | null;
  readiness: ReadinessRecord | null;
  onNavigateReadiness: () => void;
  onNavigateCycleInsights: () => void;
}

export function DashboardInsightsBlock({
  sectionTitle = "Insikter",
  insight,
  phase,
  phaseInsight,
  readinessInsight,
  readiness,
  onNavigateReadiness,
  onNavigateCycleInsights,
}: DashboardInsightsBlockProps) {
  const hasAny = insight || (phase && phaseInsight) || readinessInsight;
  if (!hasAny) return null;

  return (
    <Section title={sectionTitle}>
      {readinessInsight && (
        <Card pressable onPress={onNavigateReadiness}>
          <Card.Content>
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <AppText variant="caption" muted>
                  {readiness?.readiness_score != null ? `Readiness ${readiness.readiness_score}` : "Readiness"}
                </AppText>
              </XStack>
              <AppText variant="h3">{readinessInsight.title}</AppText>
              <AppText variant="small" muted>{readinessInsight.body}</AppText>
              {readinessInsight.suggestion && (
                <AppText variant="caption" color="$accent" fontWeight="600">
                  → {readinessInsight.suggestion}
                </AppText>
              )}
            </YStack>
          </Card.Content>
        </Card>
      )}
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
          iconName="moon-outline"
          headline={phaseInsight.headline}
          bullets={phaseInsight.bullets}
          footer={PHASE_KNOWLEDGE_COPY.homeTapForMore(getPhaseLabel(phaseInsight.phase ?? null))}
          onPress={onNavigateCycleInsights}
        />
      )}
    </Section>
  );
}
