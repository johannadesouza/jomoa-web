/**
 * Date utility functions for handling local dates
 * Replaces UTC date handling (toISOString().split("T")[0]) with local date helpers
 */

/**
 * Get today's date in local timezone as YYYY-MM-DD string
 * Uses local date, not UTC
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get local date string from ISO string
 * Converts UTC date string to local date string
 */
export function getLocalDateStringFromISO(isoString: string): string {
  const date = new Date(isoString);
  return getLocalDateString(date);
}

/**
 * Get ISO string for local date (for database storage)
 * Converts local date to ISO string at midnight local time
 */
export function getISOStringFromLocalDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}

