/**
 * Pure logic for HighlightsSection – testable without Tamagui
 */

export interface HighlightItem {
  value: string | number;
  label: string;
  icon?: string;
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
    { value: sessionsThisMonth, label: "Pass denna månad", icon: "💪" },
    { value: Math.round(totalVolume), label: "Volym (kg)", icon: "📊" },
    {
      value: streak,
      label: streak === 1 ? "Dag streak" : "Dagars streak",
      icon: "🔥",
    },
    { value: weeklyWorkouts, label: "Pass denna vecka", icon: "📅" },
  ];
}
