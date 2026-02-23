/**
 * Lär dig – kunskap, guider, cykelplan.
 * Cykel-koppling: visa din fas, fasexperteriserade ämnen.
 */
import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  LockIcon,
} from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { SegmentBar } from "../../components/layout/SegmentBar";
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

export function LearnScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [segment, setSegment] = useState<LearnSegment>("cykelplan");
  const { client } = useAuth();
  const { phase, phaseLabel, cycleDay } = useCycle(client?.id);
  const phaseProfile = phase ? getPhaseProfile(phase) : null;

  const handleSettings = () => navigation.navigate("Settings");

  const STAR_FOODS = [
    { icon: "🥗", label: "Grönsaker" },
    { icon: "🍎", label: "Frukter" },
    { icon: "🥑", label: "Fetter" },
    { icon: "🥜", label: "Proteiner" },
  ];

  return (
    <Screen scroll padded>
      <TopBar title="Lär dig" rightIcons={["settings"]} onSettings={handleSettings} />
      <YStack gap="$6" paddingTop="$4" paddingBottom="$8">
        {phase && (
          <Section title="Din cykelplan">
            <Card
              pressable
              onPress={() => navigation.navigate("CycleInsights")}
            >
              <Card.Content>
                <YStack gap="$3">
                  <XStack flexWrap="wrap" gap="$2" alignItems="center">
                    <Text
                      fontSize="$2"
                      fontWeight="600"
                      backgroundColor="$accent"
                      color="$background"
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      borderRadius="$10"
                    >
                      Nu: {phaseLabel}
                    </Text>
                    {getNextPhase(phase) && (
                      <Text
                        fontSize="$2"
                        fontWeight="600"
                        backgroundColor="$surface3"
                        color="$textSecondary"
                        paddingHorizontal="$3"
                        paddingVertical="$1"
                        borderRadius="$10"
                      >
                        Nästa: {getPhaseLabel(getNextPhase(phase))}
                      </Text>
                    )}
                    <AppText variant="small" muted>
                      Cykeldag {cycleDay}
                    </AppText>
                  </XStack>
                  <AppText variant="body">
                    Vad din fas innebär för träning, återhämtning och kost.
                  </AppText>
                  <AppText variant="caption" color="$accent">
                    Läs mer →
                  </AppText>
                </YStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        <SegmentBar segments={SEGMENTS} activeId={segment} onSelect={setSegment} />

        {segment === "cykelplan" && (
          <>
            <Section title="Cykelfaskunskap" subtitle="Faser och rekommendationer">
              <Card
                pressable
                onPress={() => navigation.navigate("CycleInsights")}
              >
                <Card.Content>
                  <YStack alignItems="center" gap="$3" paddingVertical="$4">
                    <Text fontSize="$xxl">🌙</Text>
                    <AppText variant="h3">Din cykel och träning</AppText>
                    <AppText variant="small" muted center>
                      Follikulär, ägglossning, luteal – hur du tränar smart i varje fas
                    </AppText>
                  </YStack>
                </Card.Content>
              </Card>
            </Section>
            <Section title="STAR FOODS" subtitle={phaseProfile ? `${phaseLabel} – cykelanpassad kost` : "Cykelanpassad nutrition"}>
              <XStack flexWrap="wrap" gap="$3" justifyContent="center">
                {STAR_FOODS.map((f) => (
                  <Card
                    key={f.label}
                    pressable
                    onPress={() => navigation.navigate("CycleInsights")}
                    minWidth={72}
                    padding="$4"
                  >
                    <Card.Content padding="$0" alignItems="center" gap="$2">
                      <YStack
                        width={48}
                        height={48}
                        borderRadius="$full"
                        backgroundColor="$surface3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="$xl">{f.icon}</Text>
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
          <Section title="Ämnen" subtitle="Guider och kunskap">
            <YStack flexDirection="row" flexWrap="wrap" gap="$4">
              {[
                { icon: "💪", label: "Träning", desc: "Styrka, cykelanpassning", tag: "#CYKEL" },
                { icon: "🥗", label: "Nutrition", desc: "Kost och cykeln", tag: "#CYKEL" },
                { icon: "🌙", label: "Cykel", desc: "Din cykel och träning", tag: "#CYKEL" },
                { icon: "❓", label: "FAQ", desc: "Vanliga frågor", tag: null },
              ].map((topic) => (
                <Card
                  key={topic.label}
                  flex={1}
                  minWidth="45%"
                  pressable
                  onPress={() => navigation.navigate("CycleInsights")}
                >
                  <Card.Content>
                    <YStack gap="$2" paddingVertical="$3">
                      <XStack alignItems="center" gap="$2">
                        <Text fontSize="$xl">{topic.icon}</Text>
                        {topic.tag && (
                          <AppText variant="caption" color="$accent">
                            {topic.tag}
                          </AppText>
                        )}
                      </XStack>
                      <AppText variant="body" fontWeight="600">
                        {topic.label}
                      </AppText>
                      <AppText variant="caption" muted>
                        {topic.desc}
                      </AppText>
                    </YStack>
                  </Card.Content>
                </Card>
              ))}
            </YStack>
          </Section>
        )}

        {segment === "artiklar" && (
          <Section title="Artiklar" subtitle="Guider kommer snart">
            <Card>
              <Card.Content>
                <YStack alignItems="center" gap="$3" paddingVertical="$6">
                  <LockIcon size={40} />
                  <AppText variant="body" muted center>
                    Guider och artiklar kommer snart.
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
