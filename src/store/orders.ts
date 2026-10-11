import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedOrders } from "@/data/demo";
import { todayKey } from "@/lib/dates";
import { courierRefFor, nextStatus, type Order, type OrderPayment, type OrderStatus } from "@/lib/orders";
import { storage } from "./storage";

export * from "@/lib/orders";

/**
 * DEMO orders. Placed through the demo checkout: no money moves and no card or
 * bank details are collected. The owner advances each order from the admin.
 */

type OrdersState = {
  orders: Order[];
  place: (o: Omit<Order, "id" | "status" | "history" | "source" | "createdAt" | "payment"> & { method: OrderPayment }) => Order;
  /** Move an order to its next step. Returns the new status, or null at the end. */
  advance: (id: string) => OrderStatus | null;
  cancel: (id: string) => void;
  reset: () => void;
};

const nextId = (orders: Order[]) => {
  const year = todayKey().slice(0, 4);
  const max = orders.reduce((n, o) => Math.max(n, Number(o.id.slice(-4)) || 0), 1040);
  return `ORD-${year}-${String(max + 1).padStart(4, "0")}`;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedOrders(),
      place: ({ method, ...o }) => {
        const at = new Date().toISOString();
        const id = nextId(get().orders);
        const order: Order = {
          ...o,
          id,
          payment: { method, ref: `PAY-DEMO-${id.slice(-4)}${Math.floor(Math.random() * 90 + 10)}`, demo: true },
          status: "placed",
          history: [{ status: "placed", at }],
          source: "site",
          createdAt: at,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      advance: (id) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) return null;
        const next = nextStatus(order);
        if (!next) return null;
        const at = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: next,
                  history: [...o.history, { status: next, at }],
                  courierRef: next === "shipped" ? courierRefFor(o) : o.courierRef,
                }
              : o,
          ),
        }));
        return next;
      },
      cancel: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: "cancelled", history: [...o.history, { status: "cancelled", at: new Date().toISOString() }] } : o,
          ),
        })),
      reset: () => set({ orders: seedOrders() }),
    }),
    { name: "ahs-orders", version: 1, storage, skipHydration: true },
  ),
);
