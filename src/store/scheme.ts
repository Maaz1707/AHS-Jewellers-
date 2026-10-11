import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedMembers } from "@/data/demo";
import { schemeTerms } from "@/data/site";
import { todayKey } from "@/lib/dates";
import { storage } from "./storage";

/** Scheme limits, read from the SAMPLE terms in site.ts. */
export const SCHEME = {
  instalments: schemeTerms.instalments,
  bonusInstalments: schemeTerms.bonusInstalments,
  minMonthly: schemeTerms.minMonthly,
  maxMonthly: schemeTerms.maxMonthly,
  step: schemeTerms.step,
} as const;

export { schemeMaturity } from "@/lib/scheme";

export type PaymentMethod = "counter" | "upi" | "card" | "netbanking";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  counter: "At the counter",
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
};

export type SchemePayment = {
  /** Instalment number, 1 to 11. */
  n: number;
  amount: number;
  /** yyyy-mm-dd */
  paidOn: string;
  method: PaymentMethod;
  ref: string;
  /** True when made through the demo payment step. */
  demo?: boolean;
};

export type SchemeMember = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  monthly: number;
  /** Due date of the first instalment, yyyy-mm-dd. */
  startDate: string;
  payments: SchemePayment[];
  status: "active" | "redeemed" | "closed";
  source: "seed" | "site";
  createdAt: string;
};

type SchemeState = {
  members: SchemeMember[];
  enrol: (m: Pick<SchemeMember, "name" | "phone" | "monthly"> & { email?: string; startDate?: string }) => SchemeMember;
  /** Records the next instalment as received. Returns the payment, or null when the scheme is complete. */
  recordPayment: (id: string, method: PaymentMethod, opts?: { demo?: boolean; paidOn?: string }) => SchemePayment | null;
  reset: () => void;
};

const nextId = (members: SchemeMember[]) => {
  const year = todayKey().slice(0, 4);
  const max = members.reduce((n, m) => Math.max(n, Number(m.id.slice(-4)) || 0), 160);
  return `SC-${year}-${String(max + 1).padStart(4, "0")}`;
};

export const useScheme = create<SchemeState>()(
  persist(
    (set, get) => ({
      members: seedMembers(),
      enrol: (m) => {
        const member: SchemeMember = {
          id: nextId(get().members),
          name: m.name,
          phone: m.phone,
          email: m.email,
          monthly: m.monthly,
          startDate: m.startDate ?? todayKey(),
          payments: [],
          status: "active",
          source: "site",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ members: [member, ...s.members] }));
        return member;
      },
      recordPayment: (id, method, opts) => {
        const member = get().members.find((m) => m.id === id);
        if (!member || member.payments.length >= schemeTerms.instalments) return null;
        const n = member.payments.length + 1;
        const payment: SchemePayment = {
          n,
          amount: member.monthly,
          paidOn: opts?.paidOn ?? todayKey(),
          method,
          ref: `${id.slice(-4)}-${String(n).padStart(2, "0")}${opts?.demo ? "-D" : ""}`,
          demo: opts?.demo,
        };
        set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, payments: [...m.payments, payment] } : m)) }));
        return payment;
      },
      reset: () => set({ members: seedMembers() }),
    }),
    {
      name: "ahs-scheme",
      // v2: payment history and demo members.
      version: 2,
      storage,
      skipHydration: true,
      migrate: () => ({ members: seedMembers() }) as SchemeState,
    },
  ),
);

/** Find a member by phone, ignoring spaces and the +91 prefix. */
export const samePhone = (a?: string, b?: string) => {
  const n = (s?: string) => (s ?? "").replace(/\D/g, "").replace(/^(91|0)/, "");
  return Boolean(a && b && n(a) === n(b) && n(a).length === 10);
};
