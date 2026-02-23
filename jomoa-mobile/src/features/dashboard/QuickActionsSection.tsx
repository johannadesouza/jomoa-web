import React from "react";
import { YStack, XStack, Text } from "tamagui";

import { Section, Card, AppText } from "../../shared/ui";

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  iconBg?: string;
}

function QuickAction({ icon, label, onPress, iconBg = "$surface3" }: QuickActionProps) {
  return (
    <Card flex={1} pressable minWidth={0} padding="$4" onPress={onPress}>
      <Card.Content padding="$0" alignItems="center" gap="$2">
        <YStack
          width={48}
          height={48}
          borderRadius="$full"
          backgroundColor={iconBg}
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="$borderSoft"
        >
          <Text fontSize="$xl">{icon}</Text>
        </YStack>
        <AppText variant="caption" numberOfLines={1} center>
          {label}
        </AppText>
      </Card.Content>
    </Card>
  );
}

interface QuickActionsSectionProps {
  onLogEnergie: () => void;
  onLogSymptom: () => void;
  onOpenRestTimer: () => void;
  onOpenCalendar: () => void;
}

export function QuickActionsSection({
  onLogEnergie,
  onLogSymptom,
  onOpenRestTimer,
  onOpenCalendar,
}: QuickActionsSectionProps) {
  return (
    <Section title="Snabbåtgärder" subtitle="Logga och planera">
      <XStack gap="$3">
        <QuickAction icon="💚" label="Logga energi" onPress={onLogEnergie} iconBg="$surface3" />
        <QuickAction icon="🌸" label="Logga symptom" onPress={onLogSymptom} iconBg="$surface3" />
        <QuickAction icon="⏱" label="Vilotimer" onPress={onOpenRestTimer} iconBg="$accent" />
        <QuickAction icon="📅" label="Kalender" onPress={onOpenCalendar} iconBg="$surface3" />
      </XStack>
    </Section>
  );
}
