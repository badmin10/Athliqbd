import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    pendingOrders,
    monthOrders,
    lowStockProducts,
    recentOrders,
    orderItemsLast30Days,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "placed" } }),
    prisma.order.findMany({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isPublished: true },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: thirtyDaysAgo } } },
      include: { product: { select: { name: true } } },
    }),
  ]);

  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);

  // Aggregate best sellers by product name over the last 30 days
  const salesByProduct = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const item of orderItemsLast30Days) {
    const key = item.productId;
    const existing = salesByProduct.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.unitPrice * item.quantity;
    } else {
      salesByProduct.set(key, {
        name: item.productName,
        quantity: item.quantity,
        revenue: item.unitPrice * item.quantity,
      });
    }
  }
  const bestSellers = Array.from(salesByProduct.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Dashboard</h1>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue This Month" value={formatBDT(monthRevenue)} />
        <StatCard label="Orders This Month" value={String(monthOrders.length)} />
        <StatCard label="Pending Orders" value={String(pendingOrders)} accent />
        <StatCard label="Total Orders" value={String(totalOrders)} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Best sellers */}
        <div className="court-card p-5">
          <h2 className="font-meta text-xs text-line-grey">Best Sellers (Last 30 Days)</h2>
          {bestSellers.length === 0 ? (
            <p className="mt-4 font-body text-sm text-line-grey">No sales yet.</p>
          ) : (
            <div className="mt-4 space-y-3 divide-y divide-line-grey-soft">
              {bestSellers.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between pt-3 first:pt-0">
                  <div className="flex items-center gap-3">
                    <span className="font-meta text-xs text-line-grey">{i + 1}</span>
                    <span className="font-body text-sm text-ink">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm text-ink">{item.quantity} sold</p>
                    <p className="font-body text-xs text-line-grey">{formatBDT(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alert */}
        <div className="court-card p-5">
          <h2 className="font-meta text-xs text-line-grey">Low Stock</h2>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 font-body text-sm text-line-grey">
              All products are well stocked.
            </p>
          ) : (
            <div className="mt-4 space-y-3 divide-y divide-line-grey-soft">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between pt-3 first:pt-0">
                  <span className="font-body text-sm text-ink">{product.name}</span>
                  <span
                    className={`font-meta text-xs ${
                      product.stock === 0 ? "text-track-orange" : "text-ink"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="court-card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-meta text-xs text-line-grey">Recent Orders</h2>
          <Link href="/admin/orders" className="font-meta text-[11px] text-track-orange">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 font-body text-sm text-line-grey">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3 divide-y divide-line-grey-soft">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between pt-3 first:pt-0 hover:text-track-orange"
              >
                <div>
                  <p className="font-body text-sm text-ink">#{order.orderNumber}</p>
                  <p className="font-body text-xs text-line-grey">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-body text-sm text-ink">{formatBDT(order.total)}</p>
                  <p className="font-meta text-[10px] text-line-grey">{order.orderStatus}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="court-card p-5">
      <p className="font-meta text-[10px] text-line-grey">{label}</p>
      <p
        className={`mt-2 font-display text-2xl font-extrabold ${
          accent ? "text-track-orange" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
