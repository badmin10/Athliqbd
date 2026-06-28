import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const updateSchema = z.object({
  orderStatus: z.enum(["placed", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If cancelling an order that hadn't already been cancelled, restore stock
  // for each item — otherwise cancelled orders would silently shrink inventory forever.
  if (parsed.data.orderStatus === "cancelled" && existing.orderStatus !== "cancelled") {
    const items = await prisma.orderItem.findMany({ where: { orderId: id } });
    await prisma.$transaction([
      ...items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      ),
      prisma.order.update({ where: { id }, data: parsed.data }),
    ]);
  } else {
    await prisma.order.update({ where: { id }, data: parsed.data });
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  return NextResponse.json({ order });
}
