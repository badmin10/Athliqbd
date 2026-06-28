import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const paymentMethodSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["cod", "mobile_banking", "bank_transfer", "card", "manual"]),
  instructions: z.string().nullable().optional(),
  requiresReference: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const paymentMethods = await prisma.paymentMethod.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ paymentMethods });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = paymentMethodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const paymentMethod = await prisma.paymentMethod.create({ data: parsed.data });
    return NextResponse.json({ paymentMethod });
  } catch {
    return NextResponse.json(
      { error: "A payment method with that name already exists" },
      { status: 400 }
    );
  }
}
