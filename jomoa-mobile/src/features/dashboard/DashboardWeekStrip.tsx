import React from "react";
import { Pressable } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { Section, Card, AppText } from "../../shared/ui";
import { getDateForWeekDay, addDaysToDateStr } from "../../lib/utils/date";
import type { WeekDay } from "../../lib/hooks/useDashboard";

function SessionIndicator({ hasSession }: { hasSession: boolean }) {
  if (!hasSession) return null;
  return (
    <YStack
      width={6}
      height={6}
      borderRadius="$full"
      backgroundColor="$accent"
    />
  );
}

export interface DashboardWeekStripProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  weekDays: WeekDay[];
  onViewCalendar: () => void;
}

export function DashboardWeekStrip({
  selectedDate,
  onSelectedDateChange,
  weekDays,
  onViewCalendar,
}: DashboardWeekStripProps) {
  return (
    <Section
      title="Vecka"
      viewAllLabel="Kalender"
      onViewAll={onViewCalendar}
    >
      <Card>
        <Card.Content>
          <XStack alignItems="center" gap="$2" marginBottom="$3">
            <Pressable
              onPress={() => onSelectedDateChange(addDaysToDateStr(selectedDate, -7))}
              hitSlop={12}
            >
              <AppText variant="body" color="$textSecondary">‹</AppText>
            </Pressable>
            <AppText variant="small" muted flex={1} textAlign="center">
              {getDateForWeekDay(selectedDate, 1).slice(-2).replace(/^0/, "")}–{getDateForWeekDay(selectedDate, 7).slice(-2).replace(/^0/, "")}
            </AppText>
            <Pressable
              onPress={() => onSelectedDateChange(addDaysToDateStr(selectedDate, 7))}
              hitSlop={12}
            >
              <AppText variant="body" color="$textSecondary">›</AppText>
            </Pressable>
          </XStack>
          <XStack justifyContent="space-between">
            {weekDays.map((day) => {
              const dayDateStr = getDateForWeekDay(selectedDate, day.dayOfWeek);
              const isSelected = dayDateStr === selectedDate;
              const dayNum = dayDateStr.slice(-2).replace(/^0/, "");
              return (
                <Pressable
                  key={day.dayOfWeek}
                  onPress={() => onSelectedDateChange(dayDateStr)}
                >
                  <YStack
                    alignItems="center"
                    gap="$1"
                    opacity={day.session ? 1 : 0.4}
                  >
                    <YStack
                      width={40}
                      height={40}
                      borderRadius="$full"
                      backgroundColor={
                        isSelected
                          ? "$accent"
                          : day.isToday
                          ? "$surface3"
                          : day.session
                          ? "$surface3"
                          : "transparent"
                      }
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={isSelected || day.isToday ? 0 : 1}
                      borderColor="$borderSoft"
                    >
                      <Text
                        fontSize="$xs"
                        fontWeight="600"
                        color={isSelected || day.isToday ? "$background" : "$textPrimary"}
                      >
                        {day.shortName}
                      </Text>
                      <Text
                        fontSize={10}
                        fontWeight="500"
                        color={isSelected || day.isToday ? "$background" : "$textMuted"}
                      >
                        {dayNum}
                      </Text>
                    </YStack>
                    <SessionIndicator hasSession={!!day.session} />
                  </YStack>
                </Pressable>
              );
            })}
          </XStack>
        </Card.Content>
      </Card>
    </Section>
  );
}
