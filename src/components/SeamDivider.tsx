/**
 * The seam divider: a hairline split between court-green and track-orange,
 * meeting at a seam in the middle. Used between sections instead of <hr>,
 * plain borders, or shadow separators — and directly under every page's
 * H1 (the thin variant) per the standard page pattern: eyebrow → H1 →
 * SeamDividerThin → content.
 */
export function SeamDivider({ className = "" }: { className?: string }) {
  return <span className={`seam-divider block w-full ${className}`} />;
}

export function SeamDividerThin({ className = "" }: { className?: string }) {
  return <span className={`seam-divider-thin block w-full ${className}`} />;
}
