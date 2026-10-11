"use client";

import Image from "@/components/ui/Img";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { isIOS, useAppMode } from "@/lib/app";
import { useUI } from "@/store";
import Button from "../ui/Button";
import { CloseIcon, ShareIOSIcon } from "../ui/Icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ahs-install-dismissed";
const VISITS_KEY = "ahs-visits";
const QUIET_DAYS = 30;
const DELAY_MS = 20_000;

const recentlyDismissed = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < QUIET_DAYS * 86_400_000;
  } catch {
    return true;
  }
};

/**
 * A quiet "Add to home screen" card on phones. Android and Chrome use the
 * browser’s own install dialog; iPhone shows the two-tap instruction. It waits
 * until the visitor has spent a little time here (or is on a return visit) and
 * stays away for a month once dismissed.
 */
export default function InstallPrompt() {
  const app = useAppMode();
  const overlay = useUI((s) => s.overlay);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (app || !window.matchMedia("(max-width: 767px)").matches || recentlyDismissed()) return;

    // Count visits (one per browser session) so returning visitors see the card sooner.
    let visits = 1;
    try {
      visits = Number(localStorage.getItem(VISITS_KEY) || 0);
      if (!sessionStorage.getItem(VISITS_KEY)) {
        visits += 1;
        localStorage.setItem(VISITS_KEY, String(visits));
        sessionStorage.setItem(VISITS_KEY, "1");
      }
    } catch {
      /* storage blocked */
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPhone has no install event; when the moment comes, show the instructions instead.
    const t = window.setTimeout(() => {
      setMode((m) => m ?? (isIOS() ? "ios" : null));
      setShow(true);
    }, visits > 1 ? 4000 : DELAY_MS);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(t);
    };
  }, [app]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    const e = deferred.current;
    if (!e) return;
    await e.prompt();
    const choice = await e.userChoice;
    deferred.current = null;
    if (choice.outcome === "accepted") setShow(false);
    else dismiss();
  };

  const visible = show && mode && !overlay && !app;
  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label={`Add ${site.name} to your home screen`}
      className="foot-offset fixed inset-x-0 z-40 p-3 md:hidden [animation:toast-in_0.7s_var(--ease-luxe)]"
    >
      <div className="flex items-start gap-4 border border-line bg-white p-4 shadow-panel">
        <Image data-raw="" src="/icons/icon-96.png" alt="" width={48} height={48} className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-xl leading-snug text-ink">Keep {site.shortName} on your home screen</p>
          {mode === "ios" ? (
            <p className="mt-1 text-sm text-stone">
              Tap <ShareIOSIcon className="inline size-4 align-text-bottom text-ink" aria-label="Share" /> below, then
              &lsquo;Add to Home Screen&rsquo;. Today’s rate and your scheme, one tap away.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-stone">Today’s rate, the collections and your scheme, one tap away.</p>
              <div className="mt-3 flex items-center gap-4">
                <Button onClick={install} magnetic={false}>
                  Add to home screen
                </Button>
                <button type="button" onClick={dismiss} className="eyebrow text-stone">
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Close" className="-mr-1 -mt-1 relative hit-area flex size-10 shrink-0 items-center justify-center text-stone">
          <CloseIcon className="size-4" />
        </button>
      </div>
    </aside>
  );
}
