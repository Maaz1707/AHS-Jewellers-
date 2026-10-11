"use client";

import { useSyncExternalStore } from "react";
import { useSession } from "@/store";
import AccountDashboard from "./AccountDashboard";
import DemoSignIn from "./DemoSignIn";

/** True once the demo session has loaded from storage. */
function useSessionReady() {
  return useSyncExternalStore(
    (cb) => useSession.persist.onFinishHydration(cb),
    () => useSession.persist.hasHydrated(),
    () => false,
  );
}

/** Sign-in or dashboard, once we know which. A quiet skeleton until then. */
export default function AccountArea() {
  const ready = useSessionReady();
  const member = useSession((s) => s.member);

  if (!ready) {
    return (
      <div aria-busy="true" aria-label="Loading your account">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton mt-6 h-12 w-80" />
        <div className="skeleton mt-10 h-64 w-full" />
      </div>
    );
  }
  return member ? <AccountDashboard /> : <DemoSignIn />;
}
