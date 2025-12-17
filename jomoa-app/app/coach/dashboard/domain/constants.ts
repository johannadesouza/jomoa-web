/**
 * Constants for Coach Dashboard
 */

export const ONBOARDING_TASK_KEYS = {
  CREATE_CLIENT: "create_client",
  CREATE_PROGRAM: "create_program",
  ADD_SESSIONS: "add_sessions",
  ASSIGN_PROGRAM: "assign_program",
  CLIENT_FIRST_WORKOUT: "client_first_workout",
} as const;

export const WORKOUT_STATUS = {
  COMPLETED: "genomfört",
  STARTED: "påbörjad",
} as const;

export const READINESS_THRESHOLD = 2;
export const DAYS_FOR_RECENT_TRAINING = 7;

