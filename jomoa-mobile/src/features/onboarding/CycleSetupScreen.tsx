import React, { useState, useMemo } from "react";
import { YStack, XStack } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, Keyboard, TouchableWithoutFeedback } from "react-native";

import {
  Screen,
  AppText,
  AppButton,
  Card,
  AppIcon,
} from "../../shared/ui";
import { OnboardingStackParamList } from "./OnboardingNavigator";
import { useOnboarding } from "./OnboardingContext";
import { OnboardingStepDots } from "./OnboardingStepDots";
import { useOnboardingCopy, getCopy } from "../../lib/hooks/useOnboardingCopy";
import { getLocalDateString } from "../../lib/utils/date";

type Props = NativeStackScreenProps<OnboardingStackParamList, "CycleSetup">;

const MONTH_NAMES = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
const WEEKDAY_LABELS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

/** First day of month for a given date */
function firstOfMonth(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), 1);
  return out;
}

/** Add months (handles year rollover) */
function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

/** Calendar cell: either empty or a day with YYYY-MM-DD */
type CalendarCell = { type: "empty" } | { type: "day"; dateStr: string; day: number };

/** Build weeks for a month (Monday = first column). Each week is 7 cells. */
function getCalendarWeeks(year: number, month: number): CalendarCell[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const lastDay = last.getDate();
  // Monday = 0: (getDay() + 6) % 7
  const startPadding = ((first.getDay() + 6) % 7);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < startPadding; i++) cells.push({ type: "empty" });
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = getLocalDateString(new Date(year, month, d));
    cells.push({ type: "day", dateStr, day: d });
  }
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7);
    while (row.length < 7) row.push({ type: "empty" });
    weeks.push(row);
  }
  return weeks;
}

const CALENDAR_MONTHS_BACK = 3;

