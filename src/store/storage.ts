import { createJSONStorage } from "zustand/middleware";

/** Shared localStorage adapter. Every persisted store hydrates manually (see StoreHydrator). */
export const storage = createJSONStorage(() => localStorage);
