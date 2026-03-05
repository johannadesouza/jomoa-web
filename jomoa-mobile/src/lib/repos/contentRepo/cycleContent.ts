/**
 * contentRepo/cycleContent – allmän cykelinformation från Content DB.
 * Innehåller faser, träningsrekommendationer, välmåendetips och readiness-insikter.
 */
import { contentClient } from "../../supabase/contentClient";

export type CyclePhase = {
  id: string;
  name: string;
  order_index: number;
  typical_days: string;
  color_hex: string;
  description: string;
  hormone_profile: string | null;
  energy_level: "low" | "medium" | "high" | "variable" | null;
};

export type PhaseTrainingTip = {
  id: string;
  phase_id: string;
  title: string;
  body: string;
  intensity: "light" | "moderate" | "high" | null;
  tip_type: "recommendation" | "warning" | "motivation" | null;
  order_index: number;
};

export type PhaseWellnessTip = {
  id: string;
  phase_id: string;
  title: string;
  body: string;
  category: "nutrition" | "sleep" | "stress" | "symptoms" | "mindfulness" | null;
  order_index: number;
};

export type ReadinessInsight = {
  id: string;
  readiness_min: number;
  readiness_max: number;
  title: string;
  body: string;
  suggestion: string | null;
};

export type PhaseContent = CyclePhase & {
  training_tips: PhaseTrainingTip[];
  wellness_tips: PhaseWellnessTip[];
};

export async function fetchAllCyclePhases(): Promise<CyclePhase[]> {
  const { data, error } = await contentClient
    .from("cycle_phases")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("contentRepo/cycleContent fetchAllCyclePhases:", error);
    return [];
  }
  return (data ?? []) as CyclePhase[];
}

export async function fetchCyclePhaseById(
  phaseId: string
): Promise<CyclePhase | null> {
  const { data, error } = await contentClient
    .from("cycle_phases")
    .select("*")
    .eq("id", phaseId)
    .single();

  if (error || !data) return null;
  return data as CyclePhase;
}

export async function fetchPhaseContent(
  phaseId: string
): Promise<PhaseContent | null> {
  const [phaseRes, trainingRes, wellnessRes] = await Promise.all([
    contentClient.from("cycle_phases").select("*").eq("id", phaseId).single(),
    contentClient
      .from("phase_training_tips")
      .select("*")
      .eq("phase_id", phaseId)
      .order("order_index", { ascending: true }),
    contentClient
      .from("phase_wellness_tips")
      .select("*")
      .eq("phase_id", phaseId)
      .order("order_index", { ascending: true }),
  ]);

  if (phaseRes.error || !phaseRes.data) return null;

  return {
    ...(phaseRes.data as CyclePhase),
    training_tips: (trainingRes.data ?? []) as PhaseTrainingTip[],
    wellness_tips: (wellnessRes.data ?? []) as PhaseWellnessTip[],
  };
}

/** Phase id i app (cycleUtils) vs Content DB – DB använder 'follikular'. */
export function toContentPhaseId(phase: string): string {
  return phase === "follicular" ? "follikular" : phase;
}

/**
 * Kort insight för dashboard (headline + bullets) från Content DB.
 * Används av phaseKnowledgeService med fallback till phaseProfiles.
 */
export type PhaseInsightContent = {
  headline: string;
  bullets: string[];
};

export async function fetchPhaseInsightContent(
  phaseId: string
): Promise<PhaseInsightContent | null> {
  const contentPhaseId = toContentPhaseId(phaseId);
  const [trainingRes, wellnessRes] = await Promise.all([
    contentClient
      .from("phase_training_tips")
      .select("title, body")
      .eq("phase_id", contentPhaseId)
      .order("order_index", { ascending: true })
      .limit(4),
    contentClient
      .from("phase_wellness_tips")
      .select("title, body")
      .eq("phase_id", contentPhaseId)
      .order("order_index", { ascending: true })
      .limit(2),
  ]);

  const training = (trainingRes.data ?? []) as { title: string; body: string }[];
  const wellness = (wellnessRes.data ?? []) as { title: string; body: string }[];
  if (training.length === 0 && wellness.length === 0) return null;

  const headline = training[0]?.title ?? wellness[0]?.title ?? "";
  const bullets: string[] = [];
  for (const t of training.slice(0, 3)) {
    if (t.body) bullets.push(t.body);
    else if (t.title && t.title !== headline) bullets.push(t.title);
  }
  for (const w of wellness.slice(0, 2)) {
    if (w.body) bullets.push(w.body);
  }
  if (headline && bullets.length > 0) {
    return { headline, bullets: bullets.slice(0, 3) };
  }
  if (headline) return { headline, bullets: [training[0]?.body ?? wellness[0]?.body ?? ""].filter(Boolean) };
  return null;
}

export async function fetchReadinessInsight(
  readinessScore: number
): Promise<ReadinessInsight | null> {
  const { data, error } = await contentClient
    .from("readiness_insights")
    .select("*")
    .lte("readiness_min", readinessScore)
    .gte("readiness_max", readinessScore)
    .single();

  if (error || !data) return null;
  return data as ReadinessInsight;
}
