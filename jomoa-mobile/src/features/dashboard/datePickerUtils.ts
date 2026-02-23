/**
 * Pure logic for HorizontalDatePicker – testable without Tamagui
 */

const DAY_NAMES = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

export interface DatePickerDate {
  dateStr: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
}

export function getDatePickerDates(
  today: Date,
  daysToShow: number,
  startOffset: number,
  getLocalDateString: (d: Date) => string
): DatePickerDate[] {
  const todayStr = getLocalDateString(today);
  return Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + startOffset);
    return {
      dateStr: getLocalDateString(d),
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: getLocalDateString(d) === todayStr,
    };
  });
}
