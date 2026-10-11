"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { whatsappLink } from "@/data/site";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error for debugging without breaking the page.
    console.warn("Route error:", error.message);
  }, [error]);

  return (
    <section className="bg-white">
      <div className="shell flex min-h-svh flex-col justify-center py-20">
        <p className="eyebrow text-gold-deep">Something went wrong</p>
        <h1 className="mt-6 max-w-narrow display-page text-ink">This page did not load as it should.</h1>
        <p className="mt-6 max-w-prose text-ink-soft">Please try again. If it keeps happening, message us and we will help directly.</p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <Button onClick={reset}>Try again</Button>
          <TextLink href={whatsappLink()} external>
            Message us on WhatsApp
          </TextLink>
        </div>
      </div>
    </section>
  );
}
