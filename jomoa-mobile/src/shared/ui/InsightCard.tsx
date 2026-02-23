import React from "react";
import { YStack, Text } from "tamagui";

import { Card } from "./Card";
import { AppText } from "./AppText";

/**
 * InsightCard - Card for daily insights and phase knowledge
 * Layout: icon + headline + 2-3 bullet points (per VISUAL_INSPIRATION)
 */

interface InsightCardProps {
  icon: React.ReactNode;
  headline: string;
  bullets?: string[];
  body?: string;
  footer?: string;
  onPress?: () => void;
}

export function InsightCard({
  icon,
  headline,
  bullets = [],
  body,
  footer,
  onPress,
}: InsightCardProps) {
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
              {typeof icon === "string" || typeof icon === "number" ? (
                <Text fontSize="$xl">{icon}</Text>
              ) : (
                icon
              )}
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
