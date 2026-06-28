import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const productUpdateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  sku: z.string().nullable().optional(),
  weightGrip: z.string().nullable().optional(),
  balancePoint: z.string().nullable().optional(),
  flexibility: z.string().nullable().optional(),
  stringTension: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string().min(1),
  imageUrls: z.array(z.string()).default([]),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { imageUrls, ...data } = parsed.data;

  try {
    // Replace images wholesale: simplest correct approach for a beginner-friendly
    // admin UI (delete old image rows, create new ones in the chosen order).
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        images: {
          deleteMany: {},
          create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    });
    return NextResponse.json({ product });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2002"
        ? "A product with that slug or SKU already exists"
        : "Could not update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete product. It may be referenced by existing orders." },
      { status: 400 }
    );
  }
}
