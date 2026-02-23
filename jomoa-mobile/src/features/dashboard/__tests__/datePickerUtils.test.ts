/**
 * datePickerUtils – HorizontalDatePicker logic
 */
import { getDatePickerDates } from "../datePickerUtils";

function getLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("getDatePickerDates", () => {
  it("returns requested number of dates", () => {
    const today = new Date("2025-02-22");
    const dates = getDatePickerDates(today, 14, -3, getLocalDateString);
    expect(dates).toHaveLength(14);
  });

  it("includes correct date strings in YYYY-MM-DD format", () => {
    const today = new Date("2025-02-22");
    const dates = getDatePickerDates(today, 5, 0, getLocalDateString);
    expect(dates[0].dateStr).toBe("2025-02-22");
    expect(dates[1].dateStr).toBe("2025-02-23");
  });

  it("marks today correctly", () => {
    const today = new Date("2025-02-22");
    const dates = getDatePickerDates(today, 7, -3, getLocalDateString);
    const todayEntry = dates.find((d) => d.dateStr === "2025-02-22");
    expect(todayEntry?.isToday).toBe(true);
  });

  it("uses correct day names", () => {
    const today = new Date("2025-02-22"); // Saturday
    const dates = getDatePickerDates(today, 3, 0, getLocalDateString);
    expect(dates[0].dayName).toBe("Lör");
  });
});
