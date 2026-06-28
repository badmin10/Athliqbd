import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { SeamDividerThin } from "@/components/SeamDivider";
import { getSportAccent, accentClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slugs?: string[] }>;
}) {
  const { slugs } = await params;
  const sportSlug = slugs?.[0];
  const categorySlug = slugs?.[1];

  const allSports = await prisma.sport.findMany({
    orderBy: { sortOrder: "asc" },
    include: { categories: { orderBy: { sortOrder: "asc" } } },
  });

  const activeSport = sportSlug ? allSports.find((s) => s.slug === sportSlug) : null;
  if (sportSlug && !activeSport) {
    notFound();
  }

  const activeCategory = activeSport && categorySlug
    ? activeSport.categories.find((c) => c.slug === categorySlug)
    : null;
  if (categorySlug && !activeCategory) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      ...(activeCategory
        ? { categoryId: activeCategory.id }
        : activeSport
        ? { category: { sportId: activeSport.id } }
        : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      reviews: { where: { isApproved: true }, select: { rating: true } },
      category: { include: { sport: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const heading = activeCategory?.name ?? activeSport?.name ?? "Shop All Gear";
  const description = activeCategory?.description ?? activeSport?.description;
  const accent = getSportAccent(activeSport?.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      {/* Header */}
      <p className={`font-meta text-xs ${activeSport ? accentClasses[accent].text : "text-track-orange"}`}>
        {activeSport ? activeSport.name : "Shop"}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">{heading}</h1>
      {description && (
        <p className="mt-2 max-w-xl font-body text-sm text-line-grey">{description}</p>
      )}
      <SeamDividerThin className="my-8" />

      {/* Sport tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`font-meta text-xs px-4 py-2 border transition-colors ${
            !activeSport
              ? "border-ink bg-ink text-court-white"
              : "border-line-grey-soft text-ink hover:border-ink"
          }`}
        >
          All Sports
        </Link>
        {allSports.map((sport) => (
          <Link
            key={sport.id}
            href={`/shop/${sport.slug}`}
            className={`font-meta text-xs px-4 py-2 border transition-colors ${
              activeSport?.id === sport.id
                ? "border-ink bg-ink text-court-white"
                : "border-line-grey-soft text-ink hover:border-ink"
            }`}
          >
            {sport.name}
          </Link>
        ))}
      </div>

      {/* Category chips — only shown once a sport is selected, using that sport's accent */}
      {activeSport && (
        <div className="mb-8 flex flex-wrap gap-2 border-t border-line-grey-soft pt-4">
          <Link
            href={`/shop/${activeSport.slug}`}
            className={`font-meta text-[11px] px-3 py-1.5 border transition-colors ${
              !activeCategory
                ? `${accentClasses[accent].border} ${accentClasses[accent].bg} text-court-white`
                : "border-line-grey-soft text-line-grey hover:border-ink hover:text-ink"
            }`}
          >
            All {activeSport.name}
          </Link>
          {activeSport.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${activeSport.slug}/${cat.slug}`}
              className={`font-meta text-[11px] px-3 py-1.5 border transition-colors ${
                activeCategory?.id === cat.id
                  ? `${accentClasses[accent].border} ${accentClasses[accent].bg} text-court-white`
                  : "border-line-grey-soft text-line-grey hover:border-ink hover:text-ink"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="court-card flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="font-display text-lg text-ink">
            No products here yet
          </p>
          <p className="font-body text-sm text-line-grey">
            Check back soon, or browse another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
