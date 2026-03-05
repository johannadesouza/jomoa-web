import React from "react";
import { YStack, XStack } from "tamagui";

import { Section, Card, AppText, AppIcon, type AppIconName } from "../../shared/ui";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

interface QuickActionProps {
  iconName: AppIconName;
  label: string;
  onPress: () => void;
  iconBg?: string;
}

function QuickAction({ iconName, label, onPress, iconBg = "$surface3" }: QuickActionProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
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
          <AppIcon name={iconName} size={22} color={colors.textPrimary} />
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
  /** False för män – döljer "Logga symptom" (cykel/symtom). */
  showSymptomLog?: boolean;
}

export function QuickActionsSection({
  onLogEnergie,
  onLogSymptom,
  onOpenRestTimer,
  onOpenCalendar,
  showSymptomLog = true,
}: QuickActionsSectionProps) {
  const actions = [
    <QuickAction key="checkin" iconName="heart-outline" label="Check-in" onPress={onLogEnergie} iconBg="$surface3" />,
    ...(showSymptomLog
      ? [<QuickAction key="symptom" iconName="leaf-outline" label="Logga symptom" onPress={onLogSymptom} iconBg="$surface3" />]
      : []),
    <QuickAction key="timer" iconName="timer-outline" label="Vilotimer" onPress={onOpenRestTimer} iconBg="$accent" />,
    <QuickAction key="calendar" iconName="calendar-outline" label="Kalender" onPress={onOpenCalendar} iconBg="$surface3" />,
  ];
  return (
    <Section title="Snabbåtgärder" subtitle="Logga och planera">
      <XStack gap="$3">
        {actions}
      </XStack>
    </Section>
  );
}
