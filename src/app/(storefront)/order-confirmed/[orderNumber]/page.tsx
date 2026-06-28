import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { SeamDividerThin } from "@/components/SeamDivider";

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="font-meta text-xs text-court-green">Order Placed</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">
        Thanks, {order.customerName.split(" ")[0]}!
      </h1>
      <p className="mt-2 font-body text-sm text-line-grey">
        Your order <span className="font-medium text-ink">#{order.orderNumber}</span> has
        been placed. We&apos;ll deliver it to your address soon.
      </p>

      <div className="court-card mt-8 p-5 text-left">
        <div className="space-y-3 divide-y divide-line-grey-soft">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between pt-3 first:pt-0">
              <div>
                <p className="font-body text-sm text-ink">{item.productName}</p>
                <p className="font-body text-xs text-line-grey">Qty {item.quantity}</p>
              </div>
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
        <p className="mt-3 font-body text-xs text-line-grey">
          Paying with {order.paymentMethod}
          {order.paymentReference && ` — Transaction ID: ${order.paymentReference}`}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/shop"
          className="border border-ink px-6 py-3 font-meta text-xs text-ink hover:bg-ink hover:text-court-white"
        >
          Continue Shopping
        </Link>
        <Link
          href="/track-order"
          className="bg-track-orange px-6 py-3 font-meta text-xs text-court-white hover:opacity-90"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}
