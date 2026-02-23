/**
 * FavoritesSection – favoritpass från client_favorites (databas-synk)
 */
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { YStack, Text } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Section, Card } from "../../shared/ui";
import { AppText } from "../../shared/ui";
import { useFavorites } from "../../lib/hooks/useFavorites";
import { fetchSessionsByIds } from "../../lib/services/workoutService";
import type { ProgramSessionData } from "../../lib/services/workoutService";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { TRAINING_STYLES } from "./trainingStyles";

function getIconForFocus(focus: string | null | undefined): string {
  if (!focus) return "💪";
  const style = TRAINING_STYLES.find(
    (s) => s.label.toLowerCase() === focus.toLowerCase() || s.id === focus.toLowerCase()
  );
  return style?.icon ?? "💪";
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FavoritesSectionProps {
  clientId: string | undefined;
  /** När true, renderas utan Section-wrapper för inbäddning i större sektion */
  embedded?: boolean;
}

export function FavoritesSection({ clientId, embedded }: FavoritesSectionProps) {
  const navigation = useNavigation<NavigationProp>();
  const { favoriteSessionIds } = useFavorites(clientId);
  const [sessions, setSessions] = useState<ProgramSessionData[]>([]);

  useEffect(() => {
    if (favoriteSessionIds.length === 0) {
      setSessions([]);
      return;
    }
    fetchSessionsByIds(favoriteSessionIds).then(setSessions);
  }, [favoriteSessionIds.join(",")]);

  if (sessions.length === 0) return null;

  const scroll = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 12, paddingRight: 16 }}
    >
      {sessions.map((session) => (
        <Card
          key={session.id}
          minWidth={140}
          marginRight={12}
          pressable
          onPress={() =>
            navigation.navigate("WorkoutPreview", {
              sessionId: session.id,
              isStandalone: true,
            })
          }
        >
          <Card.Content padding="$4">
            <YStack alignItems="center" gap="$2" paddingVertical="$2">
              <Text fontSize="$xl">{getIconForFocus(session.focus)}</Text>
              <AppText variant="small" fontWeight="600" textAlign="center" numberOfLines={2}>
                {session.name}
              </AppText>
              <AppText variant="caption" muted center>
                {session.session_exercises?.length ?? 0} övningar
              </AppText>
            </YStack>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  if (embedded) {
    return (
      <YStack gap="$3">
        <AppText variant="small" fontWeight="600" muted>Favoriter</AppText>
        {scroll}
      </YStack>
    );
  }

  return (
    <Section title="Favoriter" subtitle="Dina favoritpass">
      {scroll}
    </Section>
  );
}
