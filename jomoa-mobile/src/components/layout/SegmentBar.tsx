import React from "react";
import { Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import { AppText } from "../../shared/ui";

export interface SegmentItem<T extends string = string> {
  id: T;
  label: string;
}

interface SegmentBarProps<T extends string> {
  segments: SegmentItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
}

export function SegmentBar<T extends string>({
  segments,
  activeId,
  onSelect,
}: SegmentBarProps<T>) {
  return (
    <XStack
      backgroundColor="$surface3"
      borderRadius="$3"
      padding="$1"
      gap="$1"
    >
      {segments.map((seg) => {
        const isActive = seg.id === activeId;
        return (
          <Pressable
            key={seg.id}
            onPress={() => onSelect(seg.id)}
            style={{ flex: 1 }}
          >
            <YStack
              paddingVertical="$2"
              paddingHorizontal="$3"
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
              backgroundColor={isActive ? "$accent" : "transparent"}
            >
              <AppText
                variant="small"
                fontWeight={isActive ? "600" : "400"}
                color={isActive ? "$background" : "$color"}
              >
                {seg.label}
              </AppText>
            </YStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}
