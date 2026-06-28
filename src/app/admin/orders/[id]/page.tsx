import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { SeamDividerThin } from "@/components/SeamDivider";
import OrderStatusControls from "@/components/admin/OrderStatusControls";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="px-8 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Order #{order.orderNumber}
        </h1>
        <p className="font-body text-xs text-line-grey">
          Placed{" "}
          {new Date(order.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="court-card p-5">
            <h2 className="font-meta text-xs text-line-grey">Delivery Details</h2>
            <div className="mt-3 space-y-1">
              <p className="font-body text-sm text-ink">{order.customerName}</p>
              <p className="font-body text-sm text-ink">{order.customerPhone}</p>
              <p className="font-body text-sm text-ink">{order.customerAddress}</p>
              {order.customerNote && (
                <p className="mt-2 font-body text-sm text-line-grey">
                  Note: {order.customerNote}
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="court-card p-5">
            <h2 className="font-meta text-xs text-line-grey">Payment</h2>
            <p className="mt-3 font-body text-sm text-ink">{order.paymentMethod}</p>
            {order.paymentReference && (
              <p className="mt-1 font-body text-sm text-line-grey">
                Transaction ID: <span className="text-ink">{order.paymentReference}</span>
              </p>
            )}
          </div>

          {/* Items */}
          <div className="court-card p-5">
            <h2 className="font-meta text-xs text-line-grey">Items</h2>
            <div className="mt-3 space-y-3 divide-y divide-line-grey-soft">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between pt-3 first:pt-0">
                  <div>
                    <p className="font-body text-sm text-ink">{item.productName}</p>
                    <p className="font-body text-xs text-line-grey">
                      {formatBDT(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-body text-sm text-ink">
                    {formatBDT(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <SeamDividerThin className="my-4" />
            <div className="space-y-1">
              <div className="flex justify-between font-body text-sm text-line-grey">
                <span>Subtotal</span>
                <span>{formatBDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-line-grey">
                <span>Delivery</span>
                <span>{formatBDT(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-display text-base font-extrabold text-ink">
                <span>Total</span>
                <span>{formatBDT(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <OrderStatusControls
            orderId={order.id}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
          />
        </div>
      </div>
    </div>
  );
}
