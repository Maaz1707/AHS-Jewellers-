import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedBookings } from "@/data/demo";
import { storage } from "./storage";

export type Occasion = "wedding" | "gifting" | "investment" | "browsing";

export const occasionLabels: Record<Occasion, { label: string; note: string }> = {
  wedding: { label: "Wedding", note: "Bridal sets, trousseau and family pieces, in the first-floor salon." },
  gifting: { label: "Gifting", note: "Coins, small pieces and occasion gifts, wrapped to take away." },
  investment: { label: "Investment", note: "24K coins and bars, with the day’s rate and certificates." },
  browsing: { label: "Just browsing", note: "No plan yet. We will show you around both floors." },
};

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type Booking = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  /** yyyy-mm-dd, IST calendar date. */
  date: string;
  /** "11:00" 24-hour start time. */
  slot: string;
  occasion: Occasion;
  /** Floor prepared for the visit. Weddings go to the bridal salon upstairs. */
  floor: "ground" | "bridal";
  pieceSlug?: string;
  notes?: string;
  status: BookingStatus;
  /** "site": made on this device. "seed": demo data. */
  source: "site" | "seed";
  createdAt: string;
};

type BookingsState = {
  bookings: Booking[];
  add: (b: Omit<Booking, "id" | "createdAt" | "status" | "source">) => Booking;
  setStatus: (id: string, status: BookingStatus) => void;
  reset: () => void;
};

export const useBookings = create<BookingsState>()(
  persist(
    (set) => ({
      bookings: seedBookings(),
      add: (b) => {
        const booking: Booking = {
          ...b,
          id: `BK-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          status: "requested",
          source: "site",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },
      setStatus: (id, status) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)) })),
      reset: () => set({ bookings: seedBookings() }),
    }),
    {
      name: "ahs-bookings",
      // v3: demo bookings for the admin panel. Bookings made on this device are kept.
      version: 3,
      storage,
      skipHydration: true,
      migrate: (persisted) => {
        const old = ((persisted as Partial<BookingsState>)?.bookings ?? []).map((b) => ({ ...b, source: "site" as const }));
        return { bookings: [...old, ...seedBookings()] } as BookingsState;
      },
    },
  ),
);
