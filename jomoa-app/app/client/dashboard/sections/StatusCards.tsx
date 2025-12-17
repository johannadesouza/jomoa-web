/**
 * Status cards section for Client Dashboard
 */

import { useRouter } from "next/navigation";
import { Card, Chip } from "@/components/ui/Card";
import { DASHBOARD_COPY } from "../copy";
import type { ProgramSession, ProgramAssignment, CycleStatus, ReadinessState } from "../domain/types";

interface StatusCardsProps {
  displaySession: ProgramSession | null;
  assignment: ProgramAssignment | null;
  readiness: ReadinessState;
  cycleStatus: CycleStatus | null;
  onUpdateReadiness: () => void;
}

export function StatusCards({
  displaySession,
  assignment,
  readiness,
  cycleStatus,
  onUpdateReadiness,
}: StatusCardsProps) {
  const router = useRouter();
  const hasReadiness = readiness.energy_level && readiness.sleep_quality;

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Next Workout */}
      <Card
        onClick={displaySession ? () => router.push(`/client/workouts?session=${displaySession.id}`) : undefined}
        className={displaySession ? "cursor-pointer" : ""}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">
              {DASHBOARD_COPY.statusCards.nextWorkout.label}
            </p>
            <p className="text-base font-semibold text-[#5A6B5D] mb-2">
              {displaySession ? displaySession.name : DASHBOARD_COPY.statusCards.nextWorkout.noWorkout}
            </p>
            {displaySession?.workoutLog && (
              <Chip
                variant={displaySession.workoutLog.status === "genomfört" ? "success" : "warning"}
                className="mt-2"
              >
                {displaySession.workoutLog.status === "genomfört"
                  ? DASHBOARD_COPY.statusCards.nextWorkout.completed
                  : DASHBOARD_COPY.statusCards.nextWorkout.started}
              </Chip>
            )}
          </div>
          {displaySession && <span className="text-sm text-[#8B6F47] ml-3">→</span>}
        </div>
      </Card>

      {/* Readiness */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">
              {DASHBOARD_COPY.statusCards.readiness.label}
            </p>
            {hasReadiness ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full ${
                          i <= parseInt(readiness.energy_level || "0")
                            ? "bg-[#8B6F47]"
                            : "bg-[rgba(232,229,224,0.6)]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#5A6B5D]/70">
                    {DASHBOARD_COPY.statusCards.readiness.energy}: {readiness.energy_level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full ${
                          i <= parseInt(readiness.sleep_quality || "0")
                            ? "bg-[#8B6F47]"
                            : "bg-[rgba(232,229,224,0.6)]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#5A6B5D]/70">
                    {DASHBOARD_COPY.statusCards.readiness.sleep}: {readiness.sleep_quality}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#5A6B5D]/70">{DASHBOARD_COPY.statusCards.readiness.notFilled}</p>
            )}
          </div>
          <button
            onClick={onUpdateReadiness}
            className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline ml-3"
          >
            {DASHBOARD_COPY.statusCards.readiness.update}
          </button>
        </div>
      </Card>

      {/* Cycle */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">
              {DASHBOARD_COPY.statusCards.cycle.label}
            </p>
            {cycleStatus ? (
              <div className="mt-1">
                <p className="text-base font-semibold text-[#5A6B5D] mb-1">
                  Dag {cycleStatus.cycleDay} • {cycleStatus.phase}
                </p>
                <p className="text-xs text-[#5A6B5D]/70 mt-1">
                  {DASHBOARD_COPY.statusCards.cycle.lastPeriodStart(
                    new Date(cycleStatus.periodStartDate).toLocaleDateString("sv-SE", {
                      month: "short",
                      day: "numeric",
                    })
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#5A6B5D]/70">{DASHBOARD_COPY.statusCards.cycle.noData}</p>
            )}
          </div>
          <button
            onClick={() => router.push("/client/cycle")}
            className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline ml-3"
          >
            {cycleStatus ? DASHBOARD_COPY.statusCards.cycle.adjust : DASHBOARD_COPY.statusCards.cycle.log}
          </button>
        </div>
      </Card>

      {/* Active Program */}
      {assignment && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-[#5A6B5D]/60 mb-2 font-medium uppercase tracking-wide">
                {DASHBOARD_COPY.statusCards.activeProgram.label}
              </p>
              <p className="text-base font-semibold text-[#5A6B5D] mb-1">{assignment.program.name}</p>
              <p className="text-xs text-[#5A6B5D]/70 mt-1">
                {DASHBOARD_COPY.statusCards.activeProgram.startDate(
                  new Date(assignment.start_date).toLocaleDateString("sv-SE")
                )}
              </p>
            </div>
            <button
              onClick={() => router.push("/client/workouts")}
              className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline ml-3"
            >
              {DASHBOARD_COPY.statusCards.activeProgram.viewProgram}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

