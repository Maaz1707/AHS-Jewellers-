"use client";

import { useEffect } from "react";
import { persistedStores } from "@/store";

/**
 * Persisted stores skip automatic hydration so the server render and the first
 * client render always match. They are rehydrated from localStorage here.
 *
 * Other tabs are kept in step too: when the admin saves a rate in one tab, an
 * open shop tab picks it up immediately.
 */
export default function StoreHydrator() {
  useEffect(() => {
    persistedStores.forEach((store) => {
      void store.persist.rehydrate();
    });

    const onStorage = (e: StorageEvent) => {
      if (!e.key?.startsWith("ahs-")) return;
      const store = persistedStores.find((s) => s.persist.getOptions().name === e.key);
      if (store) void store.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
