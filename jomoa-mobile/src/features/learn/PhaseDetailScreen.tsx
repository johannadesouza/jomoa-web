/**
 * PhaseDetailScreen – djupdykning i en specifik cykelsfas.
 * Visar beskrivning, hormonprofil, träningsrekommendationer och välmåendetips
 * från Content DB.
 */
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen, Section, Card, AppText, AppIcon, AppButton } from "../../shared/ui";
import type { AppIconName } from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import {
  fetchPhaseContent,
  type PhaseContent,
  type PhaseWellnessTip,
} from "../../lib/repos/contentRepo/cycleContent";
import { getThemeColors } from "../../shared/theme/colors";
import { useTheme } from "../../shared/context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "PhaseDetail">;

const WELLNESS_ICONS: Record<string, AppIconName> = {
  nutrition: "nutrition-outline",
  sleep: "moon-outline",
  stress: "heart-outline",
  symptoms: "medical-outline",
  mindfulness: "leaf-outline",
};

const WELLNESS_LABELS: Record<string, string> = {
  nutrition: "Kost",
  sleep: "Sömn",
  stress: "Stress",
  symptoms: "Symtom",
  mindfulness: "Mindfulness",
};

const INTENSITY_LABELS: Record<string, string> = {
  light: "Lätt",
  moderate: "Måttlig",
  high: "Hög",
};

const INTENSITY_COLORS: Record<string, string> = {
  light: "#81C784",
  moderate: "#FFB74D",
  high: "#E57373",
};

const TIP_TYPE_ICONS: Record<string, AppIconName> = {
  recommendation: "checkmark-circle-outline",
  warning: "alert-circle-outline",
  motivation: "flash-outline",
};

const ENERGY_LABELS: Record<string, string> = {
  low: "Låg energi",
  medium: "Medel energi",
  high: "Hög energi",
  variable: "Varierad energi",
};

