import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storage } from "./storage";

/**
 * DEMO sign-in state. There is no real authentication anywhere in the
 * prototype: any phone number and any four-digit code are accepted.
 */
export type MemberProfile = { name: string; phone: string; email?: string };

type SessionState = {
  member: MemberProfile | null;
  admin: boolean;
  signIn: (profile: MemberProfile) => void;
  updateProfile: (patch: Partial<MemberProfile>) => void;
  signOut: () => void;
  enterAdmin: () => void;
  exitAdmin: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      member: null,
      admin: false,
      signIn: (profile) => set({ member: profile }),
      updateProfile: (patch) => set((s) => (s.member ? { member: { ...s.member, ...patch } } : s)),
      signOut: () => set({ member: null }),
      enterAdmin: () => set({ admin: true }),
      exitAdmin: () => set({ admin: false }),
    }),
    { name: "ahs-session", version: 1, storage, skipHydration: true },
  ),
);
