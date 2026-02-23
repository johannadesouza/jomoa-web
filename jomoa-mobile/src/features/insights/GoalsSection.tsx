/**
 * GoalsSection – mål från client_goals (databas-synk)
 * Journey-stil: kategori-kort med valt mål eller "Lägg till"
 */
import React, { useState } from "react";
import { YStack, XStack } from "tamagui";
import { Pressable } from "react-native";

import {
  Section,
  Card,
  AppText,
  AppButton,
  EmptyState,
  AppIcon,
} from "../../shared/ui";
import { useGoals } from "../../lib/hooks/useGoals";
import {
  getGoalTypeLabel,
  type GoalType,
  type ClientGoal,
} from "../../lib/services/goalsService";
import { AddGoalModal } from "./AddGoalModal";

const GOAL_ICON_NAMES: Record<GoalType, string> = {
  fitness: "barbell-outline",
  nutrition: "nutrition-outline",
  wellness: "heart-outline",
  event: "calendar-outline",
};

interface GoalsSectionProps {
  clientId: string | undefined;
}

function getGoalsByType(goals: ClientGoal[]): Record<GoalType, ClientGoal[]> {
  const byType: Record<GoalType, ClientGoal[]> = {
    fitness: [],
    nutrition: [],
    wellness: [],
    event: [],
  };
  goals.forEach((g) => byType[g.goal_type].push(g));
  return byType;
}

export function GoalsSection({ clientId }: GoalsSectionProps) {
  const { goals, isLoading, addGoal, updateGoalById, removeGoal } =
    useGoals(clientId);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<GoalType | null>(null);
  const [editGoal, setEditGoal] = useState<ClientGoal | null>(null);

  const byType = getGoalsByType(goals);
  const GOAL_TYPES: GoalType[] = ["fitness", "nutrition", "wellness", "event"];

  if (isLoading) return null;

  const handleOpenAdd = (type?: GoalType) => {
    setEditingType(type ?? null);
    setEditGoal(null);
    setAddModalVisible(true);
  };

  const handleOpenEdit = (goal: ClientGoal) => {
    setEditingType(goal.goal_type);
    setEditGoal(goal);
    setAddModalVisible(true);
  };

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
                iconName="flag-outline"
                title="Inga mål ännu"
                description="Lägg till mål för att följa din utveckling och hålla dig motiverad."
                actionLabel="Lägg till mål"
                onAction={() => handleOpenAdd()}
              />
            </Card.Content>
          </Card>
        </Section>
        <AddGoalModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSave={addGoal}
          initialGoalType={editingType ?? undefined}
        />
      </>
    );
  }

  return (
    <>
      <Section
        title="Mål"
        subtitle="Din resa mot bättre hälsa"
        viewAllLabel="Lägg till"
        onViewAll={() => handleOpenAdd()}
      >
        <YStack gap="$3">
          {GOAL_TYPES.map((type) => {
            const typeGoals = byType[type];
            const summary = typeGoals
              .map((g) => g.description || g.target_value || "Målsättning")
              .join(", ");

            return (
              <Pressable
                key={type}
                onPress={() =>
                  typeGoals.length > 0
                    ? handleOpenEdit(typeGoals[0])
                    : handleOpenAdd(type)
                }
              >
                <Card>
                  <Card.Content>
                    <XStack alignItems="center" gap="$4">
                      <YStack
                        width={48}
                        height={48}
                        borderRadius="$full"
                        backgroundColor="$surface3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppIcon
                          name={GOAL_ICON_NAMES[type] as AppIconName}
                          size={24}
                        />
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <AppText variant="h3">
                          {getGoalTypeLabel(type)}
                        </AppText>
                        <AppText variant="caption" muted numberOfLines={1}>
                          {typeGoals.length > 0
                            ? summary
                            : "Lägg till mål"}
                        </AppText>
                      </YStack>
                      <AppText variant="caption" color="$colorSecondary">
                        →
                      </AppText>
                    </XStack>
                  </Card.Content>
                </Card>
              </Pressable>
            );
          })}
        </YStack>
      </Section>

      <AddGoalModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingType(null);
          setEditGoal(null);
        }}
        onSave={addGoal}
        initialGoalType={editingType ?? undefined}
        initialGoal={editGoal}
        onUpdate={updateGoalById}
        onDelete={removeGoal}
      />
    </>
  );
}
