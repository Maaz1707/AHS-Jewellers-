/**
 * SAMPLE demo data for the member area and the owner’s admin panel.
 * Generated relative to "today" so the demo always looks current; the admin’s
 * "Reset demo data" regenerates it. None of these people are real.
 */
import { addDaysKey, addMonthsKey, isoAt, todayKey } from "@/lib/dates";
import { gramsForRupees, rateOn } from "@/lib/gold";
import { priceFor } from "@/lib/pricing";
import type { Booking } from "@/store/bookings";
import type { Enquiry } from "@/store/enquiries";
import type { GoldTxn } from "@/store/gold";
import { courierRefFor, orderFlow, type Order, type OrderLine, type OrderStatus } from "@/lib/orders";
import type { SchemeMember, SchemePayment } from "@/store/scheme";
import { products } from "./products";
import { ratesSeed } from "./rates";
import { commerceTerms } from "./site";

/** The member behind "Use sample member" in the account area. */
export const SAMPLE_MEMBER = { name: "Ananya Sharma", phone: "+91 98290 11223", email: "ananya.sharma@example.com" };

type MemberSeed = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  monthly: number;
  /** Instalments paid so far. */
  paid: number;
  /** Days from today until the next instalment falls due (negative = past). */
  nextDueIn: number;
};

const MEMBERS: MemberSeed[] = [
  { id: "SC-2026-0142", ...SAMPLE_MEMBER, monthly: 10000, paid: 6, nextDueIn: 3 },
  { id: "SC-2025-0118", name: "Rohit Agarwal", phone: "+91 98281 40562", monthly: 5000, paid: 9, nextDueIn: -12 },
  { id: "SC-2026-0151", name: "Meera Joshi", phone: "+91 94140 77231", monthly: 25000, paid: 2, nextDueIn: 16 },
  { id: "SC-2025-0097", name: "Imran Qureshi", phone: "+91 99280 15644", monthly: 3000, paid: 11, nextDueIn: 0 },
  { id: "SC-2026-0133", name: "Kavita Singh", phone: "+91 97845 20918", monthly: 2000, paid: 3, nextDueIn: -9 },
  { id: "SC-2026-0127", name: "Deepak Mehta", phone: "+91 98871 33025", monthly: 15000, paid: 7, nextDueIn: 2 },
  { id: "SC-2026-0158", name: "Sneha Kothari", phone: "+91 96600 41187", monthly: 7500, paid: 1, nextDueIn: 22 },
  { id: "SC-2026-0139", name: "Arjun Bhandari", phone: "+91 98290 66410", monthly: 50000, paid: 5, nextDueIn: 5 },
];

export function seedMembers(today = todayKey()): SchemeMember[] {
  return MEMBERS.map((s) => {
    // Work back from the next due date so every member lands where the demo needs them.
    const nextDate = addDaysKey(today, s.nextDueIn);
    const startDate = addMonthsKey(nextDate, -s.paid);
    const payments: SchemePayment[] = Array.from({ length: s.paid }, (_, i) => {
      const due = addMonthsKey(startDate, i);
      const early = (i * 3) % 4; // paid a few days before the due date
      return {
        n: i + 1,
        amount: s.monthly,
        paidOn: addDaysKey(due, -early),
        method: i % 3 === 1 ? "upi" : "counter",
        ref: `${s.id.slice(-4)}-${String(i + 1).padStart(2, "0")}`,
      };
    });
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      monthly: s.monthly,
      startDate,
      payments,
      status: "active",
      source: "seed",
      createdAt: isoAt(startDate, 12),
    };
  });
}

