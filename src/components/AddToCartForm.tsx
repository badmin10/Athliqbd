"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { accentClasses, type SportAccent } from "@/lib/utils";

type Props = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  accent?: SportAccent;
};

export default function AddToCartForm({
  productId,
  name,
  price,
  image,
  stock,
  accent = "court",
}: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = stock <= 0;
  const accentHoverText =
    accent === "court" ? "hover:text-court-green" : "hover:text-track-orange";

  function handleAdd() {
    addItem({ productId, name, price, image, stock }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem({ productId, name, price, image, stock }, quantity);
    router.push("/cart");
  }

  if (outOfStock) {
    return (
      <div className="border border-line-grey-soft bg-court-white-dim px-4 py-3 text-center font-meta text-xs text-line-grey">
        Out of Stock
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-meta text-xs text-line-grey">Qty</span>
        <div className="flex items-center border border-line-grey-soft">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className={`px-3 py-2 font-display text-sm text-ink ${accentHoverText}`}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center font-body text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            className={`px-3 py-2 font-display text-sm text-ink ${accentHoverText}`}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="font-body text-xs text-line-grey">{stock} in stock</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 border border-ink px-6 py-3 font-meta text-xs text-ink transition-colors hover:bg-ink hover:text-court-white"
        >
          {justAdded ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className={`flex-1 px-6 py-3 font-meta text-xs text-court-white transition-opacity hover:opacity-90 ${accentClasses[accent].bg}`}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
