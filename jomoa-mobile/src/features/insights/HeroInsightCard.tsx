/**
 * HeroInsightCard – One prominent "dagens insikt" card
 * Clickable chips for "Vad kan jag förvänta mig?" and "Vad kan jag göra?" → pop-ups
 */
import React, { useState } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Card, AppText } from "../../shared/ui";
import { InsightDetailModal, type InsightDetailType } from "./InsightDetailModal";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import type { CyclePhase } from "../../lib/utils/cycleUtils";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

interface DailyInsight {
  insight_title?: string | null;
  insight_body?: string | null;
  actions?: string[] | null;
}

interface HeroInsightCardProps {
  phase: CyclePhase | null;
  insight?: DailyInsight | null;
  trainingBullets?: string[];
  onPress?: () => void;
}

export function HeroInsightCard({
  phase,
  insight,
  trainingBullets = [],
  onPress,
}: HeroInsightCardProps) {
  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    type: "expect" | "do";
    title: string;
    items: string[];
  }>({ visible: false, type: "expect" as const, title: "", items: [] });
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const profile = phase ? getPhaseProfile(phase) : null;

  const expectText =
    profile?.commonPatterns?.[0] ?? profile?.physiology?.[0]
      ?? "Logga readiness och period för personliga rekommendationer.";

  const expectItems = [
    ...(profile?.commonPatterns ?? []),
    ...(profile?.physiology ?? []),
  ].filter(Boolean).slice(0, 4);

  const doItems: string[] = [];
  if (Array.isArray(insight?.actions) && insight.actions.length > 0) {
    doItems.push(...insight.actions);
  }
  if (trainingBullets.length > 0) {
    doItems.push(...trainingBullets);
  } else if (profile?.trainingFocus?.length) {
    doItems.push(...profile.trainingFocus.slice(0, 2));
  }
  if (profile?.nutritionFocus?.length && doItems.length < 4) {
    doItems.push(profile.nutritionFocus[0]);
  }
  const uniqueDo = [...new Set(doItems)].slice(0, 5);

  const headline = insight?.insight_title ?? profile?.trainingFocus?.[0] ?? "Dagens rekommendation";

  const openExpectModal = () =>
    setDetailModal({
      visible: true,
      type: "expect",
      title: "Vad du kan förvänta dig idag",
      items: expectItems.length > 0 ? expectItems : [expectText],
    });
  const openDoModal = () =>
    setDetailModal({
      visible: true,
      type: "do",
      title: "Konkreta steg",
      items: uniqueDo.length > 0 ? uniqueDo : (insight?.insight_body ? [insight.insight_body] : []),
    });

  return (
    <>
    <Card>
      <Card.Content>
        <YStack gap="$4">
          <Pressable onPress={onPress} style={{ alignSelf: "flex-start" }}>
            <AppText variant="h3" color="$accent">
              {headline}
            </AppText>
          </Pressable>

          <Pressable
            onPress={openExpectModal}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              backgroundColor: colors.surface3,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderSoft,
            })}
          >
            <XStack alignItems="center" justifyContent="space-between">
              <YStack gap="$1" flex={1}>
                <AppText variant="small" fontWeight="600" color="$mutedWarm">
                  VAD KAN JAG FÖRVÄNTA MIG?
                </AppText>
                <AppText variant="body" muted numberOfLines={2}>
                  {expectText}
                </AppText>
              </YStack>
              <Ionicons name="chevron-forward" size={20} color={colors.accent} />
            </XStack>
          </Pressable>

          {(uniqueDo.length > 0 || insight?.insight_body) && (
            <Pressable
              onPress={openDoModal}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                backgroundColor: colors.surface3,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderSoft,
              })}
            >
              <XStack alignItems="flex-start" justifyContent="space-between">
                <YStack gap="$1" flex={1}>
                  <AppText variant="small" fontWeight="600" color="$mutedWarm">
                    VAD KAN JAG GÖRA?
                  </AppText>
                  {insight?.insight_body && (
                    <AppText variant="body" muted numberOfLines={1}>
                      {insight.insight_body}
                    </AppText>
                  )}
                  <AppText variant="caption" muted numberOfLines={1}>
                    {uniqueDo.slice(0, 2).join(" · ")}
                  </AppText>
                </YStack>
                <Ionicons name="chevron-forward" size={20} color={colors.accent} style={{ marginTop: 4 }} />
              </XStack>
            </Pressable>
          )}
        </YStack>
      </Card.Content>
    </Card>

    <InsightDetailModal
      visible={detailModal.visible}
      type={detailModal.type}
      title={detailModal.title}
      items={detailModal.items}
      onClose={() => setDetailModal((p) => ({ ...p, visible: false }))}
    />
    </>
  );
}