export function seedBookings(today = todayKey()): Booking[] {
  const rows: [number, string, string, string, Booking["occasion"], Booking["status"], string?, string?][] = [
    [1, "11:00", "Priya Malhotra", "+91 98290 51432", "wedding", "confirmed", "neelkanth-kundan-set", "Bringing my mother and sister. Wedding in February."],
    [2, "16:00", SAMPLE_MEMBER.name, SAMPLE_MEMBER.phone, "investment", "requested", "lakshmi-gold-coin-10g", "Would like to use my scheme balance."],
    [3, "13:00", "Vikram Rathore", "+91 94141 22908", "gifting", "requested", "solitaire-halo-ring", "Engagement ring, budget around 2.5 lakh."],
    [5, "18:00", "Nisha Gupta", "+91 98870 31120", "browsing", "confirmed"],
    [6, "12:00", "Sana Khan", "+91 99500 84471", "wedding", "requested", "polki-rani-haar"],
    [0, "17:00", "Harsh Vardhan", "+91 98280 90217", "gifting", "confirmed", "gold-coin-5g", "Two coins for Dhanteras."],
    [-2, "15:00", "Leela Iyer", "+91 94130 55762", "browsing", "completed"],
    [-5, "11:00", "Manish Jain", "+91 98292 10388", "wedding", "completed", "shagun-kada-pair"],
  ];
  return rows.map(([offset, slot, name, phone, occasion, status, pieceSlug, notes], i) => {
    const date = addDaysKey(today, offset);
    return {
      id: `BK-DEMO${i + 1}`,
      name,
      phone,
      date,
      slot,
      occasion,
      floor: occasion === "wedding" ? "bridal" : "ground",
      pieceSlug,
      notes,
      status,
      source: "seed",
      createdAt: isoAt(addDaysKey(date, -4), 10, 15),
    };
  });
}

export function seedEnquiries(today = todayKey()): Enquiry[] {
  const rows: [number, number, Partial<Enquiry>][] = [
    [0, 10, { type: "product", channel: "whatsapp", productSlug: "polki-rani-haar", status: "new" }],
    [0, 9, { type: "contact", channel: "form", name: "Ritu Bansal", phone: "+91 98290 44120", subject: "A custom piece", message: "Can you remake my grandmother’s rani haar in a lighter weight? I have photographs.", status: "new" }],
    [-1, 18, { type: "product", channel: "whatsapp", productSlug: "solitaire-halo-ring", status: "new" }],
    [-1, 12, { type: "wishlist", channel: "whatsapp", productSlugs: ["temple-jhumka", "nakshi-bangles", "kamal-pendant"], status: "replied" }],
    [-2, 16, { type: "product", channel: "whatsapp", productSlug: "lakshmi-gold-coin-10g", name: SAMPLE_MEMBER.name, phone: SAMPLE_MEMBER.phone, status: "replied" }],
    [-3, 11, { type: "contact", channel: "form", name: "Aamir Sheikh", phone: "+91 97830 66219", subject: "Old gold exchange", message: "I have about 40 g of old bangles to exchange. What should I bring?", status: "replied" }],
    [-4, 15, { type: "product", channel: "whatsapp", productSlug: "neelkanth-kundan-set", status: "closed" }],
    [-5, 13, { type: "general", channel: "whatsapp", status: "closed" }],
    [-6, 17, { type: "product", channel: "whatsapp", productSlug: "leher-diamond-necklace", status: "replied" }],
    [-8, 11, { type: "contact", channel: "form", name: "Pooja Rathi", phone: "+91 94142 80733", subject: "Savings scheme", message: "Can I start the scheme with 3,000 a month and increase it later?", status: "closed" }],
    [-10, 19, { type: "product", channel: "whatsapp", productSlug: "gokhru-kada", status: "closed" }],
    [-12, 14, { type: "product", channel: "whatsapp", productSlug: "tennis-necklace", status: "closed" }],
  ];
  return rows.map(([offset, hour, e], i) => ({
    id: `EQ-DEMO${String(i + 1).padStart(2, "0")}`,
    type: "general",
    channel: "whatsapp",
    status: "new",
    source: "seed",
    createdAt: isoAt(addDaysKey(today, offset), hour, (i * 7) % 60),
    ...e,
  })) as Enquiry[];
}

