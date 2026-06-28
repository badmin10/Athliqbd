import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(2, "Please enter your name"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Please write a few words about the product"),
});

// Public — anyone can submit a review, no login required. Reviews are
// held with isApproved=false until an admin approves them, so nothing
// posted here shows up on the site immediately.
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: { ...parsed.data, isApproved: false },
  });

  return NextResponse.json({ review });
}
