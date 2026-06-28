import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: { include: { sport: true } }, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-track-orange px-5 py-2.5 font-meta text-xs text-court-white hover:opacity-90"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-6 court-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line-grey-soft bg-line-grey-soft/30">
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Product</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Category</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Price</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Stock</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey">Status</th>
              <th className="px-4 py-3 font-meta text-[10px] text-line-grey"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-grey-soft">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 bg-line-grey-soft">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-body text-sm text-ink">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-body text-sm text-line-grey">
                  {product.category.sport.name} / {product.category.name}
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink">
                  {formatBDT(product.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-body text-sm ${
                      product.stock === 0
                        ? "text-track-orange"
                        : product.stock <= 5
                        ? "text-ink"
                        : "text-line-grey"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-meta text-[10px] px-2 py-1 ${
                      product.isPublished
                        ? "bg-court-green/10 text-court-green"
                        : "bg-line-grey-soft text-line-grey"
                    }`}
                  >
                    {product.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-meta text-[11px] text-ink hover:text-track-orange"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-10 text-center font-body text-sm text-line-grey">
            No products yet. Add your first one.
          </p>
        )}
      </div>
    </div>
  );
}
