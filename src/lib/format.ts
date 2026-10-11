const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,24,500 */
export const formatINR = (value: number) => inrFormatter.format(Math.round(value));

/** 1,24,500 (no symbol) */
export const formatNumber = (value: number) => numberFormatter.format(Math.round(value));

/** 12.4 g */
export const formatGrams = (grams: number) =>
  `${grams % 1 === 0 ? grams.toFixed(0) : grams.toFixed(1)} g`;

/** "10:30 am" in IST */
export const formatTimeIST = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })
    .format(date)
    .replace(/\s?(AM|PM)$/i, (_, p: string) => ` ${p.toLowerCase()}`);

/** "10 Oct" in IST */
export const formatDayIST = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(date);

/** Percentage change, signed, one decimal: "+0.4%" */
export const formatChange = (now: number, before: number) => {
  if (!before) return "0.0%";
  const pct = ((now - before) / before) * 100;
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
};
