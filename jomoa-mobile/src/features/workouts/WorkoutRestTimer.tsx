/**
 * WorkoutRestTimer – viltimer under pass med start/paus/hoppa över.
 */
import React from "react";
import { YStack, XStack } from "tamagui";
import { Card, AppText, AppButton } from "../../shared/ui";

export interface WorkoutRestTimerProps {
  secondsRemaining: number;
  isRunning: boolean;
  defaultSeconds: number;
  onStart: (seconds: number) => void;
  onPause: () => void;
  onSkipRest: () => void;
}

export function WorkoutRestTimer({
  secondsRemaining,
  isRunning,
  defaultSeconds,
  onStart,
  onPause,
  onSkipRest,
}: WorkoutRestTimerProps) {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Card backgroundColor="$surface3">
      <Card.Content padding="$6">
        <YStack gap="$4">
          <AppText variant="h3">Vila</AppText>
          <AppText variant="h1" color="$accent">
            {display}
          </AppText>
          <XStack gap="$3" flexWrap="wrap">
            {!isRunning ? (
              <AppButton
                variant="primary"
                size="md"
                onPress={() => onStart(defaultSeconds)}
              >
                Starta vila
              </AppButton>
            ) : (
              <AppButton variant="ghost" size="md" onPress={onPause}>
                Pausa
              </AppButton>
            )}
            <AppButton variant="secondary" size="md" onPress={onSkipRest}>
              Hoppa över
            </AppButton>
          </XStack>
        </YStack>
      </Card.Content>
    </Card>
  );
}
