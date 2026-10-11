import type { RateSet } from "@/data/rates";

/**
 * Order types, wording and flow, shared by the store, the seed data, checkout,
 * tracking and the admin panel.
 */

export type Fulfilment = "delivery" | "pickup";
export type OrderPayment = "upi" | "card" | "netbanking";

export type OrderStatus = "placed" | "packed" | "shipped" | "out-for-delivery" | "delivered" | "ready" | "collected" | "cancelled";

export const orderPaymentLabels: Record<OrderPayment, string> = { upi: "UPI", card: "Card", netbanking: "Net banking" };

/** Customer-facing wording for each step. */
export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: "Order placed",
  packed: "Weighed and packed",
  shipped: "With the insured courier",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  ready: "Ready to collect",
  collected: "Collected",
  cancelled: "Cancelled",
};

/** The steps each kind of order moves through, in order. */
export const orderFlow: Record<Fulfilment, OrderStatus[]> = {
  delivery: ["placed", "packed", "shipped", "out-for-delivery", "delivered"],
  pickup: ["placed", "packed", "ready", "collected"],
};

export const isOrderOpen = (o: Order) => o.status !== "cancelled" && o.status !== "delivered" && o.status !== "collected";

export type OrderLine = {
  slug: string;
  name: string;
  code: string;
  purity: string;
  weight: number;
  qty: number;
  /** Price of one piece at the rate on the day of the order, GST included. */
  unitPrice: number;
};

export type Address = { line1: string; line2?: string; city: string; state: string; pin: string };

export type Order = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  fulfilment: Fulfilment;
  address?: Address;
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  total: number;
  /** Rates the order was priced at. */
  rates: RateSet;
  payment: { method: OrderPayment; ref: string; demo: true };
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  /** Courier reference once shipped (sample). */
  courierRef?: string;
  source: "site" | "seed";
  createdAt: string;
};

/** SAMPLE insured courier reference. */
export const courierRefFor = (o: Pick<Order, "id" | "address">) => `INS-${o.id.slice(-4)}-${(o.address?.pin ?? "302001").slice(-3)}`;

export const nextStatus =(o: Order): OrderStatus | null => {
  const flow = orderFlow[o.fulfilment];
  const i = flow.indexOf(o.status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
};
