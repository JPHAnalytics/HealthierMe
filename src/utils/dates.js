import { AF_DAYS } from "./constants";

export function getDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isAFDay(date) {
  return AF_DAYS.includes(date.getDay());
}

export function getToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getDaysInRange(startDate, days) {
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    result.push(d);
  }
  return result;
}

export function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function parseDateKey(key) {
  return new Date(key + "T00:00:00");
}
