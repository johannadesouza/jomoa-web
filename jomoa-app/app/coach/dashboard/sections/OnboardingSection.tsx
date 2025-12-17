/**
 * Onboarding checklist section for Coach Dashboard
 */

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DASHBOARD_COPY } from "../copy";
import { ONBOARDING_TASK_KEYS } from "../domain/constants";
import type { OnboardingTask } from "../domain/types";
import { supabase } from "@/lib/supabaseClient";

interface OnboardingSectionProps {
  tasks: OnboardingTask[];
}

export function OnboardingSection({ tasks }: OnboardingSectionProps) {
  const router = useRouter();
  const { user } = useAuth();

  const incompleteTasks = tasks.filter((t) => t.status !== "completed");
  const allCompleted = tasks.every((t) => t.status === "completed");

  if (allCompleted || incompleteTasks.length === 0) {
    return null;
  }

  const getFirstProgramId = async (): Promise<string | null> => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from("training_programs")
      .select("id")
      .eq("created_by_coach_id", user.id)
      .limit(1)
      .maybeSingle();
    return data?.id || null;
  };

  const getTaskAction = (task: OnboardingTask) => {
    switch (task.key) {
      case ONBOARDING_TASK_KEYS.CREATE_CLIENT:
        return { label: DASHBOARD_COPY.onboarding.actions.goToClients, path: "/coach/clients" };
      case ONBOARDING_TASK_KEYS.CREATE_PROGRAM:
        return { label: DASHBOARD_COPY.onboarding.actions.goToPrograms, path: "/coach/programs" };
      case ONBOARDING_TASK_KEYS.ADD_SESSIONS:
        return { label: DASHBOARD_COPY.onboarding.actions.openProgram, path: null };
      case ONBOARDING_TASK_KEYS.ASSIGN_PROGRAM:
        return { label: DASHBOARD_COPY.onboarding.actions.assignProgram, path: null };
      default:
        return null;
    }
  };

  return (
    <Card className="mb-6 bg-blue-50/50 border-blue-200">
      <CardHeader>
        <CardTitle>{DASHBOARD_COPY.onboarding.title}</CardTitle>
        <p className="text-sm text-[#5A6B5D]/70 mt-2">{DASHBOARD_COPY.onboarding.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incompleteTasks.map((task) => {
            const action = getTaskAction(task);
            return (
              <div key={task.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FEFCF8] flex items-center justify-center mt-0.5 border border-[rgba(232,229,224,0.4)]">
                  <span className="text-xs font-medium text-[#5A6B5D]">{task.order_index}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#5A6B5D]">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-[#5A6B5D]/70 mt-0.5">{task.description}</p>
                  )}
                  {action && (
                    <button
                      onClick={async () => {
                        if (action.path) {
                          router.push(action.path);
                        } else if (
                          task.key === ONBOARDING_TASK_KEYS.ADD_SESSIONS ||
                          task.key === ONBOARDING_TASK_KEYS.ASSIGN_PROGRAM
                        ) {
                          const programId = await getFirstProgramId();
                          if (programId) {
                            router.push(`/coach/programs/${programId}`);
                          }
                        }
                      }}
                      className="mt-1 text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
                    >
                      {action.label}
                    </button>
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

