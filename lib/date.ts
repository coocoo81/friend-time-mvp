import { eachDayOfInterval, format, isValid, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function toDateOnlyString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDateOnly(value: string) {
  const parsed = parseISO(`${value}T00:00:00`);
  return isValid(parsed) ? parsed : null;
}

export function enumerateDates(startDate: Date, endDate: Date) {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

export function formatDisplayDate(date: Date) {
  return format(date, "M月d日 EEE", { locale: zhCN });
}
