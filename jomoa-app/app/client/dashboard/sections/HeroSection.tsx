/**
 * Hero section component for Client Dashboard
 */

import { Card } from "@/components/ui/Card";
import { DASHBOARD_COPY } from "../copy";
import type { ProgramSession } from "../domain/types";

interface HeroSectionProps {
  displaySession: ProgramSession | null;
  todaySession: ProgramSession | null;
  hasReadiness: boolean;
  onStartSession: (sessionId: string) => void;
  onLogReadiness: () => void;
  startingSession: string | null;
}

export function HeroSection({
  displaySession,
  todaySession,
  hasReadiness,
  onStartSession,
  onLogReadiness,
  startingSession,
}: HeroSectionProps) {
  const primaryCTA =
    displaySession && !todaySession?.workoutLog
      ? {
          label: DASHBOARD_COPY.actions.startWorkout,
          onClick: () => onStartSession(displaySession.id),
          disabled: startingSession === displaySession.id,
        }
      : !hasReadiness
      ? {
          label: DASHBOARD_COPY.actions.logReadiness,
          onClick: onLogReadiness,
          disabled: false,
        }
      : null;

  return (
    <Card variant="hero">
      <h2 className="text-xl font-the-seasons font-semibold text-[#5A6B5D] mb-5">
        {DASHBOARD_COPY.hero.title}
      </h2>

      {primaryCTA ? (
        <div className="space-y-4">
          <p className="text-sm text-[#5A6B5D]/70 leading-relaxed">
            {displaySession && !todaySession?.workoutLog
              ? DASHBOARD_COPY.hero.sessionPrompt(displaySession.name)
              : DASHBOARD_COPY.hero.readinessPrompt}
          </p>
          <button
            onClick={primaryCTA.onClick}
            disabled={primaryCTA.disabled}
            className="w-full py-4 px-6 bg-[#8B6F47] text-[#FEFCF8] rounded-[20px] font-medium hover:bg-[#7A5F3D] focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 disabled:bg-[#5A6B5D]/40 disabled:cursor-not-allowed transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          >
            {primaryCTA.disabled ? DASHBOARD_COPY.actions.processing : primaryCTA.label}
          </button>
        </div>
      ) : (
        <p className="text-sm text-[#5A6B5D]/70 leading-relaxed">
          {todaySession?.workoutLog?.status === "genomfört"
            ? DASHBOARD_COPY.hero.completed(todaySession.name)
            : DASHBOARD_COPY.hero.allDone}
        </p>
      )}
    </Card>
  );
}

