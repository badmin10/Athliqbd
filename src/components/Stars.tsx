/**
 * A row of 5 stars rendered as SVG paths using currentColor, so a single
 * className on the wrapper (text-court-green or text-track-orange) is
 * enough to pick up the right product's sport accent — no separate color
 * prop to keep in sync. Empty stars use the warm-gray border tone.
 */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z" />
    </svg>
  );
}

export default function Stars({
  rating,
  className = "text-court-green",
}: {
  rating: number;
  className?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= rounded} />
      ))}
    </span>
  );
}
