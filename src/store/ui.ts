import { create } from "zustand";

/** Transient interface state. Not persisted. Only one overlay is open at a time. */
export type Overlay = "menu" | "search" | "bag" | "rates" | "wishlist" | "filters" | "lightbox";

type UIState = {
  overlay: Overlay | null;
  open: (overlay: Overlay) => void;
  close: () => void;
};

export const useUI = create<UIState>()((set) => ({
  overlay: null,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
}));
