export type DemoPersona = "strength_3x" | "cycle_only" | "perimenopause";

let runtimePersona: DemoPersona | null = null;

export function isDemoMode(): boolean {
  const v = process.env.EXPO_PUBLIC_DEMO_MODE;
  return v === "1" || v === "true" || v === "yes";
}

export function getDemoPersona(): DemoPersona {
  const raw = (process.env.EXPO_PUBLIC_DEMO_PERSONA ?? "").trim();
  if (raw === "strength_3x" || raw === "cycle_only" || raw === "perimenopause") return raw;
  return "strength_3x";
}

/**
 * Runtime persona (set by DemoPersonaProvider) so non-React modules (services)
 * can read the active persona without hooks.
 */
export function setRuntimeDemoPersona(persona: DemoPersona): void {
  runtimePersona = persona;
}

export function getRuntimeDemoPersona(): DemoPersona {
  return runtimePersona ?? getDemoPersona();
}

