import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const paymentMethodUpdateSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["cod", "mobile_banking", "bank_transfer", "card", "manual"]),
  instructions: z.string().nullable().optional(),
  requiresReference: z.boolean(),
  isEnabled: z.boolean(),
  sortOrder: z.number().int(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = paymentMethodUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const paymentMethod = await prisma.paymentMethod.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ paymentMethod });
  } catch {
    return NextResponse.json(
      { error: "A payment method with that name already exists" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const orderCount = await prisma.order.count({ where: { paymentMethodId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${orderCount} order(s) used this payment method. Disable it instead.`,
      },
      { status: 400 }
    );
  }

  await prisma.paymentMethod.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
