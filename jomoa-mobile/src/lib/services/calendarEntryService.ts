/**
 * Calendar entry service – user-planned sessions and notes per day
 */

import { supabase } from "../../config/supabase";

export interface CalendarEntry {
  id: string;
  client_id: string;
  date: string;
  program_session_id: string | null;
  session_template_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertCalendarEntryInput {
  client_id: string;
  date: string;
  program_session_id?: string | null;
  session_template_id?: string | null;
  note?: string | null;
}

export async function getEntriesForRange(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEntry[]> {
  const { data, error } = await supabase
    .from("client_calendar_entries")
    .select("*")
    .eq("client_id", clientId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching calendar entries:", error);
    return [];
  }

  return (data ?? []) as CalendarEntry[];
}

export async function upsertEntry(input: UpsertCalendarEntryInput): Promise<CalendarEntry | null> {
  const { data: existing } = await supabase
    .from("client_calendar_entries")
    .select("id")
    .eq("client_id", input.client_id)
    .eq("date", input.date)
    .maybeSingle();

  const payload = {
    client_id: input.client_id,
    date: input.date,
    program_session_id: input.program_session_id ?? null,
    session_template_id: input.session_template_id ?? null,
    note: input.note ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("client_calendar_entries")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating calendar entry:", error);
      return null;
    }
    return (data as CalendarEntry) ?? null;
  }

  const { data, error } = await supabase
    .from("client_calendar_entries")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting calendar entry:", error);
    return null;
  }
  return (data as CalendarEntry) ?? null;
}

export async function deleteEntry(clientId: string, date: string): Promise<boolean> {
  const { error } = await supabase
    .from("client_calendar_entries")
    .delete()
    .eq("client_id", clientId)
    .eq("date", date);

  if (error) {
    console.error("Error deleting calendar entry:", error);
    return false;
  }
  return true;
}
