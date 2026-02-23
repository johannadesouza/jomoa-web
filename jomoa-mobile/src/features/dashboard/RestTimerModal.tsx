import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Platform } from "react-native";
import { YStack, XStack, Text } from "tamagui";

import { AppText, AppButton } from "../../shared/ui";

const PRESETS = [60, 90, 120] as const;

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RestTimerModal({ visible, onClose }: RestTimerModalProps) {
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearIntervalRef();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearIntervalRef;
  }, [isRunning, clearIntervalRef]);

  const handlePreset = (seconds: number) => {
    clearIntervalRef();
    setTotalSeconds(seconds);
    setSecondsRemaining(seconds);
    setIsRunning(false);
  };

  const handleStart = () => {
    if (secondsRemaining > 0) setIsRunning(true);
  };

  const handlePause = () => {
    clearIntervalRef();
    setIsRunning(false);
  };

  const handleReset = () => {
    clearIntervalRef();
    if (totalSeconds != null) {
      setSecondsRemaining(totalSeconds);
      setIsRunning(false);
    }
  };

  const handleClose = () => {
    clearIntervalRef();
    setTotalSeconds(null);
    setSecondsRemaining(0);
    setIsRunning(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.6)"
        justifyContent="center"
        alignItems="center"
        padding="$4"
        onTouchEnd={(e) => e.target === e.currentTarget && handleClose()}
      >
        <YStack
          backgroundColor="$card"
          borderRadius="$4"
          padding="$6"
          width="100%"
          maxWidth={320}
          borderWidth={1}
          borderColor="$borderColor"
          gap="$5"
        >
          <XStack justifyContent="space-between" alignItems="center">
            <AppText variant="h3">Vilotimer</AppText>
            <AppButton variant="ghost" size="sm" onPress={handleClose}>
              Stäng
            </AppButton>
          </XStack>

          <YStack alignItems="center" paddingVertical="$4">
            <Text
              fontSize={48}
              fontWeight="700"
              color="$accent"
              fontVariant={["tabular-nums"]}
            >
              {formatTime(secondsRemaining)}
            </Text>
          </YStack>

          <XStack gap="$2" justifyContent="center">
            {PRESETS.map((s) => (
              <AppButton
                key={s}
                variant={totalSeconds === s ? "primary" : "secondary"}
                size="sm"
                onPress={() => handlePreset(s)}
              >
                {s}s
              </AppButton>
            ))}
          </XStack>

          <XStack gap="$2">
            {isRunning ? (
              <AppButton variant="secondary" flex={1} onPress={handlePause}>
                Pausa
              </AppButton>
            ) : (
              <AppButton
                variant="primary"
                flex={1}
                onPress={handleStart}
                disabled={secondsRemaining === 0}
              >
                Starta
              </AppButton>
            )}
            <AppButton variant="ghost" onPress={handleReset}>
              Återställ
            </AppButton>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
