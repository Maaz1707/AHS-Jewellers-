import type { RateSet } from "@/data/rates";
import type { Product } from "@/data/products";

export const GST_RATE = 0.03;

/**
 * Indicative price: gold value at today’s rate, plus making charge, plus stones,
 * plus 3% GST. Rounded to the nearest ₹10 like a counter quote.
 */
export function priceFor(product: Product, rates: RateSet) {
  const gold = product.weight * rates[product.purity];
  const making = gold * product.making;
  const stones = product.stones?.value ?? 0;
  const subtotal = gold + making + stones;
  const total = subtotal * (1 + GST_RATE);
  return Math.round(total / 10) * 10;
}

/** Each part of the indicative price, for breakdowns in the bag and checkout. */
export function priceParts(product: Product, rates: RateSet) {
  const rate = rates[product.purity];
  const gold = product.weight * rate;
  const making = gold * product.making;
  const stones = product.stones?.value ?? 0;
  const gst = (gold + making + stones) * GST_RATE;
  return { rate, gold, making, stones, gst, total: priceFor(product, rates) };
}
