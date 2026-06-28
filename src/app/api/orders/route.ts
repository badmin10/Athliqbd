import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

const orderSchema = z.object({
  customerName: z.string().min(2, "Name is too short"),
  customerPhone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
  customerAddress: z.string().min(10, "Please provide a full delivery address"),
  customerNote: z.string().optional(),
  paymentMethodId: z.string().min(1, "Please choose a payment method"),
  paymentReference: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty"),
});

// Flat delivery fee, charged regardless of payment method. Kept simple and
// centralized here so it's easy to find and change later (e.g. by zone/distance).
const DELIVERY_FEE = 80;

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 }
    );
  }

  const {
    customerName,
    customerPhone,
    customerAddress,
    customerNote,
    paymentMethodId,
    paymentReference,
    items,
  } = parsed.data;

  try {
    // Never trust the client for which payment method is valid/enabled —
    // re-check against the database, same principle as stock validation below.
    const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
    if (!method || !method.isEnabled) {
      return NextResponse.json({ error: "That payment method is no longer available" }, { status: 400 });
    }
    if (method.requiresReference && !paymentReference?.trim()) {
      return NextResponse.json(
        { error: `Please enter your ${method.name} transaction ID` },
        { status: 400 }
      );
    }

    // Run as a transaction: re-check stock against the database (never trust
    // the client's cart values) and decrement stock atomically. If any item
    // is unavailable, the whole order fails together rather than partially.
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsData = items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product not found`);
        }
        if (!product.isPublished) {
          throw new Error(`${product.name} is no longer available`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
        subtotal += product.price * item.quantity;
        return {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
        };
      });

      // Decrement stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const total = subtotal + DELIVERY_FEE;

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName,
          customerPhone,
          customerAddress,
          customerNote,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total,
          paymentMethodId: method.id,
          paymentMethod: method.name,
          paymentReference: paymentReference || null,
          paymentStatus: "pending",
          orderStatus: "placed",
          items: { create: orderItemsData },
        },
      });
    });

    return NextResponse.json({ orderNumber: order.orderNumber, orderId: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