type OrderSeed = {
  daysAgo: number;
  name: string;
  phone: string;
  items: [string, number][];
  fulfilment: Order["fulfilment"];
  address?: Order["address"];
  status: OrderStatus;
  method: Order["payment"]["method"];
};

const ORDERS: OrderSeed[] = [
  { daysAgo: 0, name: "Rahul Saxena", phone: "+91 98291 70345", items: [["gold-coin-5g", 2]], fulfilment: "delivery", address: { line1: "B-42, Malviya Nagar", city: "Jaipur", state: "Rajasthan", pin: "302017" }, status: "placed", method: "upi" },
  { daysAgo: 1, name: "Shalini Verma", phone: "+91 99288 41207", items: [["open-heart-pendant", 1], ["cable-chain", 1]], fulfilment: "delivery", address: { line1: "Flat 1102, Lodha Bellissimo", line2: "Mahalaxmi", city: "Mumbai", state: "Maharashtra", pin: "400011" }, status: "packed", method: "card" },
  { daysAgo: 2, name: SAMPLE_MEMBER.name, phone: SAMPLE_MEMBER.phone, items: [["lakshmi-gold-coin-10g", 1]], fulfilment: "delivery", address: { line1: "17, Shanti Path", line2: "Tilak Nagar", city: "Jaipur", state: "Rajasthan", pin: "302004" }, status: "shipped", method: "upi" },
  { daysAgo: 3, name: "Farah Ali", phone: "+91 98870 22416", items: [["petite-studs", 1]], fulfilment: "pickup", status: "ready", method: "netbanking" },
  { daysAgo: 6, name: "Gaurav Khandelwal", phone: "+91 94140 39857", items: [["gold-bar-20g", 1]], fulfilment: "pickup", status: "collected", method: "netbanking" },
  { daysAgo: 9, name: "Ishita Rao", phone: "+91 96029 51873", items: [["halo-pendant", 1]], fulfilment: "delivery", address: { line1: "22, 3rd Cross, Indiranagar", city: "Bengaluru", state: "Karnataka", pin: "560038" }, status: "delivered", method: "card" },
  { daysAgo: 13, name: "Vandana Mathur", phone: "+91 98282 67190", items: [["sikka-pendant", 1], ["box-chain", 1]], fulfilment: "delivery", address: { line1: "C-9, Shastri Nagar", city: "Jodhpur", state: "Rajasthan", pin: "342003" }, status: "delivered", method: "upi" },
  { daysAgo: 21, name: SAMPLE_MEMBER.name, phone: SAMPLE_MEMBER.phone, items: [["jaali-pendant", 1]], fulfilment: "pickup", status: "collected", method: "upi" },
];

export function seedOrders(today = todayKey()): Order[] {
  return ORDERS.map((s, i) => {
    const day = addDaysKey(today, -s.daysAgo);
    const id = `ORD-${day.slice(0, 4)}-${String(1040 - i).padStart(4, "0")}`;
    const lines: OrderLine[] = s.items.map(([slug, qty]) => {
      const p = products.find((x) => x.slug === slug)!;
      return { slug, name: p.name, code: p.code, purity: p.purity, weight: p.weight, qty, unitPrice: priceFor(p, ratesSeed.rates) };
    });
    const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
    const delivery = s.fulfilment === "pickup" || subtotal >= commerceTerms.freeDeliveryFrom ? 0 : commerceTerms.insuredDeliveryFee;
    const flow = orderFlow[s.fulfilment];
    const steps = flow.slice(0, flow.indexOf(s.status) + 1);
    // Each step a little after the last: packing the next morning, courier the day after.
    const history = steps.map((status, k) => ({ status, at: isoAt(addDaysKey(day, Math.min(k, s.daysAgo)), k === 0 ? 11 + (i % 6) : 10 + k, (i * 13) % 60) }));
    return {
      id,
      name: s.name,
      phone: s.phone,
      fulfilment: s.fulfilment,
      address: s.address,
      lines,
      subtotal,
      delivery,
      total: subtotal + delivery,
      rates: ratesSeed.rates,
      payment: { method: s.method, ref: `PAY-DEMO-${id.slice(-4)}`, demo: true },
      status: s.status,
      history,
      courierRef: steps.includes("shipped") ? courierRefFor({ id, address: s.address }) : undefined,
      source: "seed",
      createdAt: history[0].at,
    } satisfies Order;
  });
}

