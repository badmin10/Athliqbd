import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBDT, getSportAccent, accentClasses } from "@/lib/utils";
import AddToCartForm from "@/components/AddToCartForm";
import ProductReviews, { RatingSummary } from "@/components/ProductReviews";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { include: { sport: true } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product || !product.isPublished) {
    notFound();
  }

  const accent = getSportAccent(product.category.sport.slug);

  // Racquet-specific and running-shoe-specific specs only render if present
  const specs = [
    { label: "Weight / Grip", value: product.weightGrip },
    { label: "Balance", value: product.balancePoint },
    { label: "Flexibility", value: product.flexibility },
    { label: "String Tension", value: product.stringTension },
    { label: "Material", value: product.material },
    { label: "Shoe Size Range", value: product.shoeSizeRange },
    { label: "Terrain", value: product.terrainType },
    { label: "Cushioning", value: product.cushioning },
    { label: "Heel-to-Toe Drop", value: product.dropHeight },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 font-meta text-[11px] text-line-grey">
        <Link href="/shop" className="hover:text-track-orange">
          Shop
        </Link>
        {" / "}
        <Link href={`/shop/${product.category.sport.slug}`} className="hover:text-track-orange">
          {product.category.sport.name}
        </Link>
        {" / "}
        <Link
          href={`/shop/${product.category.sport.slug}/${product.category.slug}`}
          className="hover:text-track-orange"
        >
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="court-card relative aspect-square bg-court-white-dim">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-meta text-xs text-line-grey">
                No Image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square bg-court-white-dim">
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className={`font-meta text-xs ${accentClasses[accent].text}`}>{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">
            {product.name}
          </h1>
          <div className="mt-2">
            <RatingSummary reviews={product.reviews} accent={accent} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className={`font-display text-2xl ${accentClasses[accent].text}`}>
              {formatBDT(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="font-body text-base text-line-grey line-through">
                {formatBDT(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-5 font-body text-sm leading-relaxed text-ink/80">
            {product.description}
          </p>

          {specs.length > 0 && (
            <div className="mt-6 border border-line-grey-soft">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex justify-between px-4 py-2.5 font-body text-sm ${
                    i !== specs.length - 1 ? "border-b border-line-grey-soft" : ""
                  }`}
                >
                  <span className="text-line-grey">{spec.label}</span>
                  <span className="font-medium text-ink">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <AddToCartForm
              productId={product.id}
              name={product.name}
              price={product.price}
              image={product.images[0]?.url ?? null}
              stock={product.stock}
              accent={accent}
            />
          </div>

          <p className="mt-4 font-body text-xs text-line-grey">
            Cash on Delivery available nationwide. Pay when your order arrives.
          </p>
        </div>
      </div>

      <ProductReviews productId={product.id} reviews={product.reviews} accent={accent} />
    </div>
  );
}
