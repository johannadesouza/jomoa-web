/**
 * AdaptationInsightCard – synliggör adaptation engine-resultatet för användaren.
 *
 * Visar tre nivåer av information utan kognitiv overload:
 *   1. Mänsklig rubrik  ("Kroppen är i återhämtningsläge")
 *   2. Konkret volymindikator  ("20% lättare idag")
 *   3. Expanderbar "Varför?"-sektion med de faktiska drivers
 *
 * Använder exakt samma datamodell som engine.ts:
 *   volumeModifier, topDrivers, suggestDeload, suggestRecovery, appliedRules
 */

import React, { useState } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Card, AppText, AppIcon } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import { getThemeColors } from "../../shared/theme/colors";
import type { AdaptationResult } from "../../lib/adaptation/types";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

interface AdaptationInsightCardProps {
  adaptation: AdaptationResult;
  phase: CyclePhase;
  decision: boolean | null;
  onAccept: () => void;
  onDecline: () => void;
}

// ─── Textmappning: ruleId → kort mänsklig etikett ────────────────────────────
// Kopplar till faktiska ruleId-strängar definierade i varje rule-fil.

const RULE_LABELS: Record<string, string> = {
  menstruation_deload:         "Mensfas med låg energi",
  menstruation_volume:         "Mensfas – skonsam dag",
  luteal_volume:               "Lutealfas med låg energi",
  follicular_overload:         "Follikulär fas + bra dagsform",
  ovulation_overload:          "Ägglossning + toppform",
  ovulation_intensity:         "Ägglossning – hög kapacitet",
  high_stress_recovery:        "Hög stress + låg energi",
  poor_sleep_volume:           "Dålig sömn + låg energi",
  poor_sleep:                  "Dålig sömn",
  high_soreness:               "Ömhet + låg energi",
  soreness:                    "Hög muskelömhet",
  high_load_recovery:          "Hög veckobelastning",
  moderate_load_recovery:      "Ökad veckobelastning",
  peri_hot_flash_energy_crash: "Värmevallningar + energikrasch",
  peri_single_symptom:         "Symtom idag",
  peri_sleep_disruption:       "Sömnproblem",
  peri_joint_stiffness:        "Ledvärk",
};

// ─── Rubrikgenerering ─────────────────────────────────────────────────────────

function getHeadline(adaptation: AdaptationResult): string {
  const { volumeModifier, suggestDeload, suggestRecovery, appliedRules } = adaptation;
  const topRule = appliedRules[0] ?? "";

  if (suggestRecovery || (suggestDeload && volumeModifier <= 0.7)) {
    return "Kroppen behöver återhämtning idag";
  }

  if (volumeModifier >= 1.1) {
    if (topRule.includes("follicular") || topRule.includes("ovulation")) {
      return "Du är i toppskick – passa på";
    }
    return "Bra dag att pusha lite extra";
  }

  if (volumeModifier >= 1.0) {
    return "Du är i bra form idag";
  }

  if (volumeModifier >= 0.9) {
    if (topRule.includes("menstruation")) return "Lite lugnare idag – det är klokt";
    if (topRule.includes("sleep"))        return "Sömnen påverkar – spara lite kraft";
    if (topRule.includes("luteal"))       return "Kroppen jobbar hårdare nu";
    if (topRule.includes("peri"))         return "Lyssna på kroppen idag";
    return "Lite lugnare tempo idag";
  }

  if (topRule.includes("stress"))   return "Hög stress – träningen anpassas";
  if (topRule.includes("soreness")) return "Musklerna behöver mer tid";
  return "Kroppen är i återhämtningsläge";
}

// ─── Volymetikett ─────────────────────────────────────────────────────────────

function getVolumeLabel(modifier: number): { text: string; isPositive: boolean } {
  if (modifier === 1.0) return { text: "Normal volym", isPositive: true };
  const pct = Math.round(Math.abs(modifier - 1) * 100);
  if (modifier > 1.0) return { text: `+${pct}% volym idag`, isPositive: true };
  return { text: `${pct}% lättare idag`, isPositive: false };
}

// ─── Komponent ────────────────────────────────────────────────────────────────

