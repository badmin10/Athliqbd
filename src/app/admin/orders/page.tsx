import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-line-grey-soft text-ink",
  confirmed: "bg-court-green/10 text-court-green",
  shipped: "bg-track-orange/10 text-track-orange",
  delivered: "bg-court-green text-court-white",
  cancelled: "bg-ink text-court-white",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { orderStatus: status } : {},
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["placed", "confirmed", "shipped", "delivered", "cancelled"];

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Orders</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`font-meta text-xs px-4 py-2 border ${
            !status ? "border-ink bg-ink text-court-white" : "border-line-grey-soft text-ink"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`font-meta text-xs px-4 py-2 border capitalize ${
              status === s ? "border-ink bg-ink text-court-white" : "border-line-grey-soft text-ink"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="court-card mt-6 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line-grey-soft bg-line-grey-soft/30">
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Order</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Customer</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Total</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Status</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-grey-soft">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-body text-sm text-ink hover:text-track-orange"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-body text-sm text-ink">{order.customerName}</p>
                  <p className="font-body text-xs text-line-grey">{order.customerPhone}</p>
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink">
                  {formatBDT(order.total)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-meta text-[10px] px-2 py-1 capitalize ${STATUS_STYLES[order.orderStatus]}`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-line-grey">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-10 text-center font-body text-sm text-line-grey">
            No orders {status ? `with status "${status}"` : "yet"}.
          </p>
        )}
      </div>
    </div>
  );
}
