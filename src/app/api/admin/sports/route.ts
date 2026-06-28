import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const sportSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sports = await prisma.sport.findMany({
    include: { _count: { select: { categories: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ sports });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = sportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const sport = await prisma.sport.create({ data: parsed.data });
    return NextResponse.json({ sport });
  } catch {
    return NextResponse.json(
      { error: "A sport with that name or slug already exists" },
      { status: 400 }
    );
  }
}
