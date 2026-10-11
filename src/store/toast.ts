import { create } from "zustand";

export type Toast = {
  id: number;
  title: string;
  body?: string;
  action?: { label: string; href: string };
};

type ToastState = {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

let counter = 0;

export const useToast = create<ToastState>()((set) => ({
  toasts: [],
  show: (t) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
