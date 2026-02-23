/**
 * Awards logic – Fas C, gamification badges
 */

export interface Award {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface AwardsInput {
  streak: number;
  sessionsThisMonth: number;
}

export function getEarnedAwards(input: AwardsInput): Award[] {
  const { streak, sessionsThisMonth } = input;
  const earned: Award[] = [];

  if (streak >= 1) {
    earned.push({
      id: "streak_1",
      label: streak === 1 ? "1 Dag streak" : `${streak} Dagar streak`,
      icon: "🔥",
      description: "Konsekvent träning",
    });
  }
  if (streak >= 7) {
    earned.push({
      id: "streak_7",
      label: "1 Vecka streak",
      icon: "⭐",
      description: "En hel vecka i rad",
    });
  }
  if (streak >= 14) {
    earned.push({
      id: "streak_14",
      label: "2 Veckor streak",
      icon: "🌟",
      description: "Fantastiskt jobbat",
    });
  }
  if (sessionsThisMonth >= 5) {
    earned.push({
      id: "sessions_5",
      label: `${sessionsThisMonth} Pass denna månad`,
      icon: "💪",
      description: "Bra volym denna månad",
    });
  }
  if (sessionsThisMonth >= 10) {
    earned.push({
      id: "sessions_10",
      label: "10+ Pass i månaden",
      icon: "🏆",
      description: "Imponerande träningsvilja",
    });
  }

  return earned;
}
