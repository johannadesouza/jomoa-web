/**
 * Central route map – single source of truth for navigation
 * Use with typed navigation to catch errors at build
 */
import type { RootStackParamList } from "./RootNavigator";
import type { TabParamList } from "./TabNavigator";

export type RootRoute = keyof RootStackParamList;
export type TabRoute = keyof TabParamList;

export const ROUTES = {
  // Auth
  Login: "Login",
  Register: "Register",

  // Main
  Main: "Main",
  HomeTab: "HomeTab",
  TrainTab: "TrainTab",
  LogTab: "LogTab",
  InsightsTab: "InsightsTab",
  LearnTab: "LearnTab",

  // Stack
  Onboarding: "Onboarding",
  WorkoutSession: "WorkoutSession",
  WorkoutPreview: "WorkoutPreview",
  WorkoutSummary: "WorkoutSummary",
  ProgramSelect: "ProgramSelect",
  ProgramList: "ProgramList",
  ProgramDetail: "ProgramDetail",
  Cycle: "Cycle",
  CycleInsights: "CycleInsights",
  Readiness: "Readiness",
  Measurements: "Measurements",
  Calendar: "Calendar",
  Settings: "Settings",
} as const;

export type RouteName = keyof typeof ROUTES;
