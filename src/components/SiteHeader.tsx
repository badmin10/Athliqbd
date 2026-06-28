import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CartIndicator from "@/components/CartIndicator";
import Wordmark from "@/components/Wordmark";
import { SeamDivider } from "@/components/SeamDivider";

export default async function SiteHeader() {
  const sports = await prisma.sport.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <header className="sticky top-0 z-40 bg-court-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/shop/${sport.slug}`}
                className="font-meta text-xs text-ink/80 transition-colors hover:text-track-orange"
              >
                {sport.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <form action="/search" method="GET" className="hidden md:block">
              <div className="flex items-center border border-line-grey-soft px-3 focus-within:border-ink">
                <input
                  type="search"
                  name="q"
                  placeholder="Search products"
                  className="w-40 bg-transparent py-1.5 font-body text-sm text-ink placeholder:text-line-grey focus:outline-none"
                />
                <button type="submit" aria-label="Search" className="text-line-grey hover:text-ink">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </form>
            <Link
              href="/shop"
              className="hidden font-meta text-xs text-ink/80 transition-colors hover:text-track-orange md:inline"
            >
              All Products
            </Link>
            <CartIndicator />
          </div>
        </div>

        {/* Mobile search — full width below the main row */}
        <form action="/search" method="GET" className="pb-3 md:hidden">
          <div className="flex items-center border border-line-grey-soft px-3 focus-within:border-ink">
            <input
              type="search"
              name="q"
              placeholder="Search products"
              className="w-full bg-transparent py-1.5 font-body text-sm text-ink placeholder:text-line-grey focus:outline-none"
            />
            <button type="submit" aria-label="Search" className="text-line-grey hover:text-ink">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      <SeamDivider />
    </header>
  );
}
