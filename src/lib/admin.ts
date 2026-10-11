import { schemeTerms, site } from "@/data/site";
import type { Booking } from "@/store/bookings";
import type { Enquiry } from "@/store/enquiries";
import type { GoldTxn } from "@/store/gold";
import type { SchemeMember } from "@/store/scheme";
import type { Order } from "./orders";
import { slotLabel, longDate } from "./booking";
import { daysBetween, shortDate, todayKey } from "./dates";
import { formatINR } from "./format";
import { memberState, nextDue, type MemberState } from "./scheme";

/** Ten-digit Indian mobile, or null. */
export const phoneDigits = (phone?: string) => {
  const d = (phone ?? "").replace(/\D/g, "").replace(/^(91|0)/, "");
  return d.length === 10 ? d : null;
};

/** wa.me link to a customer’s own number, with a pre-typed message. */
export const waTo = (phone: string | undefined, message: string) => {
  const d = phoneDigits(phone);
  return d ? `https://wa.me/91${d}?text=${encodeURIComponent(message)}` : null;
};

const firstName = (name: string) => name.split(" ")[0];

export function reminderMessage(m: SchemeMember, today = todayKey()) {
  const next = nextDue(m);
  if (!next) {
    return `Namaste ${firstName(m.name)}, this is ${site.name}. Your ${schemeTerms.name} (${m.id}) is complete and ready to redeem. Come in whenever suits you and we will have pieces ready.`;
  }
  const late = daysBetween(next.date, today) > 0;
  return `Namaste ${firstName(m.name)}, this is ${site.name}. A gentle reminder that instalment ${next.n} of ${formatINR(m.monthly)} for your ${schemeTerms.name} (${m.id}) ${late ? "was due" : "is due"} on ${shortDate(next.date)}. You can pay at the counter or in your member area. Thank you.`;
}

export const visitConfirmMessage = (b: Booking) =>
  `Namaste ${firstName(b.name)}, this is ${site.name}. Your visit on ${longDate(b.date)} at ${slotLabel(b.slot)} is confirmed${
    b.floor === "bridal" ? " in our bridal salon on the first floor" : ""
  }. We look forward to seeing you.`;

export const enquiryReplyMessage = (q: Enquiry, pieceNames: string[]) =>
  `Namaste${q.name ? ` ${firstName(q.name)}` : ""}, thank you for your message to ${site.name}.${
    pieceNames.length ? ` About the ${pieceNames.join(", ")}: ` : " "
  }`;

export type Customer = {
  key: string;
  name: string;
  phone: string;
  email?: string;
  enquiries: Enquiry[];
  bookings: Booking[];
  members: SchemeMember[];
  orders: Order[];
  gold: GoldTxn[];
  lastActivity: string;
  memberState?: MemberState;
};

/** One row per phone number, drawn from every place a customer leaves their details. */
export function buildCustomers(enquiries: Enquiry[], bookings: Booking[], members: SchemeMember[], orders: Order[] = [], gold: GoldTxn[] = []): Customer[] {
  const map = new Map<string, Customer>();
  const touch = (phone: string | undefined, name: string | undefined, at: string, email?: string) => {
    const key = phoneDigits(phone);
    if (!key) return null;
    const c = map.get(key) ?? { key, name: name ?? "", phone: phone ?? "", enquiries: [], bookings: [], members: [], orders: [], gold: [], lastActivity: at };
    if (!c.name && name) c.name = name;
    if (!c.email && email) c.email = email;
    if (at > c.lastActivity) c.lastActivity = at;
    map.set(key, c);
    return c;
  };
  members.forEach((m) => {
    const last = m.payments.at(-1)?.paidOn ?? m.createdAt.slice(0, 10);
    const c = touch(m.phone, m.name, `${last}T12:00:00.000Z`, m.email);
    c?.members.push(m);
  });
  bookings.forEach((b) => touch(b.phone, b.name, b.createdAt, b.email)?.bookings.push(b));
  enquiries.forEach((q) => touch(q.phone, q.name, q.createdAt, q.email)?.enquiries.push(q));
  orders.forEach((o) => touch(o.phone, o.name, o.createdAt, o.email)?.orders.push(o));
  gold.forEach((t) => touch(t.phone, t.name, t.at)?.gold.push(t));
  return [...map.values()]
    .map((c) => ({ ...c, memberState: c.members[0] ? memberState(c.members[0]) : undefined }))
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
}

export function greeting(now = new Date()) {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(now));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export const orderUpdateMessage = (o: Order, statusLabel: string) =>
  `Namaste ${o.name.split(" ")[0]}, an update on your ${site.name} order ${o.id}: ${statusLabel.toLowerCase()}.${
    o.courierRef && o.status === "shipped" ? ` Courier reference ${o.courierRef}.` : ""
  }${o.status === "ready" ? ` It is ready to collect at the showroom; please bring a photo ID.` : ""} Thank you.`;
