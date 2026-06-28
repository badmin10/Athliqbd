import Link from "next/link";
import Image from "next/image";
import { formatBDT, getSportAccent, accentClasses } from "@/lib/utils";
import Stars from "@/components/Stars";

type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: { url: string; altText: string | null }[];
  reviews?: { rating: number }[];
  category?: { sport?: { slug: string } | null } | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;
  const reviews = product.reviews ?? [];
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const accent = getSportAccent(product.category?.sport?.slug);
  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="court-card group block bg-court-white"
    >
      <div className="relative aspect-square bg-court-white-dim">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-meta text-xs text-line-grey">
            No Image
          </div>
        )}

        {outOfStock ? (
          <span className="absolute left-2 top-2 bg-ink px-2 py-1 font-meta text-[10px] text-court-white">
            Out of Stock
          </span>
        ) : discountPercent ? (
          <span
            className={`absolute left-2 top-2 px-2 py-1 font-meta text-[10px] text-court-white ${accentClasses[accent].bg}`}
          >
            −{discountPercent}%
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-meta text-[10px] text-line-grey">{product.brand}</p>
        <h3 className="mt-1 font-body text-sm font-medium text-ink">{product.name}</h3>
        {averageRating !== null && (
          <div className="mt-1 flex items-center gap-1">
            <Stars rating={averageRating} className={accentClasses[accent].text} />
            <span className="font-body text-xs text-line-grey">({reviews.length})</span>
          </div>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`font-meta text-base ${accentClasses[accent].text}`}>
            {formatBDT(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="font-body text-xs text-line-grey line-through">
              {formatBDT(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