export function AdaptationInsightCard({
  adaptation,
  decision,
  onAccept,
  onDecline,
}: AdaptationInsightCardProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const copy = useAppCopy("sv");
  const [expanded, setExpanded] = useState(false);

  const { volumeModifier, suggestDeload, suggestRecovery, appliedRules } = adaptation;

  if (
    volumeModifier === 1.0 &&
    !suggestDeload &&
    !suggestRecovery &&
    appliedRules.length === 0
  ) {
    return null;
  }

  const headline = getHeadline(adaptation);
  const { text: volumeLabel, isPositive } = getVolumeLabel(volumeModifier);

  const driverLabels = appliedRules
    .slice(0, 2)
    .map((ruleId) => RULE_LABELS[ruleId])
    .filter(Boolean);

  const iconName =
    suggestRecovery
      ? ("leaf-outline" as const)
      : volumeModifier >= 1.05
      ? ("flash-outline" as const)
      : ("body-outline" as const);

  return (
    <Card backgroundColor="$surface3" borderColor="$borderSoft">
      <Card.Content>
        <YStack gap="$4">

          {/* Rubrik + volymindikator */}
          <XStack alignItems="flex-start" gap="$3">
            <YStack
              width={44}
              height={44}
              borderRadius="$full"
              backgroundColor={isPositive ? "$accent" : "$surface2"}
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <AppIcon
                name={iconName}
                size={20}
                color={isPositive ? colors.background : colors.textSecondary}
              />
            </YStack>

            <YStack flex={1} gap="$1">
              <AppText variant="h3">{headline}</AppText>
              <AppText
                variant="caption"
                color={isPositive ? "$accent" : "$textSecondary"}
                fontWeight="600"
              >
                {volumeLabel}
              </AppText>
            </YStack>
          </XStack>

          {/* Expanderbar "Varför?"-sektion */}
          {driverLabels.length > 0 && (
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              hitSlop={8}
            >
              <XStack alignItems="center" gap="$1">
                <AppText variant="caption" color="$accent">
                  Varför detta?
                </AppText>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={13}
                  color={colors.accent}
                />
              </XStack>
            </Pressable>
          )}

          {expanded && driverLabels.length > 0 && (
            <YStack
              gap="$2"
              paddingVertical="$2"
              paddingHorizontal="$3"
              backgroundColor="$surface2"
              borderRadius="$2"
            >
              {driverLabels.map((label, i) => (
                <XStack key={i} alignItems="center" gap="$2">
                  <YStack
                    width={5}
                    height={5}
                    borderRadius="$full"
                    backgroundColor="$accent"
                    flexShrink={0}
                  />
                  <AppText variant="caption" muted>
                    {label}
                  </AppText>
                </XStack>
              ))}
              {suggestDeload && (
                <AppText variant="caption" color="$accent" marginTop="$1">
                  Deload rekommenderas denna vecka
                </AppText>
              )}
            </YStack>
          )}

          {/* Kort förklaring av beslut */}
          <AppText variant="caption" muted>
            {getAppCopy(copy, "adaptation_decision_hint", "Öka = mer belastning · Behåll = som planerat · Justera = lättare pass idag")}
          </AppText>

          {/* Accept / Behåll */}
          <XStack gap="$3">
            <Pressable onPress={onAccept} style={{ flex: 1 }}>
              <YStack
                padding="$3"
                borderRadius="$2"
                backgroundColor={decision === true ? "$accent" : "$card"}
                borderWidth={1}
                borderColor={decision === true ? "$accent" : "$borderSoft"}
                alignItems="center"
              >
                <AppText
                  variant="small"
                  fontWeight="600"
                  color={decision === true ? "$background" : "$color"}
                >
                  Ja, anpassa
                </AppText>
              </YStack>
            </Pressable>

            <Pressable onPress={onDecline} style={{ flex: 1 }}>
              <YStack
                padding="$3"
                borderRadius="$2"
                backgroundColor={decision === false ? "$surface3" : "$card"}
                borderWidth={1}
                borderColor="$borderSoft"
                alignItems="center"
              >
                <AppText variant="small" fontWeight="600" color="$color">
                  Behåll plan
                </AppText>
              </YStack>
            </Pressable>
          </XStack>

        </YStack>
      </Card.Content>
    </Card>
  );
}
