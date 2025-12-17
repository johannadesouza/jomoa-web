/**
 * Tips section for Client Dashboard
 */

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lightbulb } from "lucide-react";
import { useTodayTips, markTipAsRead, isTipRead } from "@/hooks/useTips";
import { DASHBOARD_COPY } from "../copy";
import type { CyclePhase } from "@/lib/utils/cycleColors";

interface TipsSectionProps {
  currentPhase: CyclePhase | null;
}

export function TipsSection({ currentPhase }: TipsSectionProps) {
  const router = useRouter();
  const { todayTips, loading: tipsLoading } = useTodayTips(currentPhase);

  if (tipsLoading || todayTips.length === 0) {
    return null;
  }

  return (
    <Card className="bg-amber-50/30 border-amber-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <CardTitle>{DASHBOARD_COPY.tips.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayTips.map((tip) => {
          const isRead = isTipRead(tip.id);
          return (
            <div
              key={tip.id}
              className={`p-4 rounded-card border ${
                isRead ? "bg-[#FEFCF8]/50 border-[rgba(232,229,224,0.4)]" : "bg-[#FEFCF8] border-amber-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#5A6B5D] mb-1">{tip.title}</h4>
                  <p className="text-xs text-[#5A6B5D]/70 leading-relaxed">{tip.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip variant="outline" className="text-xs px-2 py-0.5">
                      {DASHBOARD_COPY.tips.categories[tip.category]}
                    </Chip>
                    {tip.phase && (
                      <Chip variant="outline" className="text-xs px-2 py-0.5">
                        {DASHBOARD_COPY.tips.phases[tip.phase]}
                      </Chip>
                    )}
                  </div>
                </div>
                {!isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markTipAsRead(tip.id)} className="flex-shrink-0 text-xs">
                    ✓
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        <Button variant="link" onClick={() => router.push("/client/tips")} className="w-full text-xs text-[#8B6F47] hover:text-[#7A5F3D]">
          {DASHBOARD_COPY.tips.viewAll}
        </Button>
      </CardContent>
    </Card>
  );
}

