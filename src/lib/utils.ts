/** Formats a whole-taka integer amount as a BDT currency string, e.g. 12500 -> "৳12,500" */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

/**
 * The two-sport accent system: every product, card, badge, and star
 * rating inherits one of two accents based on which sport its category
 * belongs to — court green for badminton, track orange for everything
 * else (running, and any future sport, defaults here rather than to a
 * third color, keeping the system binary on purpose).
 */
export type SportAccent = "court" | "track";

export function getSportAccent(sportSlug: string | undefined | null): SportAccent {
  return sportSlug === "badminton" ? "court" : "track";
}

/** Tailwind class fragments for a given accent — text, background, and border variants.
 *  Written out as complete literal strings (not built via template interpolation
 *  at the call site) so Tailwind's static scanner can actually find and generate them. */
export const accentClasses: Record<
  SportAccent,
  { text: string; bg: string; border: string; hoverBg: string }
> = {
  court: {
    text: "text-court-green",
    bg: "bg-court-green",
    border: "border-court-green",
    hoverBg: "hover:bg-court-green",
  },
  track: {
    text: "text-track-orange",
    bg: "bg-track-orange",
    border: "border-track-orange",
    hoverBg: "hover:bg-track-orange",
  },
};

/** Generates a human-friendly, sequential-looking order number, e.g. "ATL-7F3K2A" */
export function generateOrderNumber(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ATL-${random}`;
}
