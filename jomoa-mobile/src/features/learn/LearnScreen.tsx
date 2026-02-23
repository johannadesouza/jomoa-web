/**
 * Lär dig – kunskap, guider, cykelplan.
 * Cykel-koppling: visa din fas, fasexperteriserade ämnen.
 */
import React, { useState } from "react";
import { YStack, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppIcon,
} from "../../shared/ui";
import type { AppIconName } from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { SegmentBar } from "../../components/layout/SegmentBar";
import { PhaseIndicatorBar } from "../../components/cycle/PhaseIndicatorBar";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { getPhaseProfile } from "../../lib/services/phaseKnowledgeService";
import { getNextPhase, getPhaseLabel } from "../../lib/utils/cycleUtils";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type LearnSegment = "cykelplan" | "amnen" | "artiklar";

const SEGMENTS: { id: LearnSegment; label: string }[] = [
  { id: "cykelplan", label: "Cykelplan" },
  { id: "amnen", label: "Ämnen" },
  { id: "artiklar", label: "Artiklar" },
];

const CYCLE_TOPICS: { icon: string; label: string; desc: string; tag: string | null }[] = [
  { icon: "barbell-outline", label: "Träning", desc: "Styrka, cykelanpassning", tag: "CYKEL" },
  { icon: "nutrition-outline", label: "Kost", desc: "Cykel och nutrition", tag: "CYKEL" },
  { icon: "moon-outline", label: "Cykel", desc: "Din cykel och träning", tag: "CYKEL" },
  { icon: "help-circle-outline", label: "FAQ", desc: "Vanliga frågor", tag: null },
];

const FOCUS_AREAS: { icon: string; label: string }[] = [
  { icon: "leaf-outline", label: "Grönsaker" },
  { icon: "nutrition-outline", label: "Frukter" },
  { icon: "flash-outline", label: "Fetter" },
  { icon: "fitness-outline", label: "Proteiner" },
];

export function LearnScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [segment, setSegment] = useState<LearnSegment>("cykelplan");
  const { client } = useAuth();
  const { phase, phaseLabel, cycleDay } = useCycle(client?.id);
  const phaseProfile = phase ? getPhaseProfile(phase) : null;

  const handleSettings = () => navigation.navigate("Settings");

  return (
    <Screen scroll padded>
      <TopBar
        title="Lär dig"
        rightIcons={["profile", "settings"]}
        onProfile={() => navigation.navigate("Profile")}
        onSettings={handleSettings}
      />
      <YStack gap="$6" paddingTop="$4" paddingBottom="$8">
        {phase && (
          <Section
            title="Din cykelplan"
            subtitle="Vad din fas innebär för träning, kost och livsstil"
          >
            <Card
              pressable
              onPress={() => navigation.navigate("CycleInsights")}
            >
              <Card.Content>
                <YStack gap="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack gap="$1">
                      <AppText variant="h3" color="$accent">
                        {phaseLabel}
                      </AppText>
                      <AppText variant="small" muted>
                        Cykeldag {cycleDay}
                        {getNextPhase(phase) && ` · Nästa: ${getPhaseLabel(getNextPhase(phase)!)}`}
                      </AppText>
                    </YStack>
                    <PhaseIndicatorBar activePhase={phase} />
                  </XStack>
                  <AppText variant="caption" color="$accent">
                    Läs mer om din fas →
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        <SegmentBar segments={SEGMENTS} activeId={segment} onSelect={setSegment} scrollable />

        {segment === "cykelplan" && (
          <>
            <Section
              title="Cykelfaskunskap"
              subtitle="Follikulär, ägglossning, luteal – hur du tränar smart i varje fas"
            >
              <Card
                pressable
                onPress={() => navigation.navigate("CycleInsights")}
              >
                <Card.Content>
                  <YStack alignItems="center" gap="$3" paddingVertical="$4">
                    <YStack
                      width={56}
                      height={56}
                      borderRadius="$full"
                      backgroundColor="$surface3"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <AppIcon name="moon-outline" size={28} />
                    </YStack>
                    <AppText variant="h3">Din cykel och träning</AppText>
                    <AppText variant="small" muted center>
                      Utforska vad varje fas innebär för hormoner, träning och kost
                    </AppText>
                    <AppText variant="caption" color="$accent">
                      Öppna Cykelinsikter →
                    </AppText>
                  </YStack>
                </Card.Content>
              </Card>
            </Section>
            <Section
              title="Kostfokus"
              subtitle={phaseProfile ? `${phaseLabel} – cykelanpassad kost` : "Cykelanpassad nutrition"}
            >
              <XStack flexWrap="wrap" gap="$3" justifyContent="flex-start">
                {FOCUS_AREAS.map((f) => (
                  <Card
                    key={f.label}
                    pressable
                    onPress={() => navigation.navigate("CycleInsights", { initialSegment: "kost" })}
                    minWidth={80}
                    flex={1}
                  >
                    <Card.Content alignItems="center" gap="$2" padding="$4">
                      <YStack
                        width={44}
                        height={44}
                        borderRadius="$full"
                        backgroundColor="$surface3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppIcon name={f.icon as AppIconName} size={22} />
                      </YStack>
                      <AppText variant="caption" numberOfLines={1}>
                        {f.label}
                      </AppText>
                    </Card.Content>
                  </Card>
                ))}
              </XStack>
            </Section>
          </>
        )}

        {segment === "amnen" && (
          <Section title="Ämnen" subtitle="Guider och kunskap per tema">
            <YStack gap="$3">
              {CYCLE_TOPICS.map((topic) => (
                <Card
                  key={topic.label}
                  pressable
                  onPress={() => navigation.navigate("CycleInsights")}
                >
                  <Card.Content>
                    <XStack gap="$4" alignItems="center">
                      <YStack
                        width={48}
                        height={48}
                        borderRadius="$3"
                        backgroundColor="$surface3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppIcon name={topic.icon as AppIconName} size={24} />
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <XStack alignItems="center" gap="$2">
                          <AppText variant="body" fontWeight="600">
                            {topic.label}
                          </AppText>
                          {topic.tag && (
                            <AppText variant="caption" color="$accent">
                              #{topic.tag}
                            </AppText>
                          )}
                        </XStack>
                        <AppText variant="caption" muted>
                          {topic.desc}
                        </AppText>
                      </YStack>
                      <AppIcon name="chevron-forward" size={20} />
                    </XStack>
                  </Card.Content>
                </Card>
              ))}
            </YStack>
          </Section>
        )}

        {segment === "artiklar" && (
          <Section title="Artiklar" subtitle="Guider och djupdykningar">
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$4" paddingVertical="$8">
                  <YStack
                    width={64}
                    height={64}
                    borderRadius="$full"
                    backgroundColor="$surface3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AppIcon name="document-text-outline" size={32} />
                  </YStack>
                  <AppText variant="body" muted center>
                    Guider och artiklar kommer snart.
                  </AppText>
                  <AppText variant="caption" muted center>
                    Håll utkik efter nya inlägg om träning, cykel och kost.
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}
      </YStack>
    </Screen>
  );
}
