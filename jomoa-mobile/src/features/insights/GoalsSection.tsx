/**
 * GoalsSection – mål från client_goals (databas-synk)
 */
import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Pressable } from "react-native";

import {
  Section,
  Card,
  AppText,
  AppButton,
  EmptyState,
} from "../../shared/ui";
import { useGoals } from "../../lib/hooks/useGoals";
import {
  getGoalTypeLabel,
  type GoalType,
  type ClientGoal,
} from "../../lib/services/goalsService";
import { AddGoalModal } from "./AddGoalModal";

const GOAL_ICONS: Record<GoalType, string> = {
  fitness: "💪",
  nutrition: "🥗",
  wellness: "💚",
  event: "🏃",
};

const GOAL_BG: Record<GoalType, string> = {
  fitness: "$accent",
  nutrition: "$success",
  wellness: "$success",
  event: "$info",
};

interface GoalsSectionProps {
  clientId: string | undefined;
}

export function GoalsSection({ clientId }: GoalsSectionProps) {
  const { goals, isLoading, addGoal, updateGoalById, removeGoal } =
    useGoals(clientId);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editGoal, setEditGoal] = useState<ClientGoal | null>(null);

  if (isLoading) return null;

  if (goals.length === 0) {
    return (
      <>
        <Section
          title="Mål"
          subtitle="Lägg till mål för att hålla koll på din resa"
        >
          <Card>
            <Card.Content>
              <EmptyState
                icon="🎯"
                title="Inga mål ännu"
                description="Lägg till mål för att följa din utveckling och hålla dig motiverad."
                actionLabel="Lägg till mål"
                onAction={() => setAddModalVisible(true)}
              />
            </Card.Content>
          </Card>
        </Section>
        <AddGoalModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSave={addGoal}
        />
      </>
    );
  }

  return (
    <>
      <Section title="Mål" subtitle="Din resa mot bättre hälsa">
        <YStack gap="$3">
          {goals.map((goal) => (
            <Pressable
              key={goal.id}
              onPress={() => setEditGoal(goal)}
            >
              <Card>
                <Card.Content>
                  <XStack alignItems="center" gap="$4">
                    <YStack
                      width={48}
                      height={48}
                      borderRadius="$full"
                      backgroundColor={GOAL_BG[goal.goal_type]}
                      alignItems="center"
                      justifyContent="center"
                      opacity={0.9}
                    >
                      <Text fontSize="$xl">{GOAL_ICONS[goal.goal_type]}</Text>
                    </YStack>
                    <YStack flex={1} gap="$1">
                      <AppText variant="h3">
                        {getGoalTypeLabel(goal.goal_type)}
                      </AppText>
                      <AppText variant="caption" muted>
                        {goal.description || goal.target_value || "Målsättning"}
                      </AppText>
                    </YStack>
                    <AppText variant="caption" color="$colorSecondary">
                      →
                    </AppText>
                  </XStack>
                </Card.Content>
              </Card>
            </Pressable>
          ))}
        </YStack>
        <AppButton
          variant="secondary"
          marginTop="$3"
          onPress={() => setAddModalVisible(true)}
        >
          Lägg till mål
        </AppButton>
      </Section>

      <AddGoalModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={addGoal}
      />

      <AddGoalModal
        visible={!!editGoal}
        onClose={() => setEditGoal(null)}
        onSave={addGoal}
        initialGoal={editGoal}
        onUpdate={updateGoalById}
        onDelete={removeGoal}
      />
    </>
  );
}
