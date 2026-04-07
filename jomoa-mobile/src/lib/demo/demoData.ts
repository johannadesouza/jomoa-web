import type { DemoPersona } from "./demoMode";
import type { ReadinessRecord } from "../services/readinessService";
import type { WorkoutStats } from "../services/workoutLogService";
import type { ProgramAssignmentData } from "../services/programService";

export type DemoCycleData = {
  startDate: string; // YYYY-MM-DD
  cycleLength: number;
  mode: "regular" | "missing_period" | "perimenopause";
};

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

export function getDemoAssignment(_persona: DemoPersona): ProgramAssignmentData | null {
  // Default: no active assignment so the demo never depends on specific program IDs.
  // Users can still browse programs from Content DB.
  return null;
}

export function getDemoWorkoutStats(persona: DemoPersona): WorkoutStats {
  if (persona === "strength_3x") return { weeklyWorkouts: 2, streak: 4 };
  if (persona === "cycle_only") return { weeklyWorkouts: 0, streak: 0 };
  return { weeklyWorkouts: 1, streak: 2 };
}

export function getDemoReadiness(persona: DemoPersona, date = todayString()): ReadinessRecord | null {
  const base = {
    id: `demo_readiness_${persona}_${date}`,
    client_id: `demo_${persona}`,
    date,
    created_at: isoNow(),
    updated_at: isoNow(),
  };

  if (persona === "cycle_only") {
    return {
      ...base,
      sleep_hours: 7,
      sleep_quality: 7,
      stress_level: 4,
      energy_level: 7,
      soreness: 2,
      readiness_score: 78,
    };
  }

  if (persona === "perimenopause") {
    return {
      ...base,
      sleep_hours: 6,
      sleep_quality: 5,
      stress_level: 6,
      energy_level: 5,
      soreness: 6,
      readiness_score: 52,
    };
  }

  return {
    ...base,
    sleep_hours: 7.5,
    sleep_quality: 8,
    stress_level: 3,
    energy_level: 8,
    soreness: 4,
    readiness_score: 82,
  };
}

export function getDemoCycle(persona: DemoPersona, today = todayString()): DemoCycleData | null {
  if (persona === "cycle_only") {
    // show a clear cycle state in the demo
    return { startDate: shiftDays(today, -12), cycleLength: 28, mode: "regular" };
  }
  if (persona === "perimenopause") {
    return { startDate: shiftDays(today, -45), cycleLength: 35, mode: "perimenopause" };
  }
  return { startDate: shiftDays(today, -8), cycleLength: 28, mode: "regular" };
}

function shiftDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

