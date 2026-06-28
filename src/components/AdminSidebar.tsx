"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Wordmark from "@/components/Wordmark";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payment-methods", label: "Payment Methods" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-line-grey-soft bg-ink">
      <div className="border-b border-white/10 px-5 py-5">
        <Wordmark size="sm" light />
        <p className="mt-1 font-meta text-[10px] text-line-grey">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 block px-3 py-2.5 font-meta text-xs transition-colors ${
                active
                  ? "bg-track-orange text-court-white"
                  : "text-line-grey hover:bg-white/5 hover:text-court-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="font-body text-xs text-line-grey">Signed in as</p>
        <p className="font-body text-sm text-court-white">{userName}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="mt-3 font-meta text-[11px] text-line-grey hover:text-track-orange"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
