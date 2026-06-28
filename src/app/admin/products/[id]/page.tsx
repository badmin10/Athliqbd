import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, sports, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.sport.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({
      orderBy: [{ sport: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Edit Product</h1>
      <div className="mt-6 max-w-3xl">
        <ProductForm
          sports={sports}
          categories={categories}
          productId={product.id}
          initialData={{
            name: product.name,
            slug: product.slug,
            brand: product.brand,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            stock: product.stock,
            sku: product.sku,
            weightGrip: product.weightGrip,
            balancePoint: product.balancePoint,
            flexibility: product.flexibility,
            stringTension: product.stringTension,
            material: product.material,
            shoeSizeRange: product.shoeSizeRange,
            terrainType: product.terrainType,
            cushioning: product.cushioning,
            dropHeight: product.dropHeight,
            isPublished: product.isPublished,
            isFeatured: product.isFeatured,
            categoryId: product.categoryId,
            imageUrls: product.images.map((img) => img.url),
          }}
        />
      </div>
    </div>
  );
}
