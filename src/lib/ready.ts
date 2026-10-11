"use client";

import { useSyncExternalStore } from "react";

type Persisted = { persist: { onFinishHydration: (cb: () => void) => () => void; hasHydrated: () => boolean } };

/**
 * True once a persisted store has loaded from this browser’s storage. Use it
 * before showing a "not found" state that depends on stored data.
 */
export function useStoreReady(store: Persisted) {
  return useSyncExternalStore(
    (cb) => store.persist.onFinishHydration(cb),
    () => store.persist.hasHydrated(),
    () => false,
  );
}
