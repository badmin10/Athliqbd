import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [sports, categories] = await Promise.all([
    prisma.sport.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({
      orderBy: [{ sport: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
  ]);

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Add Product</h1>
      <div className="mt-6 max-w-3xl">
        <ProductForm sports={sports} categories={categories} />
      </div>
    </div>
  );
}
