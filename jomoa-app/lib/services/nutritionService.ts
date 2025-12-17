/**
 * Nutrition Service
 * Helper functions for calculating daily nutrition targets from plans and periods
 */

interface NutritionPeriod {
  id: string;
  nutrition_plan_id: string;
  name: string;
  period_type: "deficit" | "maintenance" | "surplus";
  start_date: string;
  end_date: string;
  target_rate_kg_per_week: number | null;
}

interface DailyTarget {
  target_kcal: number;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  period_id: string | null;
  is_auto_adjusted_from_cycle: boolean;
}

/**
 * Calculate daily kcal target from period
 * Simple calculation: maintenance kcal + adjustment based on target_rate_kg_per_week
 * 
 * Note: This is a simplified calculation. In production, you'd want:
 * - Client's TDEE (Total Daily Energy Expenditure)
 * - Activity level
 * - Body composition
 * - More sophisticated calculations
 * 
 * For MVP, we'll use a simple approach:
 * - Maintenance: ~2000 kcal (placeholder, should come from client profile)
 * - Deficit: -500 kcal per day for ~0.5 kg/week loss
 * - Surplus: +500 kcal per day for ~0.5 kg/week gain
 */
export function calculateDailyKcalFromPeriod(
  period: NutritionPeriod,
  maintenanceKcal: number = 2000 // Placeholder - should come from client profile
): number {
  if (period.period_type === "maintenance") {
    return maintenanceKcal;
  }

  // If target_rate is specified, use it
  if (period.target_rate_kg_per_week !== null) {
    // 1 kg fat ≈ 7700 kcal
    // So for 0.5 kg/week = 3850 kcal/week = ~550 kcal/day
    const weeklyKcalAdjustment = period.target_rate_kg_per_week * 7700;
    const dailyKcalAdjustment = weeklyKcalAdjustment / 7;
    return Math.round(maintenanceKcal + dailyKcalAdjustment);
  }

  // Default adjustments if no target_rate
  if (period.period_type === "deficit") {
    return maintenanceKcal - 500; // ~0.5 kg/week loss
  }

  if (period.period_type === "surplus") {
    return maintenanceKcal + 500; // ~0.5 kg/week gain
  }

  return maintenanceKcal;
}

/**
 * Calculate daily macro targets from kcal
 * Simple split: 30% protein, 40% carbs, 30% fat
 * 
 * Note: In production, this should be customizable per client/plan
 */
export function calculateMacrosFromKcal(kcal: number): {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
} {
  // Protein: 4 kcal/g, 30% of total
  const proteinKcal = kcal * 0.3;
  const protein_g = Math.round(proteinKcal / 4);

  // Carbs: 4 kcal/g, 40% of total
  const carbsKcal = kcal * 0.4;
  const carbs_g = Math.round(carbsKcal / 4);

  // Fat: 9 kcal/g, 30% of total
  const fatKcal = kcal * 0.3;
  const fat_g = Math.round(fatKcal / 9);

  return {
    protein_g,
    carbs_g,
    fat_g,
  };
}

/**
 * Find which period a date falls into
 */
export function findPeriodForDate(
  periods: NutritionPeriod[],
  date: Date
): NutritionPeriod | null {
  const dateStr = date.toISOString().split("T")[0];

  for (const period of periods) {
    if (dateStr >= period.start_date && dateStr <= period.end_date) {
      return period;
    }
  }

  return null;
}

/**
 * Calculate cycle-aware adjustment for kcal
 * Based on cycle phase, adjust calories
 */
export function calculateCycleAdjustment(
  phaseEnum: string | null,
  baseKcal: number,
  enableCycleAdjustments: boolean = false
): { adjustedKcal: number; adjustment: number } {
  if (!enableCycleAdjustments || !phaseEnum) {
    return { adjustedKcal: baseKcal, adjustment: 0 };
  }

  let adjustment = 0;

  // Luteal phase: högre kcal (+100-200 kcal)
  if (phaseEnum === "luteal") {
    adjustment = 150; // +150 kcal
  }
  // Mens phase: kan behöva lite mer energi (+50-100 kcal)
  else if (phaseEnum === "menstruation") {
    adjustment = 75; // +75 kcal
  }
  // Follikulär och ovulation: ingen justering (eller lätt minskning om i deficit)
  // För nu behåller vi baseKcal

  const adjustedKcal = Math.round(baseKcal + adjustment);
  return { adjustedKcal, adjustment };
}

/**
 * Check if date is a training day
 * Simple check: if there's a workout session scheduled for this date
 */
export function isTrainingDay(
  date: Date,
  workoutSessions: Array<{ day_of_week: number; week_number: number }>,
  programStartDate: string
): boolean {
  // For MVP, we'll assume all days in a program week are training days
  // In production, this should check actual scheduled sessions
  return true; // Simplified for MVP
}

/**
 * Calculate daily target for a specific date
 * Includes cycle-aware adjustments if enabled
 */
export function calculateDailyTarget(
  periods: NutritionPeriod[],
  date: Date,
  maintenanceKcal: number = 2000,
  cyclePhase: string | null = null,
  enableCycleAdjustments: boolean = false
): DailyTarget | null {
  const period = findPeriodForDate(periods, date);

  if (!period) {
    return null;
  }

  // Calculate base kcal from period
  let targetKcal = calculateDailyKcalFromPeriod(period, maintenanceKcal);

  // Apply cycle-aware adjustments if enabled
  let isAutoAdjusted = false;
  if (enableCycleAdjustments && cyclePhase) {
    const { adjustedKcal, adjustment } = calculateCycleAdjustment(
      cyclePhase,
      targetKcal,
      enableCycleAdjustments
    );
    if (adjustment !== 0) {
      targetKcal = adjustedKcal;
      isAutoAdjusted = true;
    }
  }

  // Calculate macros from adjusted kcal
  const macros = calculateMacrosFromKcal(targetKcal);

  return {
    target_kcal: targetKcal,
    target_protein_g: macros.protein_g,
    target_carbs_g: macros.carbs_g,
    target_fat_g: macros.fat_g,
    period_id: period.id,
    is_auto_adjusted_from_cycle: isAutoAdjusted,
  };
}

