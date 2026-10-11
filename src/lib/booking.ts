import { fullAddress, site } from "@/data/site";
import type { Booking } from "@/store/bookings";

const IST_MS = 330 * 60_000;
export const BOOKING_WINDOW_DAYS = 60;

/** yyyy-mm-dd for a moment, in IST. */
export const istDateKey = (d: Date) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);

/** Weekday (0 = Sunday) of an IST calendar date key. */
export const weekdayOf = (key: string) => new Date(`${key}T00:00:00Z`).getUTCDay();

export const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Opening hours as visit start times (SAMPLE): Mon–Sat 11–8:30, Sun 12–7. */
export function slotsFor(key: string) {
  const sunday = weekdayOf(key) === 0;
  const [from, to] = sunday ? [12, 18] : [11, 19];
  const out: string[] = [];
  for (let h = from; h <= to; h++) out.push(`${String(h).padStart(2, "0")}:00`);
  return out;
}

/** "11:00" -> "11 am", "13:30" -> "1:30 pm" */
export function slotLabel(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${suffix}`;
}

/** UTC instant for an IST date and slot. */
export const slotInstant = (key: string, slot: string) => new Date(new Date(`${key}T${slot}:00Z`).getTime() - IST_MS);

/**
 * Why a slot cannot be chosen, or null if it can. A few slots are shown as
 * already booked (deterministic sample) so the picker reads like a real diary.
 */
export function slotUnavailable(key: string, slot: string, taken: Booking[], now = new Date()) {
  if (slotInstant(key, slot).getTime() < now.getTime() + 60 * 60_000) return "past";
  if (taken.some((b) => b.date === key && b.slot === slot && b.status !== "cancelled")) return "booked";
  let hash = 0;
  for (const ch of `${key}${slot}`) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 6 === 0 ? "booked" : null;
}

export const visitMinutes = (b: Pick<Booking, "occasion">) => (b.occasion === "wedding" ? 90 : 60);

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** A standards-compliant calendar file for the visit. */
export function bookingIcs(b: Booking, pieceName?: string) {
  const start = slotInstant(b.date, b.slot);
  const end = new Date(start.getTime() + visitMinutes(b) * 60_000);
  const description = [
    `Booking reference ${b.id}.`,
    b.floor === "bridal" ? "First floor, the bridal salon." : "Ground floor.",
    pieceName ? `Piece to see: ${pieceName}.` : "",
    `Questions: ${site.phone.display} or WhatsApp.`,
  ]
    .filter(Boolean)
    .join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AHS Jewellers//Book a Visit//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@ahsjewellers.in`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(`Visit to ${site.name}`)}`,
    `LOCATION:${icsText(fullAddress())}`,
    `DESCRIPTION:${icsText(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(`Your visit to ${site.name}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Google Calendar "add event" link, for people without a calendar app. */
export function googleCalendarLink(b: Booking) {
  const start = slotInstant(b.date, b.slot);
  const end = new Date(start.getTime() + visitMinutes(b) * 60_000);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `Visit to ${site.name}`,
    dates: `${icsDate(start)}/${icsDate(end)}`,
    location: fullAddress(),
    details: `Booking reference ${b.id}`,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export const longDate = (key: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${key}T00:00:00Z`),
  );

/** Normalise any Indian mobile entry to "+91 98765 43210". */
export function formatIndianMobile(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^(91|0)/, "");
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : raw.trim();
}
