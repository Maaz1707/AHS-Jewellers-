/**
 * SAMPLE gold and silver rates, in rupees per gram.
 * In Phase 3 these are edited from the admin; the store persists the edits.
 */

export type Metal = "24K" | "22K" | "18K" | "silver";

export type RateSet = Record<Metal, number>;

export type RatesSeed = {
  rates: RateSet;
  /** Yesterday’s closing rates, used to show the day’s movement. */
  previous: RateSet;
  /** ISO time of the last update. `null` means "today’s opening, 10:30 am IST". */
  updatedAt: string | null;
};

export const ratesSeed: RatesSeed = {
  rates: { "24K": 12840, "22K": 11770, "18K": 9630, silver: 168 },
  previous: { "24K": 12795, "22K": 11730, "18K": 9596, silver: 170 },
  updatedAt: null,
};

export const metalLabels: Record<Metal, { name: string; detail: string }> = {
  "24K": { name: "24K Gold", detail: "99.9% pure. Coins and bars." },
  "22K": { name: "22K Gold", detail: "91.6% pure. Most of our jewellery." },
  "18K": { name: "18K Gold", detail: "75% pure. Diamond and fine jewellery." },
  silver: { name: "Silver", detail: "99.9% fine silver." },
};

/** Fineness of each metal relative to 24K, used to derive the lower karats. */
export const FINENESS: Record<Exclude<Metal, "silver">, number> = { "24K": 1, "22K": 0.9167, "18K": 0.75 };

export type RatePoint = { day: number } & RateSet;

/**
 * SAMPLE 30-day history, ending on today’s seed rates. Generated from a fixed
 * seed so server and client render the same chart. `day` counts back: 0 is today.
 */
export function sampleHistory(today: RateSet, days = 30): RatePoint[] {
  let seed = 20261010;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const gold: number[] = [today["24K"]];
  const silver: number[] = [today.silver];
  for (let i = 1; i < days; i++) {
    // Walk backwards with a gentle upward drift into today, as gold has trended.
    gold.push(gold[i - 1] * (1 - (rand() - 0.455) * 0.01));
    silver.push(silver[i - 1] * (1 - (rand() - 0.47) * 0.02));
  }
  return gold
    .map((g, i) => ({
      day: i,
      "24K": Math.round(g),
      "22K": i === 0 ? today["22K"] : Math.round(g * FINENESS["22K"]),
      "18K": i === 0 ? today["18K"] : Math.round(g * FINENESS["18K"]),
      silver: Math.round(silver[i]),
    }))
    .reverse();
}

/** The time rates are published each morning, IST. */
export const RATE_PUBLISH_HOUR = 10;
export const RATE_PUBLISH_MINUTE = 30;
