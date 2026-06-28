"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Stars from "@/components/Stars";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [loading, setLoading] = useState(true);

  async function loadData(status: "pending" | "approved" | "all") {
    setLoading(true);
    const query = status === "all" ? "" : `?status=${status}`;
    const res = await fetch(`/api/admin/reviews${query}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleApprove(review: Review) {
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true }),
    });
    await loadData(filter);
  }

  async function handleUnapprove(review: Review) {
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: false }),
    });
    await loadData(filter);
  }

  async function handleDelete(review: Review) {
    if (!window.confirm(`Delete this review from ${review.customerName}?`)) return;
    await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    await loadData(filter);
  }

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Reviews</h1>
      <p className="mt-1 font-body text-sm text-line-grey">
        New reviews are hidden from the site until you approve them here.
      </p>

      <div className="mt-6 flex gap-2">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`font-meta text-xs px-4 py-2 border transition-colors ${
              filter === f
                ? "border-ink bg-ink text-court-white"
                : "border-line-grey-soft text-ink hover:border-ink"
            }`}
          >
            {f === "pending" ? "Pending" : f === "approved" ? "Approved" : "All"}
          </button>
        ))}
      </div>

      <div className="court-card mt-6 overflow-hidden">
        {loading ? (
          <p className="px-4 py-10 text-center font-body text-sm text-line-grey">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="px-4 py-10 text-center font-body text-sm text-line-grey">
            {filter === "pending" ? "No reviews waiting for approval." : "No reviews here yet."}
          </p>
        ) : (
          <div className="divide-y divide-line-grey-soft">
            {reviews.map((review) => (
              <div key={review.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="font-body text-sm font-medium text-ink">
                        {review.customerName}
                      </span>
                    </div>
                    <Link
                      href={`/product/${review.product.slug}`}
                      target="_blank"
                      className="font-meta text-[10px] text-line-grey hover:text-track-orange"
                    >
                      {review.product.name}
                    </Link>
                    <p className="mt-2 font-body text-sm text-ink">{review.comment}</p>
                    <p className="mt-1 font-meta text-[10px] text-line-grey">
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-3">
                    {review.isApproved ? (
                      <button
                        type="button"
                        onClick={() => handleUnapprove(review)}
                        className="font-meta text-[11px] text-line-grey hover:text-track-orange"
                      >
                        Unapprove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApprove(review)}
                        className="font-meta text-[11px] text-court-green"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(review)}
                      className="font-meta text-[11px] text-line-grey hover:text-track-orange"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
