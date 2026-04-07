export type DemoPersona = "strength_3x" | "cycle_only" | "perimenopause";

export function isDemoMode(): boolean {
  const v = process.env.EXPO_PUBLIC_DEMO_MODE;
  return v === "1" || v === "true" || v === "yes";
}

export function getDemoPersona(): DemoPersona {
  const raw = (process.env.EXPO_PUBLIC_DEMO_PERSONA ?? "").trim();
  if (raw === "strength_3x" || raw === "cycle_only" || raw === "perimenopause") return raw;
  return "strength_3x";
}

