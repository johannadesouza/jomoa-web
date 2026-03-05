/**
 * Lär dig – kunskapsbas för träning, cykel och välmående.
 *
 * Struktur:
 *  - Ingen upprepande header-faskortet ovanför segmentbaren
 *  - Cykelplan: alla 4 faser som klickbara färgkort → PhaseDetailScreen
 *  - Ämnen: tydliga ämnesgrupper med rätt destination
 *  - Artiklar: hämtas från Content DB
 */
import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { YStack, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen, Section, Card, AppText, AppIcon } from "../../shared/ui";
import type { AppIconName } from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { SegmentBar } from "../../components/layout/SegmentBar";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { RootStackParamList } from "../../navigation/RootNavigator";
import {
  fetchAllCyclePhases,
  type CyclePhase,
} from "../../lib/repos/contentRepo/cycleContent";
import {
  fetchPublishedArticles,
  type Article,
} from "../../lib/repos/contentRepo/articles";
import { getThemeColors } from "../../shared/theme/colors";
import { useTheme } from "../../shared/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LearnSegment = "cykelplan" | "amnen" | "artiklar";

const SEGMENTS: { id: LearnSegment; label: string }[] = [
  { id: "cykelplan", label: "Cykelplan" },
  { id: "amnen", label: "Ämnen" },
  { id: "artiklar", label: "Artiklar" },
];

const ENERGY_LABELS: Record<string, string> = {
  low: "Låg energi",
  medium: "Medel energi",
  high: "Hög energi",
  variable: "Varierad energi",
};

const CATEGORY_COLORS: Record<string, string> = {
  Träning: "#D96D46",
  Kost: "#81C784",
  Cykel: "#9C6EB5",
  Livsstil: "#5C9EAD",
  FAQ: "#FFB74D",
};

// Ämnen med tydliga destinations
const TOPICS: {
  icon: AppIconName;
  label: string;
  desc: string;
  destination: "CycleInsights" | "PhaseDetail";
  insightSegment?: string;
}[] = [
  {
    icon: "barbell-outline",
    label: "Träning & cykel",
    desc: "Hur du tränar smart i varje fas",
    destination: "CycleInsights",
    insightSegment: "träning",
  },
  {
    icon: "nutrition-outline",
    label: "Kost & cykel",
    desc: "Cykelanpassad nutrition per fas",
    destination: "CycleInsights",
    insightSegment: "kost",
  },
  {
    icon: "heart-outline",
    label: "Livsstil & återhämtning",
    desc: "Sömn, stress och välmående",
    destination: "CycleInsights",
    insightSegment: "livsstil",
  },
  {
    icon: "analytics-outline",
    label: "Hormoner",
    desc: "Hur hormonerna styr din kropp",
    destination: "CycleInsights",
    insightSegment: "träning",
  },
];

// ─── Artikel-kort ────────────────────────────────────────────
function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
  const catColor = article.category ? (CATEGORY_COLORS[article.category] ?? "#D96D46") : "#D96D46";
  return (
    <Card pressable onPress={onPress}>
      <Card.Content>
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack gap="$2" alignItems="center">
              {article.category && (
                <YStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$full"
                  backgroundColor={catColor + "22"}
                >
                  <AppText
                    variant="caption"
                    style={{ color: catColor, fontWeight: "700", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.4 }}
                  >
                    {article.category}
                  </AppText>
                </YStack>
              )}
              {article.reading_time_minutes && (
                <AppText variant="caption" muted>
                  {article.reading_time_minutes} min
                </AppText>
              )}
            </XStack>
            <AppIcon name="chevron-forward" size={18} />
          </XStack>
          <AppText variant="body" style={{ fontWeight: "600", lineHeight: 22 }}>
            {article.title}
          </AppText>
          {article.excerpt && (
            <AppText variant="caption" muted numberOfLines={2} style={{ lineHeight: 18 }}>
              {article.excerpt}
            </AppText>
          )}
        </YStack>
      </Card.Content>
    </Card>
  );
}

// ─── Fas-kort ────────────────────────────────────────────────
function PhaseCard({
  phase,
  isActive,
  onPress,
}: {
  phase: CyclePhase;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Card pressable onPress={onPress}>
      <Card.Content>
        <XStack gap="$4" alignItems="center">
          {/* Färgad vertikal kant + dag-indikator */}
          <YStack
            width={48}
            height={48}
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            style={{ backgroundColor: phase.color_hex + "22" }}
          >
            <YStack
              width={16}
              height={16}
              borderRadius="$full"
              style={{ backgroundColor: phase.color_hex }}
            />
          </YStack>
          <YStack flex={1} gap="$1">
            <XStack alignItems="center" gap="$2">
              <AppText variant="body" style={{ fontWeight: "700", flex: 1 }}>
                {phase.name}
              </AppText>
              {isActive && (
                <YStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$full"
                  style={{ backgroundColor: phase.color_hex + "33" }}
                >
                  <AppText
                    variant="caption"
                    style={{ color: phase.color_hex, fontWeight: "700", fontSize: 10 }}
                  >
                    Din fas
                  </AppText>
                </YStack>
              )}
            </XStack>
            <AppText variant="caption" muted>
              {phase.typical_days}
              {phase.energy_level ? ` · ${ENERGY_LABELS[phase.energy_level]}` : ""}
            </AppText>
            <AppText variant="caption" muted numberOfLines={2} style={{ lineHeight: 18, marginTop: 2 }}>
              {phase.description}
            </AppText>
          </YStack>
          <AppIcon name="chevron-forward" size={20} />
        </XStack>
      </Card.Content>
    </Card>
  );
}