/** [days ago, rupees, method]. The sample member buys a little most months. */
const SAMPLE_GOLD: [number, number, GoldTxn["method"]][] = [
  [214, 5000, "upi"],
  [184, 2000, "upi"],
  [153, 2000, "upi"],
  [122, 11000, "netbanking"],
  [92, 2000, "upi"],
  [61, 3000, "upi"],
  [31, 2000, "upi"],
  [9, 5100, "card"],
];

const OTHER_GOLD: [number, string, string, number, GoldTxn["method"]][] = [
  [0, "Rohit Agarwal", "+91 98281 40562", 1000, "upi"],
  [1, "Tanvi Choudhary", "+91 98292 77450", 500, "upi"],
  [2, "Meera Joshi", "+91 94140 77231", 25000, "netbanking"],
  [3, "Aditya Pareek", "+91 97850 13369", 2100, "upi"],
  [4, "Tanvi Choudhary", "+91 98292 77450", 500, "upi"],
  [6, "Kunal Sethi", "+91 99830 41288", 10000, "card"],
  [8, "Rohit Agarwal", "+91 98281 40562", 1000, "upi"],
  [11, "Aditya Pareek", "+91 97850 13369", 1100, "upi"],
  [12, "Pallavi Nair", "+91 96940 30215", 51000, "netbanking"],
  [15, "Tanvi Choudhary", "+91 98292 77450", 500, "upi"],
  [19, "Kunal Sethi", "+91 99830 41288", 5000, "card"],
  [24, "Rohit Agarwal", "+91 98281 40562", 1000, "upi"],
  [27, "Meera Joshi", "+91 94140 77231", 15000, "netbanking"],
];

export function seedGoldTxns(today = todayKey()): GoldTxn[] {
  const rates = ratesSeed.rates;
  const buy = (i: number, daysAgo: number, name: string, phone: string, amount: number, method: GoldTxn["method"]): GoldTxn => {
    const day = addDaysKey(today, -daysAgo);
    const rate = rateOn(day, rates, today);
    return { id: `DG-DEMO${String(i).padStart(2, "0")}`, name, phone, type: "buy", grams: gramsForRupees(amount, rate), rate, amount, method, source: "seed", at: isoAt(day, 9 + (i % 10), (i * 11) % 60) };
  };
  const mine = SAMPLE_GOLD.map(([d, amount, method], i) => buy(i + 1, d, SAMPLE_MEMBER.name, SAMPLE_MEMBER.phone, amount, method));
  const others = OTHER_GOLD.map(([d, name, phone, amount, method], i) => buy(i + 20, d, name, phone, amount, method));
  // One customer has already turned part of their gold into a pair of studs.
  const redeemDay = addDaysKey(today, -5);
  const redeemRate = rateOn(redeemDay, rates, today);
  const redeemed: GoldTxn = {
    id: "DG-DEMO40",
    name: "Pallavi Nair",
    phone: "+91 96940 30215",
    type: "redeem",
    grams: 2.2,
    rate: redeemRate,
    amount: Math.round(2.2 * redeemRate),
    method: "counter",
    note: "Redeemed at the counter against Petite Bar Studs",
    source: "seed",
    at: isoAt(redeemDay, 17, 20),
  };
  return [...mine, ...others, redeemed].sort((a, b) => b.at.localeCompare(a.at));
}
