/**
 * OverdueBanner – shown on Dashboard/CycleScreen when cycle is overdue.
 * Soft: amber tone, gentle reminder.
 * Hard: stronger tone, encourages logging.
 * Dismissed per session only (re-shows next day / on next mount).
 */
import React, { useState } from "react";
import { Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import { AppText, AppIcon } from "../../shared/ui";
import type { OverdueState } from "../../lib/utils/cycleEngine";

interface OverdueBannerProps {
  overdueState: OverdueState;
  onLogPeriod?: () => void;
}

export function OverdueBanner({ overdueState, onLogPeriod }: OverdueBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (overdueState === "none" || dismissed) return null;

  const isSoft = overdueState === "soft";

  return (
    <Pressable onPress={onLogPeriod ?? undefined}>
      <XStack
        backgroundColor={isSoft ? "$warningSubtle" : "$errorSubtle"}
        borderLeftWidth={4}
        borderLeftColor={isSoft ? "$warning" : "$error"}
        borderRadius="$3"
        padding="$3"
        gap="$3"
        alignItems="flex-start"
      >
        <AppIcon
          name={isSoft ? "time-outline" : "alert-circle-outline"}
          size={20}
          color={isSoft ? "#C9843A" : "#C0392B"}
        />

        <YStack flex={1} gap="$1">
          <AppText variant="small" fontWeight="600" color={isSoft ? "#C9843A" : "#C0392B"}>
            {isSoft ? "Cykeln är lite längre än vanligt" : "Cykeln är märkbart längre än ditt mönster"}
          </AppText>
          <AppText variant="caption" muted>
            {isSoft
              ? "Logga period start om den börjat."
              : "Din cykel är betydligt längre än ditt vanliga mönster. Det kan påverka energi och återhämtning."}
          </AppText>
          {onLogPeriod && (
            <AppText variant="caption" color={isSoft ? "#C9843A" : "#C0392B"} fontWeight="600">
              Tryck för att logga period →
            </AppText>
          )}
        </YStack>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          hitSlop={12}
        >
          <AppIcon name="close-outline" size={18} />
        </Pressable>
      </XStack>
    </Pressable>
  );
}
