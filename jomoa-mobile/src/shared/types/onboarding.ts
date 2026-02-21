/**
 * Types for onboarding flow
 */

export type TrainingGoal = 
  | "muscle_growth" 
  | "strength" 
  | "fat_loss" 
  | "performance" 
  | "maintenance";

export type TrainingLevel = "beginner" | "intermediate" | "advanced";

export type EquipmentAccess = "home" | "gym" | "both";

export type PlanStyle = "strict" | "flexible";

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Monday, 7 = Sunday

export interface OnboardingData {
  // Step 1: Goals
  primaryGoal: TrainingGoal | null;
  secondaryGoals: TrainingGoal[];
  trainingLevel: TrainingLevel | null; // beginner, intermediate, advanced

  // Step 2: Lifestyle
  trainingFrequency: number | null; // Days per week
  sessionDuration: number | null; // Minutes (30, 45, 60, 75+)
  equipmentAccess: EquipmentAccess | null;
  stressLevel: number | null; // 1-5
  travelsOften: boolean | null;

  // Step 3: Training days
  trainingDays: DayOfWeek[];
  canMoveSessions: boolean | null;

  // Step 4: Plan style
  planStyle: PlanStyle | null;

  // Step 5: Program (selected program ID)
  selectedProgramId: string | null;

  // Step 6: Cycle setup
  wantsCycleTracking: boolean | null;
  lastPeriodStart: string | null; // Date string (YYYY-MM-DD)
  cycleLength: number | null; // Days (default 28)
  irregularCycle: boolean | null;
  noPeriod: boolean | null;
  periMenopause: boolean | null;
}

export interface OnboardingProfileData {
  // Profile fields
  full_name: string;
  date_of_birth: string | null; // Calculated from age
  age: number | null;

  // Client fields (stored in clients table)
  training_level: TrainingLevel | null;
  training_frequency: number | null;
  equipment_access: EquipmentAccess | null;
  primary_goal: TrainingGoal | null;
  secondary_goals: TrainingGoal[] | null;
  injury_history: string | null;
  previous_experience: string | null;
  no_period: boolean | null;
  pcos: boolean | null;
  peri_menopause: boolean | null;
  cycle_length: number | null;
  irregular_cycle: boolean | null;
  plan_style: PlanStyle | null;
  can_move_sessions: boolean | null;
  training_days: DayOfWeek[] | null;
}

