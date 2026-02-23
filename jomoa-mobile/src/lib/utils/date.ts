/**
 * Date utilities
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Add days to a date string, returns YYYY-MM-DD */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/** Get ISO day of week (1=Mon, 7=Sun) from YYYY-MM-DD string */
export function getDayOfWeekFromDateStr(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

/** Get YYYY-MM-DD for a weekday (1=Mon, 7=Sun) in the week containing dateStr */
export function getDateForWeekDay(dateStr: string, dayOfWeek: number): string {
  const d = new Date(dateStr + "T12:00:00");
  const js = d.getDay();
  const isoDay = js === 0 ? 7 : js;
  const daysFromMonday = isoDay - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysFromMonday);
  const target = new Date(monday);
  target.setDate(monday.getDate() + (dayOfWeek - 1));
  return getLocalDateString(target);
}
