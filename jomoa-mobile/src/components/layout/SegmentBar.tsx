import React from "react";
import { Pressable, ScrollView } from "react-native";
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
  /** When true, segments scroll horizontally (better for many segments on mobile) */
  scrollable?: boolean;
}

export function SegmentBar<T extends string>({
  segments,
  activeId,
  onSelect,
  scrollable = false,
}: SegmentBarProps<T>) {
  const content = (
    <XStack
      backgroundColor="$surface3"
      borderRadius="$3"
      padding="$1"
      gap="$1"
      flexWrap={scrollable ? "nowrap" : "wrap"}
      flex={scrollable ? 0 : 1}
    >
      {segments.map((seg) => {
        const isActive = seg.id === activeId;
        return (
          <Pressable
            key={seg.id}
            onPress={() => onSelect(seg.id)}
            style={scrollable ? undefined : { flex: 1 }}
          >
            <YStack
              paddingVertical="$2"
              paddingHorizontal="$3"
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
              backgroundColor={isActive ? "$accent" : "transparent"}
              minWidth={scrollable ? 72 : undefined}
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

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}
