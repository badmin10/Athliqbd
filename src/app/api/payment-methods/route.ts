import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — checkout needs this without an admin session.
// Only ever returns enabled methods; never exposes internal flags
// beyond what the checkout form actually needs.
export async function GET() {
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      instructions: true,
      requiresReference: true,
    },
  });
  return NextResponse.json({ paymentMethods });
}
