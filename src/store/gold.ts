import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedGoldTxns } from "@/data/demo";
import { storage } from "./storage";

/**
 * DEMO digital gold ledger. Purchases go through a demo confirmation: no money
 * moves and no gold is bought. A real build connects a licensed vault partner.
 */

export type GoldTxnType = "buy" | "redeem";

export type GoldTxn = {
  id: string;
  name: string;
  phone: string;
  type: GoldTxnType;
  grams: number;
  /** 24K rate per gram used for the transaction. */
  rate: number;
  /** Rupees paid (buy, GST included) or value redeemed at the counter. */
  amount: number;
  method?: "upi" | "card" | "netbanking" | "counter";
  /** For redemptions: what the gold became. */
  note?: string;
  demo?: boolean;
  source: "site" | "seed";
  at: string;
};

type GoldState = {
  txns: GoldTxn[];
  buy: (t: Pick<GoldTxn, "name" | "phone" | "grams" | "rate" | "amount" | "method">) => GoldTxn;
  reset: () => void;
};

export const useGold = create<GoldState>()(
  persist(
    (set, get) => ({
      txns: seedGoldTxns(),
      buy: (t) => {
        const n = get().txns.length + 1;
        const txn: GoldTxn = {
          ...t,
          id: `DG-${Date.now().toString(36).toUpperCase().slice(-5)}${String(n).padStart(2, "0")}`,
          type: "buy",
          demo: true,
          source: "site",
          at: new Date().toISOString(),
        };
        set((s) => ({ txns: [txn, ...s.txns] }));
        return txn;
      },
      reset: () => set({ txns: seedGoldTxns() }),
    }),
    { name: "ahs-gold", version: 1, storage, skipHydration: true },
  ),
);
