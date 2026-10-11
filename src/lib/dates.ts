/** Calendar-date helpers. Dates are yyyy-mm-dd keys in IST, so they never drift with time zones. */

const IST_MS = 330 * 60_000;

export const todayKey = (now = new Date()) => new Date(now.getTime() + IST_MS).toISOString().slice(0, 10);

export const addDaysKey = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Same day-of-month n months later, clamped to the month’s last day. */
export const addMonthsKey = (key: string, n: number) => {
  const [y, m, d] = key.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
};

export const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000);

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: "UTC" });

/** "18 Oct 2026" */
export const shortDate = (key: string) => fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(`${key}T00:00:00Z`));

/** "Oct 2026" */
export const monthLabel = (key: string) => fmt({ month: "short", year: "numeric" }).format(new Date(`${key}T00:00:00Z`));

/** "Sun, 18 Oct" */
export const dayLabel = (key: string) => fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(`${key}T00:00:00Z`));

/** ISO timestamp -> "18 Oct, 3:42 pm" in IST */
export const stamp = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
    .format(new Date(iso))
    .replace(/\s?(am|pm)$/i, (m) => m.toLowerCase());

/** "today", "yesterday", "3 days ago", "in 2 days" */
export function relativeDay(key: string, today = todayKey()) {
  const d = daysBetween(today, key);
  if (d === 0) return "today";
  if (d === -1) return "yesterday";
  if (d === 1) return "tomorrow";
  return d < 0 ? `${-d} days ago` : `in ${d} days`;
}

/** ISO timestamp for a date key at a given IST hour, used by seed data. */
export const isoAt = (key: string, hour: number, minute = 0) =>
  new Date(new Date(`${key}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`).getTime() - IST_MS).toISOString();

/** "Saturday, 10 October" */
export const longDateKey = (key: string) =>
  fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date(`${key}T00:00:00Z`));
