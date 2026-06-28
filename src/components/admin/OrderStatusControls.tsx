"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export default function OrderStatusControls({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(field: "orderStatus" | "paymentStatus", value: string) {
    if (field === "orderStatus" && value === "cancelled") {
      const confirmed = window.confirm(
        "Cancel this order? Stock will be restored for all items."
      );
      if (!confirmed) return;
    }

    setError(null);
    setSaving(true);

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not update order");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="court-card p-5">
      <h2 className="font-meta text-xs text-line-grey">Update Status</h2>

      {error && (
        <p className="mt-3 border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="font-meta text-[10px] text-line-grey">Order Status</label>
          <select
            value={orderStatus}
            disabled={saving}
            onChange={(e) => updateStatus("orderStatus", e.target.value)}
            className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm capitalize focus:border-ink"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-meta text-[10px] text-line-grey">Payment Status (COD)</label>
          <select
            value={paymentStatus}
            disabled={saving}
            onChange={(e) => updateStatus("paymentStatus", e.target.value)}
            className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm capitalize focus:border-ink"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="mt-1 font-body text-xs text-line-grey">
            Mark &quot;Paid&quot; once you&apos;ve collected cash on delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
