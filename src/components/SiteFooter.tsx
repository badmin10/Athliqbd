import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { SeamDivider } from "@/components/SeamDivider";

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink">
      <SeamDivider />
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Wordmark light />
            <p className="mt-3 max-w-xs font-body text-sm text-line-grey">
              Badminton and running gear, delivered across Bangladesh.
              Cash on delivery available.
            </p>
            {/* Update these two URLs to your real pages */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com/athliqbd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Athliqbd on Instagram"
                className="text-line-grey transition-colors hover:text-track-orange"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://facebook.com/athliqbd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Athliqbd on Facebook"
                className="text-line-grey transition-colors hover:text-track-orange"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <path
                    d="M14 8.5h-1.2c-.7 0-1.3.6-1.3 1.3V11h2.2l-.3 2h-1.9v5.5h-2V13h-1.5v-2h1.5v-1.7c0-1.6 1.2-2.8 2.8-2.8H14v1.5z"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-meta text-xs text-court-white">Badminton</h3>
            <ul className="mt-3 space-y-2 font-body text-sm text-line-grey">
              <li>
                <Link href="/shop/badminton/rackets" className="hover:text-track-orange">
                  Rackets
                </Link>
              </li>
              <li>
                <Link href="/shop/badminton/strings" className="hover:text-track-orange">
                  Strings
                </Link>
              </li>
              <li>
                <Link href="/shop/badminton/shuttlecocks" className="hover:text-track-orange">
                  Shuttlecocks
                </Link>
              </li>
              <li>
                <Link href="/shop/badminton" className="hover:text-track-orange">
                  All Badminton
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-meta text-xs text-court-white">Running</h3>
            <ul className="mt-3 space-y-2 font-body text-sm text-line-grey">
              <li>
                <Link href="/shop/running/running-shoes" className="hover:text-track-orange">
                  Running Shoes
                </Link>
              </li>
              <li>
                <Link href="/shop/running/apparel" className="hover:text-track-orange">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop/running" className="hover:text-track-orange">
                  All Running
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-meta text-xs text-court-white">Orders</h3>
            <ul className="mt-3 space-y-2 font-body text-sm text-line-grey">
              <li>
                <Link href="/track-order" className="hover:text-track-orange">
                  Track an order
                </Link>
              </li>
              <li className="text-line-grey/70">
                Cash on Delivery, nationwide
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="font-body text-xs text-line-grey/70">
            © {new Date().getFullYear()} Athliqbd. Independent retailer of Victor, ASICS, Nike, Adidas, and Hoka gear — not officially affiliated with any of these brands.
          </p>
        </div>
      </div>
    </footer>
  );
}
