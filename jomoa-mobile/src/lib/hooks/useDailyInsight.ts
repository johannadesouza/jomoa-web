import { useEffect, useState, useCallback, useRef } from "react";
import { useAppNow } from "../../shared/context/AppNowContext";
import { useCycle } from "./useCycle";
import { useReadiness } from "./useReadiness";
import { useDemoPersona } from "../../shared/context/DemoPersonaContext";
import {
  getOrCreateTodayInsight,
  getTodayInsight,
  type DailyInsight,
} from "../services/insightService";
import { getTodayHasSymptoms } from "../services/cycleSymptomService";

const REFETCH_DEBOUNCE_MS = 300;

function readinessToTier(
  readiness: { readiness_score?: number | null; energy_level?: number | null } | null
): "high" | "medium" | "low" | null {
  if (!readiness) return null;
  const score = readiness.readiness_score;
  if (score != null) {
    if (score >= 75) return "high";
    if (score >= 50) return "medium";
    return "low";
  }
  const energy = readiness.energy_level;
  if (energy != null) {
    if (energy >= 7) return "high";
    if (energy >= 4) return "medium";
    return "low";
  }
  return null;
}

export interface UseDailyInsightOptions {
  defaultInsightTitle?: string;
}

export function useDailyInsight(
  clientId: string | undefined,
  options?: UseDailyInsightOptions
) {
  const appNow = useAppNow();
  const demo = useDemoPersona();
  const prevRef = useRef<{ appNow: unknown; defaultTitle: string | undefined; clientId: string | undefined } | null>(null);
  const { phase, cycleDay } = useCycle(clientId);
  const { readiness } = useReadiness(clientId);
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const defaultTitle = options?.defaultInsightTitle;

  // #region agent log
  {
    const prev = prevRef.current;
    const appNowChanged = prev ? prev.appNow !== appNow : null;
    const titleChanged = prev ? prev.defaultTitle !== defaultTitle : null;
    const clientChanged = prev ? prev.clientId !== clientId : null;
    prevRef.current = { appNow, defaultTitle, clientId };
    fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H6',location:'useDailyInsight.ts:render',message:'hook render',data:{clientIdPresent:!!clientId,appNowChanged,titleChanged,clientChanged,phase,cycleDay,readinessScore:readiness?.readiness_score??null},timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion

  const inputRef = useRef({
    phase: phase ?? null,
    cycleDay: cycleDay ?? null,
    readinessTier: readinessToTier(readiness),
    energyLevel: readiness?.energy_level ?? null,
  });
  inputRef.current = {
    phase: phase ?? null,
    cycleDay: cycleDay ?? null,
    readinessTier: readinessToTier(readiness),
    energyLevel: readiness?.energy_level ?? null,
  };

  const loadInsight = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H2',location:'useDailyInsight.ts:loadInsight',message:'loadInsight start',data:{clientIdPresent:!!clientId,phase:inputRef.current.phase,cycleDay:inputRef.current.cycleDay,readinessTier:inputRef.current.readinessTier,energyLevel:inputRef.current.energyLevel},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!clientId) {
      setInsight(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { phase: p, cycleDay: cd, readinessTier: tier, energyLevel: energy } = inputRef.current;
      const hasSymptoms = await getTodayHasSymptoms(clientId);
      // #region agent log
      fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H2',location:'useDailyInsight.ts:hasSymptoms',message:'getTodayHasSymptoms result',data:{hasSymptoms},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const today = appNow.todayString();
      const { data, error } = await getOrCreateTodayInsight(
        clientId,
        {
          phase: p,
          cycleDay: cd,
          readinessTier: tier,
          energyLevel: energy,
          hasSymptoms,
        },
        { date: today, defaultTitle: defaultTitle ?? undefined }
      );
      // #region agent log
      fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H2',location:'useDailyInsight.ts:serviceResult',message:'getOrCreateTodayInsight result',data:{hasData:!!data,hasError:!!error,error:error??null,title:data?.insight_title??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!error && data) {
        setInsight(data);
      } else {
        const fallback = await getTodayInsight(clientId, today);
        // #region agent log
        fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H2',location:'useDailyInsight.ts:fallback',message:'getTodayInsight fallback',data:{hasData:!!fallback.data,hasError:!!fallback.error,error:fallback.error??null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (fallback.data) setInsight(fallback.data);
        else setInsight(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clientId, appNow, defaultTitle]);

  useEffect(() => {
    if (!clientId) return;
    const timeout = setTimeout(loadInsight, REFETCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [clientId, loadInsight, demo.epoch]);

  return { insight, isLoading, refetch: loadInsight };
}
