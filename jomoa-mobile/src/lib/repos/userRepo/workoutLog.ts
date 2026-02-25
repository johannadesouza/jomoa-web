/**
 * userRepo/workoutLog – thin wrapper runt workoutLogService.
 * All data är persondata och stannar i User DB.
 */
export {
  fetchWeeklyStats,
  fetchInsightStats,
  logWorkoutSession,
  fetchCompletedSessionForDate,
  updateSetLog,
  fetchWorkoutSessionLog,
  fetchSessionHistory,
  fetchExerciseHistory,
  fetchPhaseWorkoutStats,
} from "../../services/workoutLogService";
