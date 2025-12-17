/**
 * Clients needing attention section for Coach Dashboard
 */

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DASHBOARD_COPY } from "../copy";
import type { ClientNeedingAttention } from "../domain/types";

interface AttentionSectionProps {
  clientsNeedingAttention: {
    lowReadiness: ClientNeedingAttention[];
    notTrainedRecently: ClientNeedingAttention[];
    incompleteWorkouts: ClientNeedingAttention[];
  };
}

export function AttentionSection({ clientsNeedingAttention }: AttentionSectionProps) {
  const router = useRouter();

  const hasAnyAttention =
    clientsNeedingAttention.lowReadiness.length > 0 ||
    clientsNeedingAttention.notTrainedRecently.length > 0 ||
    clientsNeedingAttention.incompleteWorkouts.length > 0;

  if (!hasAnyAttention) {
    return null;
  }

  return (
    <Card className="mb-6 bg-yellow-50/50 border-yellow-200">
      <CardHeader>
        <CardTitle>{DASHBOARD_COPY.attention.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Low Readiness */}
          {clientsNeedingAttention.lowReadiness.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {DASHBOARD_COPY.attention.lowReadiness(
                    clientsNeedingAttention.lowReadiness.length
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientsNeedingAttention.lowReadiness.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => router.push(`/coach/clients/${client.id}`)}
                      className="p-2 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium text-[#5A6B5D] truncate">{client.name}</p>
                      <p className="text-xs text-[#5A6B5D]/70 mt-0.5">{client.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Trained Recently */}
          {clientsNeedingAttention.notTrainedRecently.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {DASHBOARD_COPY.attention.notTrainedRecently(
                    clientsNeedingAttention.notTrainedRecently.length
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientsNeedingAttention.notTrainedRecently.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => router.push(`/coach/clients/${client.id}`)}
                      className="p-2 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium text-[#5A6B5D] truncate">{client.name}</p>
                      <p className="text-xs text-[#5A6B5D]/70 mt-0.5">{client.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Incomplete Workouts */}
          {clientsNeedingAttention.incompleteWorkouts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {DASHBOARD_COPY.attention.incompleteWorkouts(
                    clientsNeedingAttention.incompleteWorkouts.length
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientsNeedingAttention.incompleteWorkouts.map((client) => (
                    <div
                      key={`${client.id}-${client.workoutLogId}`}
                      onClick={() => router.push(`/coach/clients/${client.id}`)}
                      className="p-2 bg-[#FEFCF8]/50 rounded-[20px] hover:bg-[#FEFCF8] cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium text-[#5A6B5D] truncate">{client.name}</p>
                      <p className="text-xs text-[#5A6B5D]/70 mt-0.5">{client.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

