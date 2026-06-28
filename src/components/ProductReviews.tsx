"use client";

import { useState } from "react";
import Stars from "@/components/Stars";
import { SeamDividerThin } from "@/components/SeamDivider";
import { accentClasses, type SportAccent } from "@/lib/utils";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export function RatingSummary({
  reviews,
  accent = "court",
}: {
  reviews: Review[];
  accent?: SportAccent;
}) {
  if (reviews.length === 0) return null;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <a href="#reviews" className="flex items-center gap-1.5 hover:opacity-80">
      <Stars rating={average} className={accentClasses[accent].text} />
      <span className="font-body text-xs text-line-grey">
        {average.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})
      </span>
    </a>
  );
}

export default function ProductReviews({
  productId,
  reviews,
  accent = "court",
}: {
  productId: string;
  reviews: Review[];
  accent?: SportAccent;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, customerName: name, rating, comment }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not submit review");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div id="reviews" className="mt-16 pt-10">
      <SeamDividerThin className="mb-10" />
      <p className="font-meta text-xs text-track-orange">Reviews</p>
      <h2 className="mt-2 font-display text-2xl text-ink">What Buyers Say</h2>

      {reviews.length === 0 ? (
        <p className="mt-4 font-body text-sm text-line-grey">
          No reviews yet — be the first to share what you think.
        </p>
      ) : (
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-line-grey-soft pb-5 last:border-0">
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} className={accentClasses[accent].text} />
                  <span className="font-body text-sm font-medium text-ink">
                    {review.customerName}
                  </span>
                </div>
                <p className="mt-2 font-body text-sm text-ink/80">{review.comment}</p>
                <p className="mt-1 font-meta text-[10px] text-line-grey">
                  {new Date(review.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>

          <ReviewForm
            name={name}
            setName={setName}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            submitting={submitting}
            submitted={submitted}
            error={error}
            onSubmit={handleSubmit}
            accent={accent}
          />
        </div>
      )}

      {reviews.length === 0 && (
        <div className="mt-6 max-w-md">
          <ReviewForm
            name={name}
            setName={setName}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            submitting={submitting}
            submitted={submitted}
            error={error}
            onSubmit={handleSubmit}
            accent={accent}
          />
        </div>
      )}
    </div>
  );
}

function ReviewForm({
  name,
  setName,
  rating,
  setRating,
  comment,
  setComment,
  submitting,
  submitted,
  error,
  onSubmit,
  accent,
}: {
  name: string;
  setName: (v: string) => void;
  rating: number;
  setRating: (v: number) => void;
  comment: string;
  setComment: (v: string) => void;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  accent: SportAccent;
}) {
  if (submitted) {
    return (
      <div className="court-card p-5">
        <p className="font-body text-sm text-ink">
          Thanks — your review has been submitted and will appear once it&apos;s approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="court-card space-y-3 p-5">
      <h3 className="font-meta text-xs text-line-grey">Write a Review</h3>

      <div>
        <label className="font-meta text-[10px] text-line-grey">Your Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="font-meta text-[10px] text-line-grey">Rating</label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={`text-xl ${n <= rating ? accentClasses[accent].text : "text-line-grey-soft"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-meta text-[10px] text-line-grey">Your Review</label>
        <textarea
          required
          minLength={5}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink"
          placeholder="What did you think?"
        />
      </div>

      {error && <p className="font-body text-xs text-track-orange">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-ink px-5 py-2.5 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
