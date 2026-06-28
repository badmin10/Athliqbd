import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  sportId: z.string().min(1),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } }, sport: true },
    orderBy: [{ sport: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({ data: parsed.data });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json(
      { error: "A category with that slug already exists in this sport" },
      { status: 400 }
    );
  }
}
