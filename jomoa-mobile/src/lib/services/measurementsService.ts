/**
 * Mätningslogg – synk med body_measurements
 */
import { supabase } from "../../config/supabase";

export interface BodyMeasurementRecord {
  id: string;
  client_id: string;
  date: string;
  measurements: Record<string, number>;
  note: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type MeasurementKey =
  | "waist"
  | "hip"
  | "thigh"
  | "chest"
  | "upper_arm"
  | "weight"
  | string;

const MEASUREMENT_LABELS: Record<string, string> = {
  waist: "Midja",
  hip: "Höfter",
  thigh: "Lår",
  chest: "Bröst",
  upper_arm: "Överarm",
  weight: "Vikt",
};

export function getMeasurementLabel(key: string): string {
  return MEASUREMENT_LABELS[key] ?? key;
}

export const DEFAULT_MEASUREMENT_KEYS: MeasurementKey[] = [
  "weight",
  "waist",
  "hip",
  "thigh",
  "chest",
  "upper_arm",
];

export async function fetchMeasurements(
  clientId: string,
  limit = 30
): Promise<BodyMeasurementRecord[]> {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchMeasurements:", error);
    return [];
  }

  return (data || []).map((r) => ({
    ...r,
    measurements: (r.measurements as Record<string, number>) || {},
  })) as BodyMeasurementRecord[];
}

export async function upsertMeasurement(
  clientId: string,
  date: string,
  measurements: Record<string, number>,
  note?: string | null,
  photoUrl?: string | null
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("body_measurements").upsert(
    {
      client_id: clientId,
      date,
      measurements,
      note: note ?? null,
      photo_url: photoUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "client_id,date",
    }
  );

  if (error) {
    console.error("upsertMeasurement:", error);
    return { error };
  }
  return { error: null };
}

export async function deleteMeasurement(
  clientId: string,
  date: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("body_measurements")
    .delete()
    .eq("client_id", clientId)
    .eq("date", date);

  if (error) {
    console.error("deleteMeasurement:", error);
    return { error };
  }
  return { error: null };
}
