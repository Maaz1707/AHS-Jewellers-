import Monogram from "@/components/ui/Monogram";

/** Route loading state: the monogram breathing over a gold hairline. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-svh items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <Monogram className="h-24 w-auto animate-breathe text-ink" />
        <span className="relative block h-px w-24 overflow-hidden bg-line">
          <span className="skeleton absolute inset-0" />
        </span>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
