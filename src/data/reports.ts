import { addDaysKey, addMonthsKey, todayKey } from "@/lib/dates";

/**
 * SAMPLE figures for the admin Reports page. Generated from a fixed seed and
 * dated around today, so the charts look current and the same on every load.
 * Replace with real analytics, POS and order data when the site goes live.
 */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const weekday = (key: string) => new Date(`${key}T00:00:00Z`).getUTCDay();

export type Point = { key: string; value: number };

export function sampleReports(today = todayKey()) {
  const r = seeded(20261010);

  // Visitors per day for 60 days: weekends busier, a festive rise into October.
  const visitors: Point[] = Array.from({ length: 60 }, (_, i) => {
    const key = addDaysKey(today, i - 59);
    const wd = weekday(key);
    const weekend = wd === 0 || wd === 6 ? 1.35 : wd === 5 ? 1.12 : 1;
    const trend = 1 + (i / 59) * 0.45;
    return { key, value: Math.round(420 * weekend * trend * (0.88 + r() * 0.24)) };
  });

  const sources = [
    { label: "Search", value: 41 },
    { label: "Instagram", value: 24 },
    { label: "Shared on WhatsApp", value: 17 },
    { label: "Typed the address", value: 12 },
    { label: "Other sites", value: 6 },
  ];

  // Enquiries and visit bookings per week, twelve weeks.
  const weeks = Array.from({ length: 12 }, (_, i) => addDaysKey(today, (i - 11) * 7));
  const enquiries: Point[] = weeks.map((key, i) => ({ key, value: Math.round(38 + i * 2.6 + r() * 14) }));
  const bookings: Point[] = weeks.map((key, i) => ({ key, value: Math.round(11 + i * 1.1 + r() * 6) }));

  // Twelve months of scheme membership and collections, and online sales.
  const months = Array.from({ length: 12 }, (_, i) => addMonthsKey(today.slice(0, 8) + "01", i - 11));
  let members = 96;
  const schemeMembers: Point[] = months.map((key) => {
    members += Math.round(4 + r() * 7);
    return { key, value: members };
  });
  const schemeCollections: Point[] = schemeMembers.map((m) => ({ key: m.key, value: Math.round(m.value * (8600 + r() * 1400)) }));
  const onlineSales: Point[] = months.map((key, i) => {
    // Online buying started six months ago; Dhanteras and wedding months lift it.
    if (i < 6) return { key, value: 0 };
    const festive = /-(10|11)-/.test(key) ? 1.6 : 1;
    return { key, value: Math.round((180000 + (i - 6) * 65000 + r() * 90000) * festive) };
  });
  const showroomSales: Point[] = months.map((key) => {
    const festive = /-(10|11)-/.test(key) ? 1.45 : /-(01|02|04|05|12)-/.test(key) ? 1.2 : 1;
    return { key, value: Math.round((5200000 + r() * 1600000) * festive) };
  });

  return { visitors, sources, enquiries, bookings, schemeMembers, schemeCollections, onlineSales, showroomSales };
}
