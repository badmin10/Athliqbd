import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  brand: z.string().min(1).default("Victor"),
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
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1),
  imageUrls: z.array(z.string()).default([]),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { imageUrls, ...data } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        images: {
          create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    });
    return NextResponse.json({ product });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2002"
        ? "A product with that slug or SKU already exists"
        : "Could not create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
