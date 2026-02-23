import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, ActivityIndicator } from "react-native";
import { Pressable } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  Badge,
  LoadingScreen,
  EmptyState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useWorkouts } from "../../lib/hooks/useWorkouts";
import { useStandaloneWorkouts } from "../../lib/hooks/useStandaloneWorkouts";
import { useFavorites } from "../../lib/hooks/useFavorites";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { ProgramSessionData } from "../../lib/services/workoutService";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SessionBadge({ focus }: { focus: string | null | undefined }) {
  return <Badge variant="default" label={focus || " "} opacity={focus ? 1 : 0} />;
}

function getDayName(dayOfWeek: number): string {
  const days = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
  return days[dayOfWeek] || "Okänd";
}

const STYLE_TO_FOCUS: Record<string, string> = {
  styrka: "Styrka",
  kondition: "Kondition",
  pilates: "Pilates",
  barre: "Barre",
  recovery: "Recovery",
  yoga: "Yoga",
  mindfulness: "Mindfulness",
  prepost: "Pre",
};

export function WorkoutsScreen({
  filterByFocus,
  embedded,
}: {
  filterByFocus?: string | null;
  /** När true, renderas utan Screen/Scroll – för inbäddning i föräldrascroll (t.ex. TrainScreen) */
  embedded?: boolean;
}) {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const focusFilter = filterByFocus ? STYLE_TO_FOCUS[filterByFocus] : null;
  const { sessions: programSessions, programName, isLoading, refetch } = useWorkouts(client?.id);
  const { sessions: standaloneSessions, isLoading: standaloneLoading, refetch: refetchStandalone } = useStandaloneWorkouts(focusFilter);
  const { isFavorite, toggle, refetch: refetchFavorites } = useFavorites(client?.id);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchStandalone();
      refetchFavorites();
    }, [refetch, refetchStandalone, refetchFavorites])
  );

  const isLoadingAny = isLoading || standaloneLoading;
  if (isLoadingAny) {
    if (embedded) {
      return (
        <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
          <ActivityIndicator size="small" color={colors.accent} />
          <AppText variant="small" muted marginTop="$2">Laddar pass...</AppText>
        </YStack>
      );
    }
    return <LoadingScreen />;
  }

  type BrowseableSession = (ProgramSessionData & { isStandalone?: boolean; day_of_week?: number }) | (import("../../lib/services/sessionTemplateService").SessionTemplateData & { isStandalone: true; day_of_week?: number });
  const standaloneWithFlag = standaloneSessions.map((s) => ({ ...s, isStandalone: true as const, day_of_week: undefined }));
  const programWithFlag = programSessions.map((s) => ({ ...s, isStandalone: false as const }));
  const allSessions: BrowseableSession[] = focusFilter
    ? standaloneWithFlag
    : [...programWithFlag, ...standaloneWithFlag];

  if (allSessions.length === 0) {
    const empty = (
      <EmptyState
        iconName="barbell-outline"
        title="Inga pass"
        description={programSessions.length === 0 ? "Välj ett program eller vänta på nya fristående pass." : "Inga pass matchar den valda stilen."}
        actionLabel={programSessions.length === 0 ? "Välj program" : undefined}
        onAction={programSessions.length === 0 ? () => navigation.navigate("ProgramSelect") : undefined}
      />
    );
    if (embedded) return <YStack paddingVertical="$6">{empty}</YStack>;
    return <Screen padded centered>{empty}</Screen>;
  }

  const categoryFilter = selectedCategory
    ? (s: BrowseableSession) =>
        s.focus && s.focus.toLowerCase().includes(selectedCategory.toLowerCase())
    : () => true;
  const filteredSessions = allSessions.filter(categoryFilter);

  const focusTypes = Array.from(new Set(allSessions.map((s) => s.focus).filter(Boolean))) as string[];
  const categories = focusTypes.length > 0
    ? focusTypes
    : ["Styrka", "Kondition", "Mobilitet"];

  const showCategoryChips = !focusFilter && !embedded;
  const content = (
    <YStack gap="$8">
        {showCategoryChips && categories.length > 0 && (
          <Section title="Träningsfokus" spacing="md">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, paddingRight: 16 }}
            >
              {categories.map((cat, idx) => (
                <Card
                  key={cat}
                  minWidth={120}
                  pressable
                  marginRight={idx < categories.length - 1 ? 12 : 0}
                  marginLeft={idx === 0 ? 0 : 0}
                  backgroundColor={selectedCategory === cat ? "$accent" : "$card"}
                  borderColor={selectedCategory === cat ? "$accent" : "$borderColor"}
                  onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  <Card.Content>
                    <YStack alignItems="center" gap="$1" paddingVertical="$3">
                      <Text fontSize="$xl">💪</Text>
                      <AppText
                        variant="body"
                        fontWeight="600"
                        color={selectedCategory === cat ? "$background" : "$color"}
                      >
                        {cat}
                      </AppText>
                    </YStack>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </Section>
        )}
        <Section
          title={focusFilter ? "Pass efter stil" : "Dina pass"}
          subtitle={!focusFilter && programName ? programName : focusFilter ? `Fristående pass – ${focusFilter}` : "Program + fristående pass"}
          spacing="lg"
        >
          <YStack gap="$4" paddingBottom="$4">
            {filteredSessions.length === 0 ? (
              <AppText variant="small" muted center paddingVertical="$4">
                Inga pass matchar det valda filtret
              </AppText>
            ) : null}
            {filteredSessions.map((session: BrowseableSession) => (
              <Card
                key={session.isStandalone ? `t-${session.id}` : session.id}
                pressable
                onPress={() =>
                  navigation.navigate("WorkoutPreview", {
                    sessionId: session.id,
                    isStandalone: session.isStandalone,
                  })
                }
              >
                <Card.Header>
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack gap="$1" flex={1}>
                      <Card.Title>{session.name}</Card.Title>
                      <AppText variant="caption" color="$colorSecondary">
                        {session.day_of_week != null ? getDayName(session.day_of_week) : "Fristående"}
                      </AppText>
                    </YStack>
                    <XStack gap="$2" alignItems="center">
                      {!session.isStandalone && (
                        <Pressable
                          onPress={(e) => {
                            e?.stopPropagation?.();
                            toggle(session.id);
                          }}
                          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                          <Ionicons
                            name={isFavorite(session.id) ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite(session.id) ? colors.accent : colors.textSecondary}
                          />
                        </Pressable>
                      )}
                      <SessionBadge focus={session.focus} />
                    </XStack>
                  </XStack>
                </Card.Header>
                <Card.Content>
                  <XStack gap="$4">
                    <YStack gap="$1">
                      <AppText variant="small" fontWeight="600" color="$colorSecondary">
                        {session.session_exercises?.length || 0}
                      </AppText>
                      <AppText variant="caption" color="$colorSecondary">övningar</AppText>
                    </YStack>
                    <YStack gap="$1">
                      <AppText variant="small" fontWeight="600" color="$colorSecondary">
                        {session.session_exercises?.reduce(
                          (sum, e) => sum + (e.sets_planned || 0),
                          0
                        ) || 0}
                      </AppText>
                      <AppText variant="caption" color="$colorSecondary">set totalt</AppText>
                    </YStack>
                  </XStack>
                </Card.Content>
                <Card.Footer>
                  <AppButton
                    variant="primary"
                    size="sm"
                    onPress={() =>
                      navigation.navigate("WorkoutSession", {
                        sessionId: session.id,
                        isStandalone: session.isStandalone,
                      })
                    }
                  >
                    Starta pass
                  </AppButton>
                </Card.Footer>
              </Card>
            ))}
          </YStack>
        </Section>
      </YStack>
  );

  if (embedded) return content;
  return <Screen scroll padded>{content}</Screen>;
}
