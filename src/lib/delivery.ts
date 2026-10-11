import { commerceTerms, site } from "@/data/site";
import { addDaysKey, dayLabel, todayKey } from "./dates";

/**
 * SAMPLE PIN code check for insured delivery. A courier’s serviceability API
 * replaces this before launch; these rules only make the demo behave believably.
 */

/** First two digits of a PIN to its state or region (India Post zones). */
const REGIONS: [string, string][] = [
  ["11", "Delhi"],
  ["12", "Haryana"],
  ["13", "Haryana"],
  ["14", "Punjab"],
  ["15", "Punjab"],
  ["16", "Chandigarh"],
  ["17", "Himachal Pradesh"],
  ["18", "Jammu and Kashmir"],
  ["19", "Jammu and Kashmir"],
  ["20", "Uttar Pradesh"],
  ["21", "Uttar Pradesh"],
  ["22", "Uttar Pradesh"],
  ["23", "Uttar Pradesh"],
  ["24", "Uttarakhand"],
  ["25", "Uttar Pradesh"],
  ["26", "Uttarakhand"],
  ["27", "Uttar Pradesh"],
  ["28", "Uttar Pradesh"],
  ["30", "Rajasthan"],
  ["31", "Rajasthan"],
  ["32", "Rajasthan"],
  ["33", "Rajasthan"],
  ["34", "Rajasthan"],
  ["36", "Gujarat"],
  ["37", "Gujarat"],
  ["38", "Gujarat"],
  ["39", "Gujarat"],
  ["40", "Maharashtra"],
  ["41", "Maharashtra"],
  ["42", "Maharashtra"],
  ["43", "Maharashtra"],
  ["44", "Maharashtra"],
  ["45", "Madhya Pradesh"],
  ["46", "Madhya Pradesh"],
  ["47", "Madhya Pradesh"],
  ["48", "Madhya Pradesh"],
  ["49", "Chhattisgarh"],
  ["50", "Telangana"],
  ["51", "Andhra Pradesh"],
  ["52", "Andhra Pradesh"],
  ["53", "Andhra Pradesh"],
  ["56", "Karnataka"],
  ["57", "Karnataka"],
  ["58", "Karnataka"],
  ["59", "Karnataka"],
  ["60", "Tamil Nadu"],
  ["61", "Tamil Nadu"],
  ["62", "Tamil Nadu"],
  ["63", "Tamil Nadu"],
  ["64", "Tamil Nadu"],
  ["67", "Kerala"],
  ["68", "Kerala"],
  ["69", "Kerala"],
  ["70", "West Bengal"],
  ["71", "West Bengal"],
  ["72", "West Bengal"],
  ["73", "West Bengal"],
  ["74", "West Bengal"],
  ["75", "Odisha"],
  ["76", "Odisha"],
  ["77", "Odisha"],
  ["78", "Assam"],
  ["79", "the North East"],
  ["80", "Bihar"],
  ["81", "Bihar"],
  ["82", "Jharkhand"],
  ["83", "Jharkhand"],
  ["84", "Bihar"],
  ["85", "Bihar"],
];

export type PinResult =
  | { ok: true; region: string; local: boolean; days: number; by: string }
  | { ok: false; reason: string };

export function checkPin(raw: string, today = todayKey()): PinResult {
  const pin = raw.replace(/\D/g, "");
  if (pin.length !== 6 || pin[0] === "0") return { ok: false, reason: "Please enter a valid six-digit PIN code." };
  // Island territories and army post offices: insured gold cannot be sent there.
  if (pin.startsWith("744") || pin[0] === "9") {
    return { ok: false, reason: "We cannot send insured gold to this PIN code yet. Choose showroom pickup, or call us to arrange it." };
  }
  const region = REGIONS.find(([p]) => pin.startsWith(p))?.[1];
  if (!region) return { ok: false, reason: "We could not find this PIN code. Please check it, or choose showroom pickup." };
  const local = pin.startsWith(site.address.pin.slice(0, 3));
  const days = local ? 1 : region === site.address.state ? 2 : region === "the North East" ? 6 : 4;
  // No deliveries on Sundays: move to Monday.
  let by = addDaysKey(today, days);
  if (new Date(`${by}T00:00:00Z`).getUTCDay() === 0) by = addDaysKey(by, 1);
  return { ok: true, region, local, days, by: dayLabel(by) };
}

export const deliveryFee = (subtotal: number, mode: "delivery" | "pickup") =>
  mode === "pickup" || subtotal >= commerceTerms.freeDeliveryFrom ? 0 : commerceTerms.insuredDeliveryFee;
