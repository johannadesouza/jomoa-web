/**
 * Recent workouts section for Coach Dashboard
 */

import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { DASHBOARD_COPY } from "../copy";
import type { RecentWorkout } from "../domain/types";

interface RecentWorkoutsSectionProps {
  workouts: RecentWorkout[];
}

export function RecentWorkoutsSection({ workouts }: RecentWorkoutsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_COPY.recentWorkouts.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts && workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-3 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#5A6B5D]">{workout.client_name}</p>
                  <p className="text-xs text-[#5A6B5D]/70 mt-1">
                    {workout.session_name} • {new Date(workout.date).toLocaleDateString("sv-SE")}
                  </p>
                </div>
                <Chip variant="success">{DASHBOARD_COPY.recentWorkouts.completed}</Chip>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-[#5A6B5D]/70">{DASHBOARD_COPY.recentWorkouts.noWorkouts}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

