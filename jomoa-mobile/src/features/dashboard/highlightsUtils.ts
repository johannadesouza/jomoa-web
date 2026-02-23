/**
 * Pure logic for HighlightsSection – testable without Tamagui
 */

export interface HighlightItem {
  value: string | number;
  label: string;
  iconName?: string; // Ionicons name, e.g. "barbell-outline"
}

export interface HighlightsInput {
  sessionsThisMonth: number;
  totalVolume: number;
  streak: number;
  weeklyWorkouts: number;
}

export function getHighlightItems(input: HighlightsInput): HighlightItem[] {
  const { sessionsThisMonth, totalVolume, streak, weeklyWorkouts } = input;
  return [
    { value: sessionsThisMonth, label: "Pass denna månad", iconName: "barbell-outline" },
    { value: Math.round(totalVolume), label: "Volym (kg)", iconName: "bar-chart-outline" },
    {
      value: streak,
      label: streak === 1 ? "Dag streak" : "Dagars streak",
      iconName: "flame-outline",
    },
    { value: weeklyWorkouts, label: "Pass denna vecka", iconName: "calendar-outline" },
  ];
}
