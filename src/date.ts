const DAY_MS = 86_400_000;

export function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

export function daysUntilDate(value: string, now = new Date()) {
  if (!isValidCalendarDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const target = Date.UTC(year!, month! - 1, day!);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / DAY_MS);
}
