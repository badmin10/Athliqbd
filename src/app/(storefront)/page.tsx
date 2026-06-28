import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { SeamDivider } from "@/components/SeamDivider";
import { getSportAccent, accentClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, sports] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isPublished: true },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        reviews: { where: { isApproved: true }, select: { rating: true } },
        category: { include: { sport: true } },
      },
      take: 4,
    }),
    prisma.sport.findMany({
      orderBy: { sortOrder: "asc" },
      include: { categories: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────
          Signature: badminton's straight court lines on the left,
          bending into a running track's curve on the right — one mark
          for two sports, instead of a single borrowed motif. */}
      <section className="relative overflow-hidden bg-ink">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 1200 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="600" y1="0" x2="600" y2="500" stroke="var(--color-court-white)" strokeWidth="1" />
          <line x1="0" y1="60" x2="1200" y2="60" stroke="var(--color-court-white)" strokeWidth="1" />
          <line x1="0" y1="440" x2="1200" y2="440" stroke="var(--color-court-white)" strokeWidth="1" />
          <line x1="150" y1="0" x2="150" y2="500" stroke="var(--color-court-white)" strokeWidth="0.5" />
          <path d="M 950 0 Q 1240 250 950 500" stroke="var(--color-court-white)" strokeWidth="1" fill="none" />
          <path d="M 1060 0 Q 1310 250 1060 500" stroke="var(--color-court-white)" strokeWidth="0.5" fill="none" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <p className="font-meta text-xs text-track-orange">Bangladesh&apos;s Court &amp; Track Specialist</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1] text-court-white md:text-6xl">
            Built for the <span className="text-court-green">court</span>.
            <br />
            Made for the <span className="text-track-orange">mile</span>.
          </h1>
          <p className="mt-5 max-w-md font-body text-base text-line-grey">
            Genuine badminton and running gear from Victor, ASICS, Nike,
            Adidas, and Hoka — shipped nationwide with Cash on Delivery.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/shop/badminton/rackets"
              className="bg-court-green px-6 py-3 font-meta text-xs text-court-white transition-opacity hover:opacity-90"
            >
              Shop Racquets →
            </Link>
            <Link
              href="/shop/running/running-shoes"
              className="bg-track-orange px-6 py-3 font-meta text-xs text-court-white transition-opacity hover:opacity-90"
            >
              Shop Running →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sport + category strip ─────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        {sports.map((sport) => {
          const accent = getSportAccent(sport.slug);
          return (
            <div key={sport.id} className="mb-12 last:mb-0">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-meta text-xs text-track-orange">{sport.name}</h2>
                <Link
                  href={`/shop/${sport.slug}`}
                  className="font-meta text-[11px] text-line-grey hover:text-track-orange"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                {sport.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/${sport.slug}/${cat.slug}`}
                    className={`group relative flex aspect-square flex-col justify-between border border-line-grey-soft bg-court-white-dim p-3 transition-colors ${accentClasses[accent].hoverBg}`}
                  >
                    <span className={`block h-1.5 w-4 ${accentClasses[accent].bg}`} />
                    <span className="font-display text-sm leading-tight text-ink group-hover:text-court-white">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <SeamDivider />
      </div>

      {/* ── Featured products ───────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <p className="font-meta text-xs text-track-orange">Featured</p>
          <div className="mb-8 mt-2 flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink">
              Featured Gear
            </h2>
            <Link
              href="/shop"
              className="font-meta text-xs text-line-grey hover:text-track-orange"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Trust strip ──────────────────────────────── */}
      <section className="bg-ink">
        <SeamDivider />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-16 md:grid-cols-3">
          <div>
            <p className="font-meta text-xs text-track-orange">Nationwide Delivery</p>
            <p className="mt-1 font-body text-sm text-line-grey">
              Cash on Delivery, anywhere in Bangladesh.
            </p>
          </div>
          <div>
            <p className="font-meta text-xs text-track-orange">Authentic Stock Only</p>
            <p className="mt-1 font-body text-sm text-line-grey">
              No counterfeits — every item sourced from authorized distributors.
            </p>
          </div>
          <div>
            <p className="font-meta text-xs text-track-orange">Two Sports, One Store</p>
            <p className="mt-1 font-body text-sm text-line-grey">
              From beginner club players to weekend 5K runners.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