export function CycleSetupScreen({ navigation }: Props) {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const copy = useOnboardingCopy("sv");
  const today = useMemo(() => new Date(), []);
  const todayStr = getLocalDateString(today);
  const minDate = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - CALENDAR_MONTHS_BACK);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today]);
  const minDateStr = getLocalDateString(minDate);

  const [displayMonth, setDisplayMonth] = useState(() =>
    data.lastPeriodStart
      ? (() => {
          const d = new Date(data.lastPeriodStart + "T12:00:00");
          return firstOfMonth(d);
        })()
      : firstOfMonth(today)
  );
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(data.lastPeriodStart ?? null);

  const isCycleOnly = data.onboardingPath === "cycle_only";
  const isBoth = data.onboardingPath === "both";
  const wantsTracking = isCycleOnly || isBoth || data.wantsCycleTracking === true;
  const showCycleYesNo = !isCycleOnly && !isBoth;

  const handleSelect = (value: boolean | null) => {
    updateData({ wantsCycleTracking: value });
    if (value === false) {
      updateData({ lastPeriodStart: null });
      setSelectedDateStr(null);
    }
  };

  const canPrevMonth = displayMonth > firstOfMonth(minDate);
  const canNextMonth = firstOfMonth(displayMonth).getTime() < firstOfMonth(today).getTime();

  const handlePrevMonth = () => {
    if (canPrevMonth) setDisplayMonth(addMonths(displayMonth, -1));
  };
  const handleNextMonth = () => {
    if (canNextMonth) setDisplayMonth(addMonths(displayMonth, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  const handleSkipDate = () => {
    setSelectedDateStr(null);
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    if (wantsTracking && selectedDateStr) {
      updateData({ lastPeriodStart: selectedDateStr });
    } else if (wantsTracking) {
      updateData({ lastPeriodStart: null });
    }
    setCurrentStep(isCycleOnly ? 3 : 4);
    navigation.navigate("Complete");
  };

  const calendarWeeks = useMemo(
    () => getCalendarWeeks(displayMonth.getFullYear(), displayMonth.getMonth()),
    [displayMonth]
  );

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Screen padded>
        <YStack flex={1} justifyContent="space-between">
          <YStack gap="$6" paddingTop="$4">
            <YStack gap="$2">
              <AppText variant="h1">
              {isCycleOnly
                ? getCopy(copy, "cycle_setup_title_cycle_only", "Logga din period")
                : isBoth
                  ? getCopy(copy, "cycle_setup_title_both", "Senaste period")
                  : getCopy(copy, "cycle_setup_title", "Menscykel")}
            </AppText>
            <AppText variant="body" muted>
              {isCycleOnly
                ? getCopy(copy, "cycle_setup_subtitle_cycle_only", "När började din senaste period? Vi anpassar rekommendationer utifrån din cykelfas.")
                : isBoth
                  ? getCopy(copy, "cycle_setup_subtitle_both", "När började din senaste period? (valfritt) Vi anpassar träning och återhämtning utifrån din cykelfas. Du kan logga senare under Inställningar → Menscykel.")
                  : getCopy(copy, "cycle_setup_subtitle", "Vill du spåra din cykel för anpassade träningsrekommendationer?")}
            </AppText>
          </YStack>

          {showCycleYesNo && (
          <YStack gap="$2">
            <Pressable onPress={() => handleSelect(true)}>
              <Card
                backgroundColor={
                  wantsTracking ? "$accent" : "$backgroundStrong"
                }
                borderColor={wantsTracking ? "$accent" : "$borderColor"}
                borderWidth={1}
              >
                <Card.Content>
                  <XStack gap="$3" alignItems="center">
                    <AppText variant="h2">🌙</AppText>
                    <YStack flex={1}>
                      <AppText
                        variant="h3"
                        color={wantsTracking ? "$background" : "$color"}
                      >
                        Ja, spåra min cykel
                      </AppText>
                      <AppText
                        variant="small"
                        color={wantsTracking ? "$background" : "$colorSecondary"}
                      >
                        Få rekommendationer utifrån din fas
                      </AppText>
                    </YStack>
                  </XStack>
                </Card.Content>
              </Card>
            </Pressable>

            <Pressable onPress={() => handleSelect(false)}>
              <Card
                backgroundColor={
                  data.wantsCycleTracking === false ? "$accent" : "$backgroundStrong"
                }
                borderColor={
                  data.wantsCycleTracking === false ? "$accent" : "$borderColor"
                }
                borderWidth={1}
              >
                <Card.Content>
                  <XStack gap="$3" alignItems="center">
                    <AppText variant="h2">✗</AppText>
                    <YStack flex={1}>
                      <AppText
                        variant="h3"
                        color={
                          data.wantsCycleTracking === false
                            ? "$background"
                            : "$color"
                        }
                      >
                        Nej, tack
                      </AppText>
                      <AppText
                        variant="small"
                        color={
                          data.wantsCycleTracking === false
                            ? "$background"
                            : "$colorSecondary"
                        }
                      >
                        Jag vill inte spåra min cykel
                      </AppText>
                    </YStack>
                  </XStack>
                </Card.Content>
              </Card>
            </Pressable>
          </YStack>
          )}

          {wantsTracking && (
              <YStack gap="$3" marginTop={isCycleOnly || isBoth ? 0 : "$2"} padding="$4" backgroundColor="$surface3" borderRadius="$3">
                <AppText variant="small" muted>
                  {isCycleOnly
                    ? "Tryck på dagen när din senaste period började"
                    : "Tryck på dagen när din senaste period började (valfritt)"}
                </AppText>

                <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
                  <Pressable onPress={handlePrevMonth} disabled={!canPrevMonth} hitSlop={12}>
                    <AppIcon
                      name="chevron-back"
                      size={24}
                      color={canPrevMonth ? "$color" : "$colorSecondary"}
                    />
                  </Pressable>
                  <AppText variant="body" fontWeight="600">
                    {MONTH_NAMES[displayMonth.getMonth()]} {displayMonth.getFullYear()}
                  </AppText>
                  <Pressable onPress={handleNextMonth} disabled={!canNextMonth} hitSlop={12}>
                    <AppIcon
                      name="chevron-forward"
                      size={24}
                      color={canNextMonth ? "$color" : "$colorSecondary"}
                    />
                  </Pressable>
                </XStack>

                <XStack gap="$1" marginBottom="$1">
                  {WEEKDAY_LABELS.map((label) => (
                    <YStack key={label} flex={1} alignItems="center">
                      <AppText variant="caption" muted>{label}</AppText>
                    </YStack>
                  ))}
                </XStack>

                <YStack gap="$1">
                  {calendarWeeks.map((week, wi) => (
                    <XStack key={wi} gap="$1">
                      {week.map((cell, ci) => {
                        if (cell.type === "empty") {
                          return <YStack key={ci} flex={1} aspectRatio={1} />;
                        }
                        const { dateStr, day } = cell;
                        const isSelected = selectedDateStr === dateStr;
                        const isSelectable = dateStr <= todayStr && dateStr >= minDateStr;
                        return (
                          <Pressable
                            key={ci}
                            onPress={() => isSelectable && handleSelectDay(dateStr)}
                            style={{ flex: 1 }}
                          >
                            <YStack
                              aspectRatio={1}
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="$2"
                              backgroundColor={isSelected ? "$accent" : "transparent"}
                              opacity={isSelectable ? 1 : 0.4}
                            >
                              <AppText
                                variant="small"
                                fontWeight={isSelected ? "600" : "400"}
                                color={isSelected ? "$background" : "$color"}
                              >
                                {day}
                              </AppText>
                            </YStack>
                          </Pressable>
                        );
                      })}
                    </XStack>
                  ))}
                </YStack>

                <Pressable onPress={handleSkipDate}>
                  <AppText variant="small" color="$accent">
                    Fyll i senare – hoppa över
                  </AppText>
                </Pressable>
                <AppText variant="caption" muted>
                  Du kan alltid logga detta senare under Inställningar → Menscykel
                </AppText>
              </YStack>
            )}
        </YStack>

        <YStack gap="$4" paddingBottom="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleContinue}
          >
            Fortsätt
          </AppButton>
          <AppButton
            variant="ghost"
            size="md"
            fullWidth
            onPress={handleBack}
          >
            Tillbaka
          </AppButton>
          <OnboardingStepDots path={data.onboardingPath} screen="CycleSetup" />
        </YStack>
      </YStack>
    </Screen>
    </TouchableWithoutFeedback>
  );
}
