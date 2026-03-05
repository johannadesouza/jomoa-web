/**
 * progressPhotoService – ladda upp och hämta progress-bilder från Supabase Storage.
 *
 * Bucket: progress-photos (privat, RLS: user kan bara se sina egna bilder)
 * Sökväg: {userId}/{date}_{timestamp}.jpg
 *
 * Bilden sparas som en signed URL (giltlig 1 år) och lagras i body_measurements.photo_url
 */
import { supabase } from "../../config/supabase";

const BUCKET = "progress_photos";
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365; // 1 år i sekunder

export interface ProgressPhoto {
  measurementDate: string;
  photoUrl: string; // signed URL
}

/**
 * Laddar upp en bild och returnerar en signed URL.
 * @param userId  Supabase auth uid
 * @param date    Mätdatum (ÅÅÅÅ-MM-DD) – används i filnamnet
 * @param localUri  Lokal URI från expo-image-picker
 */
export async function uploadProgressPhoto(
  userId: string,
  date: string,
  localUri: string
): Promise<{ signedUrl: string; path: string } | { error: string }> {
  try {
    // Hämta filen som blob via fetch (fungerar med lokala file:// URI:er i Expo)
    const response = await fetch(localUri);
    const blob = await response.blob();

    const timestamp = Date.now();
    const path = `${userId}/${date}_${timestamp}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("uploadProgressPhoto:", uploadError);
      return { error: uploadError.message };
    }

    // Skapa signed URL (1 år)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRY);

    if (signedError || !signedData?.signedUrl) {
      return { error: signedError?.message ?? "Kunde inte skapa URL" };
    }

    return { signedUrl: signedData.signedUrl, path };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    console.error("uploadProgressPhoto exception:", msg);
    return { error: msg };
  }
}

/**
 * Hämtar signed URL för ett befintligt foto via filsökvägen.
 */
export async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Hämtar första och senaste progress-foto för en användare.
 * Returnerar { first, latest } – en eller båda kan vara null.
 */
export async function fetchFirstAndLatestPhoto(clientId: string): Promise<{
  first: ProgressPhoto | null;
  latest: ProgressPhoto | null;
}> {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("date, photo_url")
    .eq("client_id", clientId)
    .not("photo_url", "is", null)
    .order("date", { ascending: true });

  if (error || !data || data.length === 0) {
    return { first: null, latest: null };
  }

  const first = data[0];
  const latest = data[data.length - 1];

  return {
    first: { measurementDate: first.date, photoUrl: first.photo_url! },
    latest:
      data.length > 1
        ? { measurementDate: latest.date, photoUrl: latest.photo_url! }
        : null,
  };
}

/**
 * Tar bort ett foto från Storage.
 */
export async function deleteProgressPhoto(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
