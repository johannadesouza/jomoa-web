/**
 * Tip frequency från app_config (antal dagar mellan tips).
 * Använd när ni visar "tips" med viss frekvens – t.ex. visa ett tip max var N:e dag.
 * Sätt app_config key "tip_frequency" (number) för att styra utan release.
 */
import { useFeatureFlags } from "../../shared/context/FeatureFlagsContext";

const DEFAULT_TIP_FREQUENCY_DAYS = 3;

export function useTipFrequency(): number {
  const flags = useFeatureFlags();
  const raw = flags["tip_frequency"];
  if (typeof raw === "number" && raw >= 1 && raw <= 30) return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 30) return n;
  }
  return DEFAULT_TIP_FREQUENCY_DAYS;
}
