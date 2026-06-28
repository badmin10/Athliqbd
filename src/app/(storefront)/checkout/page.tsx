"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { SeamDividerThin } from "@/components/SeamDivider";

export const dynamic = "force-dynamic";
import { formatBDT } from "@/lib/utils";

const DELIVERY_FEE = 80;

type PaymentMethod = {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
  requiresReference: boolean;
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        const methods: PaymentMethod[] = data.paymentMethods ?? [];
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedMethodId(methods[0].id);
      })
      .finally(() => setPaymentMethodsLoading(false));
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId) ?? null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="font-display text-2xl font-extrabold text-ink">Your cart is empty</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-track-orange px-6 py-3 font-meta text-xs text-court-white hover:opacity-90"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedMethodId) {
      setError("Please choose a payment method.");
      return;
    }
    if (selectedMethod?.requiresReference && !paymentReference.trim()) {
      setError(`Please enter your ${selectedMethod.name} transaction ID.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          customerNote: note || undefined,
          paymentMethodId: selectedMethodId,
          paymentReference: paymentReference || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmed/${data.orderNumber}`);
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="font-meta text-xs text-track-orange">Almost There</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Checkout</h1>
      <SeamDividerThin className="my-8" />

      <div className="grid gap-10 md:grid-cols-2">
        {/* Delivery form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="font-meta text-xs text-line-grey">
              Full Name
            </label>
            <input
              id="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm text-ink focus:border-ink"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="font-meta text-xs text-line-grey">
              Phone Number
            </label>
            <input
              id="phone"
              required
              type="tel"
              minLength={10}
              maxLength={15}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm text-ink focus:border-ink"
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div>
            <label htmlFor="address" className="font-meta text-xs text-line-grey">
              Delivery Address
            </label>
            <textarea
              id="address"
              required
              minLength={10}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm text-ink focus:border-ink"
              placeholder="House, road, area, thana, district"
            />
          </div>

          <div>
            <label htmlFor="note" className="font-meta text-xs text-line-grey">
              Order Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm text-ink focus:border-ink"
              placeholder="Delivery instructions, preferred time, etc."
            />
          </div>

          <div>
            <p className="font-meta text-xs text-line-grey">Payment Method</p>
            {paymentMethodsLoading ? (
              <p className="mt-2 font-body text-sm text-line-grey">Loading payment options…</p>
            ) : paymentMethods.length === 0 ? (
              <p className="mt-2 border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
                No payment methods are available right now. Please contact us to place an order.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`block cursor-pointer border px-4 py-3 transition-colors ${
                      selectedMethodId === method.id
                        ? "border-court-green bg-court-green/5"
                        : "border-line-grey-soft"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedMethodId === method.id}
                        onChange={() => setSelectedMethodId(method.id)}
                      />
                      <span className="font-body text-sm font-medium text-ink">
                        {method.name}
                      </span>
                    </div>
                    {selectedMethodId === method.id && method.instructions && (
                      <p className="mt-2 pl-6 font-body text-xs text-line-grey">
                        {method.instructions}
                      </p>
                    )}
                    {selectedMethodId === method.id && method.requiresReference && (
                      <input
                        required
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Transaction ID"
                        className="mt-2 ml-6 w-[calc(100%-1.5rem)] border border-line-grey-soft px-3 py-2 font-body text-sm text-ink focus:border-ink"
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || paymentMethods.length === 0}
            className="w-full bg-track-orange px-6 py-3 font-meta text-xs text-court-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting
              ? "Placing Order…"
              : `Place Order${selectedMethod ? ` — ${selectedMethod.name}` : ""}`}
          </button>
        </form>

        {/* Order summary */}
        <div>
          <div className="court-card p-5">
            <h2 className="font-meta text-xs text-line-grey">Order Summary</h2>
            <div className="mt-4 space-y-3 divide-y divide-line-grey-soft">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between pt-3 first:pt-0">
                  <div>
                    <p className="font-body text-sm text-ink">{item.name}</p>
                    <p className="font-body text-xs text-line-grey">Qty {item.quantity}</p>
                  </div>
                  <p className="font-body text-sm text-ink">
                    {formatBDT(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <SeamDividerThin className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between font-body text-sm text-line-grey">
                <span>Subtotal</span>
                <span>{formatBDT(totalPrice)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-line-grey">
                <span>Delivery</span>
                <span>{formatBDT(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between font-display text-base font-extrabold text-ink">
                <span>Total</span>
                <span>{formatBDT(totalPrice + DELIVERY_FEE)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
