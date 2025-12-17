"use client";

import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useCoachDashboard } from "./hooks/useCoachDashboard";
import { useNotifications } from "@/hooks/useNotifications";
import { OnboardingSection } from "./sections/OnboardingSection";
import { AttentionSection } from "./sections/AttentionSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { StatsSection } from "./sections/StatsSection";
import { RecentWorkoutsSection } from "./sections/RecentWorkoutsSection";
import { DASHBOARD_COPY } from "./copy";

export default function CoachDashboard() {
  const router = useRouter();
  const { stats, loading, error, refetch } = useCoachDashboard();
  const { notifications = [], unreadCount = 0 } = useNotifications("coach");

  if (loading) {
    return (
      <LoadingState
        title={DASHBOARD_COPY.header.title}
        subtitle={DASHBOARD_COPY.header.subtitle}
        showHeader={true}
        height="h-64"
      />
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeader
          title={DASHBOARD_COPY.header.title}
          subtitle={DASHBOARD_COPY.header.subtitle}
        />
        <ErrorState
          title={DASHBOARD_COPY.errors.cannotLoad}
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title={DASHBOARD_COPY.header.title}
        subtitle={DASHBOARD_COPY.header.subtitle}
      />

      {stats && (
        <>
          <OnboardingSection tasks={stats.onboardingTasks} />
          <AttentionSection clientsNeedingAttention={stats.clientsNeedingAttention} />
          <NotificationsSection notifications={notifications} unreadCount={unreadCount} />
          <StatsSection stats={stats} />
          <RecentWorkoutsSection workouts={stats.recentWorkouts} />
        </>
      )}
    </div>
  );
}
