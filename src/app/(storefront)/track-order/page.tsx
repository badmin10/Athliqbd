"use client";

import { useState } from "react";
import { formatBDT } from "@/lib/utils";
import { SeamDividerThin } from "@/components/SeamDivider";

export const dynamic = "force-dynamic";

type OrderItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

type Order = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  customerAddress: string;
  items: OrderItem[];
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Order not found");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-extrabold text-ink">Track Your Order</h1>
      <p className="mt-2 font-body text-sm text-line-grey">
        Enter your order number and the phone number you used at checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="orderNumber" className="font-meta text-xs text-line-grey">
            Order Number
          </label>
          <input
            id="orderNumber"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="ATL-XXXXXX"
            className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm text-ink focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="phone" className="font-meta text-xs text-line-grey">
            Phone Number
          </label>
          <input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm text-ink focus:border-ink"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-track-orange px-6 py-3 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {error && (
        <p className="mt-6 border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
          {error}
        </p>
      )}

      {order && (
        <div className="court-card mt-8 p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-extrabold text-ink">
              #{order.orderNumber}
            </p>
            <span className="bg-ink px-3 py-1 font-meta text-[10px] text-court-white">
              {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
            </span>
          </div>

          <div className="mt-4 space-y-2 divide-y divide-line-grey-soft">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between pt-2 first:pt-0">
                <p className="font-body text-sm text-ink">
                  {item.productName} × {item.quantity}
                </p>
                <p className="font-body text-sm text-ink">
                  {formatBDT(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <SeamDividerThin className="my-4" />
          <div className="flex justify-between font-display text-base font-extrabold text-ink">
            <span>Total</span>
            <span>{formatBDT(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
