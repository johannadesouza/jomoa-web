/**
 * Stats cards section for Coach Dashboard
 */

import { StatCard } from "@/components/ui/StatCard";
import { DASHBOARD_COPY } from "../copy";
import type { DashboardStats } from "../domain/types";

interface StatsSectionProps {
  stats: DashboardStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard label={DASHBOARD_COPY.stats.totalClients} value={stats.totalClients} />
      <StatCard
        label={DASHBOARD_COPY.stats.trainedLast7Days}
        value={stats.clientsTrainedLast7Days}
        description={
          stats.totalClients > 0 ? DASHBOARD_COPY.stats.ofClients(stats.totalClients) : undefined
        }
      />
      <StatCard
        label={DASHBOARD_COPY.stats.withoutReadiness}
        value={stats.clientsWithoutReadinessToday}
        description={
          stats.totalClients > 0 ? DASHBOARD_COPY.stats.ofClients(stats.totalClients) : undefined
        }
      />
    </div>
  );
}

