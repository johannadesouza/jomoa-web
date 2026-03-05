/**
 * Kost – näring och mat
 */
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  EmptyState,
} from "../../shared/ui";
import { TopBar } from "../../components/layout/TopBar";
import { RootStackParamList } from "../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function NutritionScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Screen scroll padded>
      <TopBar
        title="Kost"
        subtitle="Näring och mat"
        rightIcons={["profile", "settings"]}
        onProfile={() => navigation.navigate("Profile")}
        onSettings={() => navigation.navigate("Settings")}
      />
      <Section title="Kost" subtitle="Här kommer tips och rekommendationer kopplade till din cykel">
        <Card>
          <Card.Content>
            <EmptyState
              iconName="nutrition-outline"
              title="Kost kommer snart"
              description="Här får du tips om näring anpassat efter din cykelfas och dina mål. Läs mer under Lär dig tills dess."
              actionLabel="Läs om kost och cykel"
              onAction={() => navigation.navigate("LearnTab")}
            />
          </Card.Content>
        </Card>
      </Section>
    </Screen>
  );
}
