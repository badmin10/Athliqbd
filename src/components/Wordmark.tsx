/**
 * The Athliqbd wordmark: bold condensed-caps brand name with a tiny
 * 2-letter region tag in a solid track-orange pill, baseline-aligned.
 * Used in the header, footer, admin sidebar, and login screen — extracted
 * here so all four stay in sync instead of being copy-pasted separately.
 */
export default function Wordmark({
  size = "md",
  light = false,
}: {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const pillSize = size === "lg" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5";

  return (
    <span className="inline-flex items-baseline gap-2">
      <span
        className={`font-display ${textSize} ${light ? "text-court-white" : "text-ink"}`}
      >
        ATHLIQ
      </span>
      <span
        className={`font-meta ${pillSize} bg-track-orange text-court-white leading-none`}
      >
        BD
      </span>
    </span>
  );
}
