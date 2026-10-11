/** Route loading state: the wordmark breathing over a gold hairline. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-svh items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-5">
        <span className="animate-breathe font-serif text-3xl tracking-logo text-ink">AHS</span>
        <span className="relative block h-px w-24 overflow-hidden bg-line">
          <span className="skeleton absolute inset-0" />
        </span>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
