import { RATE_PUBLISH_HOUR, RATE_PUBLISH_MINUTE } from "@/data/rates";

const IST_OFFSET_MIN = 330;

/**
 * Resolve the "last updated" moment. A stored ISO string wins; otherwise the
 * seed means "the most recent 10:30 am IST publication".
 */
export function resolveUpdatedAt(updatedAt: string | null, now = new Date()): Date {
  if (updatedAt) return new Date(updatedAt);
  const ist = new Date(now.getTime() + IST_OFFSET_MIN * 60_000);
  const publishUtc =
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), RATE_PUBLISH_HOUR, RATE_PUBLISH_MINUTE) -
    IST_OFFSET_MIN * 60_000;
  return publishUtc > now.getTime() ? new Date(publishUtc - 86_400_000) : new Date(publishUtc);
}
