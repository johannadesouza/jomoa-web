/**
 * Domain types for Coach Dashboard
 */

export interface ClientNeedingAttention {
  id: string;
  name: string;
  reason: string;
  details?: string;
  workoutLogId?: string;
}

export interface OnboardingTask {
  id: string;
  key: string;
  title: string;
  description: string | null;
  order_index: number;
  status: "pending" | "completed";
  completed_at: string | null;
}

export interface RecentWorkout {
  id: string;
  client_name: string;
  session_name: string;
  date: string;
  status: string;
}

export interface DashboardStats {
  totalClients: number;
  clientsTrainedLast7Days: number;
  clientsWithoutReadinessToday: number;
  recentWorkouts: RecentWorkout[];
  onboardingTasks: OnboardingTask[];
  clientsNeedingAttention: {
    lowReadiness: ClientNeedingAttention[];
    notTrainedRecently: ClientNeedingAttention[];
    incompleteWorkouts: ClientNeedingAttention[];
  };
}

