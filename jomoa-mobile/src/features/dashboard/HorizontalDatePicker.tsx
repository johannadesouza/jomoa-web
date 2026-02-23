import React from "react";
import { ScrollView, Pressable } from "react-native";
import { YStack, Text } from "tamagui";

import { AppText } from "../../shared/ui";
import { getLocalDateString } from "../../lib/utils/date";
import { getDatePickerDates } from "./datePickerUtils";

interface HorizontalDatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  daysToShow?: number;
}

export function HorizontalDatePicker({
  selectedDate,
  onDateSelect,
  daysToShow = 14,
}: HorizontalDatePickerProps) {
  const today = new Date();
  const dates = getDatePickerDates(
    today,
    daysToShow,
    -3,
    getLocalDateString
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 4 }}
    >
      {dates.map(({ dateStr, dayName, dayNum, isToday }) => {
        const isSelected = dateStr === selectedDate;
        return (
          <Pressable key={dateStr} onPress={() => onDateSelect(dateStr)}>
            <YStack
              minWidth={48}
              alignItems="center"
              gap="$1"
              paddingHorizontal="$3"
              paddingVertical="$2"
              marginRight="$2"
              borderRadius="$4"
              backgroundColor={isSelected ? "$accent" : isToday ? "$surface3" : "transparent"}
              borderWidth={isSelected ? 0 : 1}
              borderColor="$borderSoft"
            >
              <AppText
              variant="caption"
              color={isSelected || isToday ? "$background" : "$colorSecondary"}
              fontWeight={isToday ? "600" : "500"}
            >
              {dayName}
            </AppText>
            <Text
              fontSize="$5"
              fontWeight="700"
              color={isSelected || isToday ? "$background" : "$color"}
            >
              {dayNum}
            </Text>
            </YStack>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
