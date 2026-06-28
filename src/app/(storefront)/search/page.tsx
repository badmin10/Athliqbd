import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { SeamDividerThin } from "@/components/SeamDivider";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: query } },
            { brand: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          reviews: { where: { isApproved: true }, select: { rating: true } },
          category: { include: { sport: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <p className="font-meta text-xs text-track-orange">Search</p>
      <h1 className="mt-2 font-display text-3xl text-ink">
        {query ? `Results for "${query}"` : "Search Athliqbd"}
      </h1>
      <SeamDividerThin className="my-8" />

      {!query ? (
        <p className="font-body text-sm text-line-grey">
          Type something into the search bar above to find badminton or running gear.
        </p>
      ) : products.length === 0 ? (
        <div className="court-card flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="font-display text-lg text-ink">No matches found</p>
          <p className="font-body text-sm text-line-grey">
            Try a different search term, or browse by sport from the menu above.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-6 font-body text-sm text-line-grey">
            {products.length} product{products.length === 1 ? "" : "s"} found
          </p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
