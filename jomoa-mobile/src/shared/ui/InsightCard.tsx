import React from "react";
import { YStack, Text } from "tamagui";

import { Card } from "./Card";
import { AppText } from "./AppText";
import { AppIcon, type AppIconName } from "./AppIcon";
import { useTheme } from "../context/ThemeContext";
import { getThemeColors } from "../theme/colors";

/**
 * InsightCard - Card for daily insights and phase knowledge
 * Layout: icon + headline + 2-3 bullet points (per VISUAL_INSPIRATION)
 */

interface InsightCardProps {
  icon?: React.ReactNode;
  iconName?: AppIconName;
  headline: string;
  bullets?: string[];
  body?: string;
  footer?: string;
  onPress?: () => void;
}

export function InsightCard({
  icon,
  iconName,
  headline,
  bullets = [],
  body,
  footer,
  onPress,
}: InsightCardProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const renderIcon = () => {
    if (iconName) {
      return <AppIcon name={iconName} size={24} color={colors.textSecondary} />;
    }
    if (typeof icon === "string" || typeof icon === "number") {
      return <Text fontSize="$xl">{icon}</Text>;
    }
    return icon;
  };

  return (
    <Card pressable={!!onPress} onPress={onPress}>
      <Card.Content>
        <YStack gap="$3">
          <YStack flexDirection="row" alignItems="flex-start" gap="$4">
            <YStack
              width={48}
              height={48}
              borderRadius="$full"
              backgroundColor="$surface3"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              {renderIcon()}
            </YStack>
            <YStack flex={1} gap="$2">
              <AppText variant="h3">{headline}</AppText>
              {body && (
                <AppText variant="small" muted>
                  {body}
                </AppText>
              )}
              {bullets.length > 0 && (
                <YStack gap="$1">
                  {bullets.map((b, i) => (
                    <AppText key={i} variant="caption" muted>
                      • {b}
                    </AppText>
                  ))}
                </YStack>
              )}
              {footer && (
                <AppText variant="caption" muted>
                  {footer}
                </AppText>
              )}
            </YStack>
          </YStack>
        </YStack>
      </Card.Content>
    </Card>
  );
}
