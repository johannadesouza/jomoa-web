/**
 * HormoneGraph – Östrogen och progesteron över cykeln
 * View-based bar visualization, no SVG
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { YStack, XStack } from "tamagui";

import { AppText } from "../../shared/ui";
import { getHormoneLevels } from "../../lib/data/hormoneCycleData";

const ESTROGEN_COLOR = "#D96D46";
const PROGESTERONE_COLOR = "#976568";
const GRAPH_HEIGHT = 48;

interface HormoneGraphProps {
  cycleDay: number;
  cycleLength?: number;
}

const DISPLAY_DAYS = 28;

export function HormoneGraph({ cycleDay, cycleLength = 28 }: HormoneGraphProps) {
  const levels = getHormoneLevels(DISPLAY_DAYS);
  const currentSlot =
    cycleDay > 0 && cycleLength > 0
      ? Math.min(
          Math.max(1, Math.round((cycleDay / cycleLength) * DISPLAY_DAYS)),
          DISPLAY_DAYS
        )
      : 0;

  return (
    <YStack gap="$2">
      <View style={styles.graphRow}>
        {levels.map(({ day, estrogen: e, progesterone: p }) => {
          const isCurrentDay = day === currentSlot;
          const eH = Math.max(2, (e / 1) * (GRAPH_HEIGHT * 0.5));
          const pH = Math.max(2, (p / 1) * (GRAPH_HEIGHT * 0.6));
          return (
            <View
              key={day}
              style={[styles.dayCol, isCurrentDay && styles.currentCol]}
            >
              <View style={[styles.bar, styles.progBar, { height: pH }]} />
              <View style={[styles.bar, styles.estBar, { height: eH }]} />
            </View>
          );
        })}
      </View>
      <XStack justifyContent="space-between" alignItems="center" paddingTop="$1">
        <XStack gap="$3" alignItems="center">
          <View style={[styles.legendDot, { backgroundColor: ESTROGEN_COLOR }]} />
          <AppText variant="caption" muted fontSize={10}>Östrogen</AppText>
          <View style={[styles.legendDot, { backgroundColor: PROGESTERONE_COLOR }]} />
          <AppText variant="caption" muted fontSize={10}>Progesteron</AppText>
        </XStack>
        <AppText variant="caption" fontWeight="600" color="$accent">
          Dag {cycleDay}
        </AppText>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  graphRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: GRAPH_HEIGHT,
    gap: 2,
  },
  dayCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 1,
  },
  currentCol: {
    backgroundColor: "rgba(217, 109, 70, 0.2)",
    borderRadius: 2,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  },
  estBar: { backgroundColor: ESTROGEN_COLOR },
  progBar: { backgroundColor: PROGESTERONE_COLOR },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