// ─── Huvud-komponent ─────────────────────────────────────────
export function LearnScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { mode: cycleMode } = useCycleContext();
  const showCykelplan = cycleMode === "regular";
  const segments = showCykelplan ? SEGMENTS : SEGMENTS.filter((s) => s.id !== "cykelplan");
  const [segment, setSegment] = useState<LearnSegment>(showCykelplan ? "cykelplan" : "artiklar");
  const { client } = useAuth();
  const { phase } = useCycle(client?.id);

  // If user switches to no cycle mode, ensure we don't stay on cykelplan
  useEffect(() => {
    if (!showCykelplan && segment === "cykelplan") {
      setSegment("artiklar");
    }
  }, [showCykelplan, segment]);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  // Cykelplan-data
  const [phases, setPhases] = useState<CyclePhase[]>([]);
  const [phasesLoading, setPhasesLoading] = useState(false);

  // Artiklar-data
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState(false);

  useEffect(() => {
    if (segment === "cykelplan" && phases.length === 0) {
      setPhasesLoading(true);
      fetchAllCyclePhases()
        .then(setPhases)
        .finally(() => setPhasesLoading(false));
    }
  }, [segment]);

  const loadArticles = () => {
    setArticlesLoading(true);
    setArticlesError(false);
    fetchPublishedArticles()
      .then(setArticles)
      .catch(() => setArticlesError(true))
      .finally(() => setArticlesLoading(false));
  };

  useEffect(() => {
    if (segment === "artiklar" && articles.length === 0) {
      loadArticles();
    }
  }, [segment]);

  // Mappa intern fas-enum till Content DB-id
  const PHASE_ID_MAP: Record<string, string> = {
    menstruation: "menstruation",
    follicular: "follikular",
    ovulation: "ovulation",
    luteal: "luteal",
  };
  const activePhaseId = phase ? (PHASE_ID_MAP[phase] ?? null) : null;

  return (
    <Screen scroll padded>
      <TopBar
        title="Lär dig"
        rightIcons={["profile", "settings"]}
        onProfile={() => navigation.navigate("Profile")}
        onSettings={() => navigation.navigate("Settings")}
      />
      <YStack gap="$6" paddingTop="$4" paddingBottom="$8">

        <SegmentBar segments={segments} activeId={segment} onSelect={setSegment} scrollable />

        {/* ── Cykelplan ── */}
        {segment === "cykelplan" && (
          <Section
            title="Cykelns faser"
            subtitle="Lär dig vad varje fas innebär för din kropp, träning och välmående"
          >
            {phasesLoading ? (
              <YStack alignItems="center" paddingVertical="$8">
                <ActivityIndicator size="large" color={colors.accent} />
              </YStack>
            ) : (
              <YStack gap="$3">
                {phases.map((p) => (
                  <PhaseCard
                    key={p.id}
                    phase={p}
                    isActive={p.id === activePhaseId}
                    onPress={() =>
                      navigation.navigate("PhaseDetail", {
                        phaseId: p.id,
                        phaseName: p.name,
                      })
                    }
                  />
                ))}
              </YStack>
            )}
          </Section>
        )}

        {/* ── Ämnen ── */}
        {segment === "amnen" && (
          <Section title="Ämnen" subtitle="Djupdyk i ett tema">
            <YStack gap="$3">
              {TOPICS.map((topic) => (
                <Card
                  key={topic.label}
                  pressable
                  onPress={() =>
                    navigation.navigate("CycleInsights", {
                      initialSegment: topic.insightSegment,
                    })
                  }
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
                        <AppIcon name={topic.icon} size={24} />
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <AppText variant="body" style={{ fontWeight: "600" }}>
                          {topic.label}
                        </AppText>
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

        {/* ── Artiklar ── */}
        {segment === "artiklar" && (
          <Section title="Artiklar" subtitle="Guider och djupdykningar">
            {articlesLoading ? (
              <YStack alignItems="center" paddingVertical="$8">
                <ActivityIndicator size="large" color={colors.accent} />
              </YStack>
            ) : articlesError ? (
              <Card>
                <Card.Content>
                  <YStack alignItems="center" gap="$3" paddingVertical="$6">
                    <AppIcon name="alert-circle-outline" size={32} />
                    <AppText variant="body" muted center>
                      Kunde inte ladda artiklar.
                    </AppText>
                    <AppText variant="caption" color="$accent" onPress={loadArticles}>
                      Försök igen
                    </AppText>
                  </YStack>
                </Card.Content>
              </Card>
            ) : articles.length === 0 ? (
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
                      Inga artiklar publicerade ännu.
                    </AppText>
                    <AppText variant="caption" muted center>
                      Håll utkik efter nya guider om träning, cykel och kost.
                    </AppText>
                  </YStack>
                </Card.Content>
              </Card>
            ) : (
              <YStack gap="$3">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onPress={() =>
                      navigation.navigate("ArticleDetail", {
                        slug: article.slug,
                        title: article.title,
                      })
                    }
                  />
                ))}
              </YStack>
            )}
          </Section>
        )}

      </YStack>
    </Screen>
  );
}
