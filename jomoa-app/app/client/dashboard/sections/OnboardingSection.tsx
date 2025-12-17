/**
 * Onboarding checklist section for Client Dashboard
 */

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { DASHBOARD_COPY } from "../copy";
import { ONBOARDING_TASK_KEYS } from "../domain/constants";
import type { OnboardingTask, ProgramSession } from "../domain/types";

interface OnboardingSectionProps {
  tasks: OnboardingTask[];
  displaySession: ProgramSession | null;
  onStartSession: (sessionId: string) => void;
  onLogReadiness: () => void;
}

export function OnboardingSection({
  tasks,
  displaySession,
  onStartSession,
  onLogReadiness,
}: OnboardingSectionProps) {
  const router = useRouter();

  if (tasks.length === 0 || tasks.every((t) => t.status === "completed")) {
    return null;
  }

  const getTaskAction = (task: OnboardingTask) => {
    switch (task.key) {
      case ONBOARDING_TASK_KEYS.LOG_READINESS:
        return { label: DASHBOARD_COPY.onboarding.actions.logReadiness, onClick: onLogReadiness };
      case ONBOARDING_TASK_KEYS.LOG_PERIOD_START:
        return { label: DASHBOARD_COPY.onboarding.actions.logPeriodStart, onClick: () => router.push("/client/cycle") };
      case ONBOARDING_TASK_KEYS.START_WORKOUT:
        return displaySession
          ? { label: DASHBOARD_COPY.onboarding.actions.startWorkout, onClick: () => onStartSession(displaySession.id) }
          : null;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardHeader>
        <CardTitle>{DASHBOARD_COPY.onboarding.title}</CardTitle>
        <p className="text-sm text-[#5A6B5D]/70 mt-2">{DASHBOARD_COPY.onboarding.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === "completed";
            const action = getTaskAction(task);

            return (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-card ${
                  isCompleted ? "bg-[#FEFCF8]/50" : "bg-[#FEFCF8]"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    isCompleted
                      ? "bg-[#8B6F47] text-[#FEFCF8]"
                      : "bg-[#E8E5E0] text-[#5A6B5D]/40"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{tasks.indexOf(task) + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? "text-[#5A6B5D]/70 line-through" : "text-[#5A6B5D]"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-[#5A6B5D]/60 mt-1">{task.description}</p>
                  )}
                  {!isCompleted && action && (
                    <Button variant="outline" size="sm" onClick={action.onClick} className="mt-2">
                      {action.label}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

