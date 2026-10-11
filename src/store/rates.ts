import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ratesSeed, type RateSet } from "@/data/rates";
import { storage } from "./storage";

export type RateChange = { at: string; rates: RateSet };

type RatesState = {
  rates: RateSet;
  previous: RateSet;
  updatedAt: string | null;
  /** Most recent first; kept short. */
  log: RateChange[];
  setRates: (rates: RateSet) => void;
  reset: () => void;
};

export const useRates = create<RatesState>()(
  persist(
    (set, get) => ({
      ...ratesSeed,
      log: [],
      setRates: (rates) => {
        const at = new Date().toISOString();
        set({ previous: get().rates, rates, updatedAt: at, log: [{ at, rates }, ...get().log].slice(0, 20) });
      },
      reset: () => set({ ...ratesSeed, log: [] }),
    }),
    { name: "ahs-rates", version: 2, storage, skipHydration: true, migrate: (p) => ({ ...(p as object), log: [] }) as unknown as RatesState },
  ),
);
