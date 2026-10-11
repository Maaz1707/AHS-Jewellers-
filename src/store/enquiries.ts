import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedEnquiries } from "@/data/demo";
import { storage } from "./storage";

export type EnquiryType = "product" | "wishlist" | "general" | "contact";
export type EnquiryStatus = "new" | "replied" | "closed";

export const enquiryTypeLabels: Record<EnquiryType, string> = {
  product: "About a piece",
  wishlist: "Wishlist",
  general: "General",
  contact: "Contact form",
};

export const enquiryStatusLabels: Record<EnquiryStatus, string> = { new: "New", replied: "Replied", closed: "Closed" };

export type Enquiry = {
  id: string;
  type: EnquiryType;
  channel: "whatsapp" | "form" | "phone";
  /** Single piece (product enquiries). */
  productSlug?: string;
  /** Several pieces (wishlist enquiries). */
  productSlugs?: string[];
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  /** Page the enquiry was made from. */
  pageUrl?: string;
  status: EnquiryStatus;
  /** "site": made on this device. "seed": demo data. */
  source: "site" | "seed";
  createdAt: string;
};

export type Subscriber = { email: string; createdAt: string };

type EnquiriesState = {
  enquiries: Enquiry[];
  subscribers: Subscriber[];
  addEnquiry: (e: Omit<Enquiry, "id" | "createdAt" | "status" | "source">) => Enquiry;
  setStatus: (id: string, status: EnquiryStatus) => void;
  subscribe: (email: string) => "added" | "exists";
  reset: () => void;
};

const uid = () => `EQ${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const useEnquiries = create<EnquiriesState>()(
  persist(
    (set, get) => ({
      enquiries: seedEnquiries(),
      subscribers: [],
      addEnquiry: (e) => {
        const enquiry: Enquiry = { ...e, id: uid(), status: "new", source: "site", createdAt: new Date().toISOString() };
        set((s) => ({ enquiries: [enquiry, ...s.enquiries] }));
        return enquiry;
      },
      setStatus: (id, status) =>
        set((s) => ({ enquiries: s.enquiries.map((q) => (q.id === id ? { ...q, status } : q)) })),
      subscribe: (email) => {
        const normalised = email.trim().toLowerCase();
        if (get().subscribers.some((s) => s.email === normalised)) return "exists";
        set((s) => ({ subscribers: [{ email: normalised, createdAt: new Date().toISOString() }, ...s.subscribers] }));
        return "added";
      },
      reset: () => set({ enquiries: seedEnquiries(), subscribers: [] }),
    }),
    {
      name: "ahs-enquiries",
      // v3: demo enquiries for the admin panel. Enquiries made on this device are kept.
      version: 3,
      storage,
      skipHydration: true,
      migrate: (persisted) => {
        const old = (persisted ?? {}) as Partial<EnquiriesState>;
        const mine = (old.enquiries ?? []).map((q) => ({
          ...q,
          type: q.type ?? (q.productSlug ? "product" : "general"),
          status: q.status ?? "new",
          source: "site" as const,
        }));
        return { enquiries: [...mine, ...seedEnquiries()], subscribers: old.subscribers ?? [] } as EnquiriesState;
      },
    },
  ),
);
