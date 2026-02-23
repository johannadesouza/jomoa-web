/**
 * Featured program hero-kort – Fas B
 */
import React from "react";
import { YStack, XStack, Text } from "tamagui";

import { Card, AppText } from "../../shared/ui";
import type { ProgramAssignmentData } from "../../lib/services/programService";

interface FeaturedProgramCardProps {
  assignment: ProgramAssignmentData;
  onPress?: () => void;
}

export function FeaturedProgramCard({ assignment, onPress }: FeaturedProgramCardProps) {
  const program = assignment.program;

  return (
    <Card pressable onPress={onPress}>
      <Card.Content padding="$6">
        <YStack gap="$4" paddingVertical="$2">
          <XStack alignItems="center" gap="$4">
            <YStack
              width={56}
              height={56}
              borderRadius="$full"
              backgroundColor="$surface3"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="$xxl">🏆</Text>
            </YStack>
            <YStack flex={1} gap="$1">
              <AppText variant="h3">{program.name}</AppText>
              <AppText variant="small" muted>
                Ditt aktiva program
              </AppText>
            </YStack>
            <AppText variant="body" color="$colorSecondary">→</AppText>
          </XStack>
        </YStack>
      </Card.Content>
    </Card>
  );
}
