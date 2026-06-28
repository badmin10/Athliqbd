"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartIndicator() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="relative font-meta text-xs text-ink transition-colors hover:text-track-orange"
      aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
    >
      CART
      {totalItems > 0 && (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-[2px] bg-track-orange px-1 font-meta text-[10px] text-court-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