export function PhaseDetailScreen({ route, navigation }: Props) {
  const phaseId = route.params?.phaseId;
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [content, setContent] = useState<PhaseContent | null>(null);
  const [loading, setLoading] = useState(true);

  if (!phaseId) {
    return (
      <Screen centered padded>
        <YStack alignItems="center" gap="$4">
          <AppText variant="body" muted center>
            Fasinnehållet kunde inte laddas. Gå tillbaka och försök igen.
          </AppText>
          <AppButton variant="secondary" onPress={() => navigation.goBack()}>
            Tillbaka
          </AppButton>
        </YStack>
      </Screen>
    );
  }

  useEffect(() => {
    fetchPhaseContent(phaseId)
      .then(setContent)
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [phaseId]);

  if (loading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  if (!content) {
    return (
      <Screen centered padded>
        <YStack alignItems="center" gap="$4">
          <AppIcon name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <AppText variant="body" muted center>
            Kunde inte ladda fasinnehåll.
          </AppText>
        </YStack>
      </Screen>
    );
  }

  const phaseColor = content.color_hex;

  // Gruppera wellness-tips per kategori
  const wellnessByCategory: Record<string, PhaseWellnessTip[]> = {};
  for (const tip of content.wellness_tips) {
    const cat = tip.category ?? "övrigt";
    if (!wellnessByCategory[cat]) wellnessByCategory[cat] = [];
    wellnessByCategory[cat].push(tip);
  }

  return (
    <Screen scroll padded safeArea edges={["bottom"]}>
      <YStack gap="$6" paddingTop="$4" paddingBottom="$8">

        {/* Hero-banner */}
        <YStack
          borderRadius="$4"
          padding="$5"
          gap="$3"
          style={{ backgroundColor: phaseColor + "22", borderLeftWidth: 4, borderLeftColor: phaseColor }}
        >
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap="$1" flex={1}>
              <AppText
                variant="caption"
                style={{ color: phaseColor, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                {content.typical_days}
              </AppText>
              <AppText variant="h2" style={{ color: colors.textPrimary, fontWeight: "700" }}>
                {content.name}
              </AppText>
            </YStack>
            {content.energy_level && (
              <YStack
                paddingHorizontal="$3"
                paddingVertical="$1"
                borderRadius="$full"
                style={{ backgroundColor: phaseColor + "33" }}
              >
                <AppText variant="caption" style={{ color: phaseColor, fontWeight: "600" }}>
                  {ENERGY_LABELS[content.energy_level]}
                </AppText>
              </YStack>
            )}
          </XStack>
          <AppText variant="body" style={{ lineHeight: 24, color: colors.textPrimary }}>
            {content.description}
          </AppText>
        </YStack>

        {/* Hormonprofil */}
        {content.hormone_profile && (
          <Card>
            <Card.Content>
              <XStack gap="$3" alignItems="flex-start">
                <YStack
                  width={40}
                  height={40}
                  borderRadius="$full"
                  backgroundColor="$surface3"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <AppIcon name="analytics-outline" size={20} />
                </YStack>
                <YStack flex={1} gap="$2">
                  <AppText variant="body" style={{ fontWeight: "700" }}>
                    Hormonprofil
                  </AppText>
                  <AppText variant="caption" muted style={{ lineHeight: 20 }}>
                    {content.hormone_profile}
                  </AppText>
                </YStack>
              </XStack>
            </Card.Content>
          </Card>
        )}

        {/* Träningsrekommendationer */}
        {content.training_tips.length > 0 && (
          <Section
            title="Träning"
            subtitle={`Rekommendationer för ${content.name.toLowerCase()}`}
          >
            <YStack gap="$3">
              {content.training_tips.map((tip) => {
                const tipIcon = tip.tip_type ? (TIP_TYPE_ICONS[tip.tip_type] ?? "checkmark-circle-outline") : "checkmark-circle-outline";
                const intColor = tip.intensity ? (INTENSITY_COLORS[tip.intensity] ?? colors.accent) : colors.accent;
                return (
                  <Card key={tip.id}>
                    <Card.Content>
                      <XStack gap="$3" alignItems="flex-start">
                        <YStack
                          width={36}
                          height={36}
                          borderRadius="$full"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                          style={{ backgroundColor: intColor + "22" }}
                        >
                          <AppIcon name={tipIcon} size={18} color={intColor} />
                        </YStack>
                        <YStack flex={1} gap="$1">
                          <XStack alignItems="center" gap="$2">
                            <AppText variant="body" style={{ fontWeight: "600", flex: 1 }}>
                              {tip.title}
                            </AppText>
                            {tip.intensity && (
                              <AppText
                                variant="caption"
                                style={{ color: intColor, fontWeight: "600", fontSize: 10 }}
                              >
                                {INTENSITY_LABELS[tip.intensity]}
                              </AppText>
                            )}
                          </XStack>
                          <AppText variant="caption" muted style={{ lineHeight: 18 }}>
                            {tip.body}
                          </AppText>
                        </YStack>
                      </XStack>
                    </Card.Content>
                  </Card>
                );
              })}
            </YStack>
          </Section>
        )}

        {/* Välmåendetips per kategori */}
        {Object.entries(wellnessByCategory).map(([cat, tips]) => (
          <Section
            key={cat}
            title={WELLNESS_LABELS[cat] ?? cat}
            subtitle={`${content.name} – ${WELLNESS_LABELS[cat]?.toLowerCase() ?? cat}`}
          >
            <YStack gap="$3">
              {tips.map((tip) => {
                const icon: AppIconName = cat in WELLNESS_ICONS ? WELLNESS_ICONS[cat] : "heart-outline";
                return (
                  <Card key={tip.id}>
                    <Card.Content>
                      <XStack gap="$3" alignItems="flex-start">
                        <YStack
                          width={36}
                          height={36}
                          borderRadius="$full"
                          backgroundColor="$surface3"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <AppIcon name={icon} size={18} />
                        </YStack>
                        <YStack flex={1} gap="$1">
                          <AppText variant="body" style={{ fontWeight: "600" }}>
                            {tip.title}
                          </AppText>
                          <AppText variant="caption" muted style={{ lineHeight: 18 }}>
                            {tip.body}
                          </AppText>
                        </YStack>
                      </XStack>
                    </Card.Content>
                  </Card>
                );
              })}
            </YStack>
          </Section>
        ))}

      </YStack>
    </Screen>
  );
}
