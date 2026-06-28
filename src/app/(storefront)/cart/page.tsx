"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { formatBDT } from "@/lib/utils";
import { SeamDividerThin } from "@/components/SeamDivider";

export const dynamic = "force-dynamic";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="font-display text-2xl font-extrabold text-ink">Your cart is empty</p>
        <p className="mt-2 font-body text-sm text-line-grey">
          Find your next racquet or restock on shuttlecocks.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-track-orange px-6 py-3 font-meta text-xs text-court-white hover:opacity-90"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="font-meta text-xs text-track-orange">Your Bag</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Your Cart</h1>
      <SeamDividerThin className="my-8" />

      <div className="divide-y divide-line-grey-soft border-t border-b border-line-grey-soft">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-5">
            <div className="relative h-20 w-20 flex-shrink-0 bg-line-grey-soft">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : null}
            </div>

            <div className="flex-1">
              <p className="font-body text-sm font-medium text-ink">{item.name}</p>
              <p className="mt-1 font-display text-sm font-extrabold text-track-orange">
                {formatBDT(item.price)}
              </p>
            </div>

            <div className="flex items-center border border-line-grey-soft">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="px-3 py-1.5 font-display text-sm hover:text-track-orange"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="px-3 py-1.5 font-display text-sm hover:text-track-orange"
                aria-label="Increase quantity"
                disabled={item.quantity >= item.stock}
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-body text-sm font-medium text-ink">
              {formatBDT(item.price * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="font-meta text-[10px] text-line-grey hover:text-track-orange"
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between font-body text-sm text-line-grey">
            <span>Subtotal</span>
            <span>{formatBDT(totalPrice)}</span>
          </div>
          <div className="flex justify-between font-body text-sm text-line-grey">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <SeamDividerThin />
          <div className="flex justify-between font-display text-base font-extrabold text-ink">
            <span>Total</span>
            <span>{formatBDT(totalPrice)}</span>
          </div>
          <Link
            href="/checkout"
            className="block bg-track-orange px-6 py-3 text-center font-meta text-xs text-court-white hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
