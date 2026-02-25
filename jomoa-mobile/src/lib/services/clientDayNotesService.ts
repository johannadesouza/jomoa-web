/**
 * Anteckningar per dag – client_day_notes
 * Stödjer Övrigt och Träning i DayDetailScreen.
 */
import { supabase } from "../../config/supabase";

export type DayNoteCategory = "övrigt" | "träning";

export interface DayNote {
  id: string;
  client_id: string;
  date: string;
  category: DayNoteCategory;
  text: string;
  time_of_day: string | null; // "HH:MM" eller null
  created_at: string;
  updated_at: string;
}

/**
 * Hämtar anteckningar för en specifik dag och kategori.
 * Sorteras: anteckningar med tid sorteras kronologiskt, utan tid sist.
 */
export async function fetchNotesForDate(
  clientId: string,
  date: string,
  category: DayNoteCategory
): Promise<DayNote[]> {
  const { data, error } = await supabase
    .from("client_day_notes")
    .select("*")
    .eq("client_id", clientId)
    .eq("date", date)
    .eq("category", category)
    .order("time_of_day", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchNotesForDate:", error);
    return [];
  }
  return (data ?? []) as DayNote[];
}

export async function addNote(
  clientId: string,
  date: string,
  category: DayNoteCategory,
  text: string,
  timeOfDay?: string | null
): Promise<DayNote | null> {
  const { data, error } = await supabase
    .from("client_day_notes")
    .insert({
      client_id: clientId,
      date,
      category,
      text: text.trim(),
      time_of_day: timeOfDay ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("addNote:", error);
    return null;
  }
  return data as DayNote;
}

export async function updateNote(
  noteId: string,
  text: string,
  timeOfDay?: string | null
): Promise<DayNote | null> {
  const { data, error } = await supabase
    .from("client_day_notes")
    .update({
      text: text.trim(),
      time_of_day: timeOfDay ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    console.error("updateNote:", error);
    return null;
  }
  return data as DayNote;
}

export async function deleteNote(noteId: string): Promise<boolean> {
  const { error } = await supabase
    .from("client_day_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("deleteNote:", error);
    return false;
  }
  return true;
}
