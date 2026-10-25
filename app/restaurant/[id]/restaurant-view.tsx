"use client";

// The interactive part of the restaurant screen.
// It calls GET /api/restaurants/[id] and renders what it receives.
// Numbers arrive ready from the backend (AVG, COUNT, ORDER BY); this file
// only presents them. No business logic moved in — see app/components/rating-ui.tsx.

import Link from "next/link";
import { useEffect, useState } from "react";
import { Kicker, ReviewerBadge, Stars, ratingLabel, ratingTone } from "../../components/rating-ui";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantPayload = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function ReviewCard({
  review,
  latest = false,
}: {
  review: Review;
  latest?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
        latest
          ? "border-red-100 bg-red-50/50"
          : "border-stone-200/70 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <ReviewerBadge className={latest ? "border-red-100 bg-white" : ""} />
        <div className="min-w-0 flex-1">
          {/* No reviewer name exists in our data — that's an honest label. */}
          <p className="text-sm font-semibold text-stone-900">Guest reviewer</p>
          <time className="text-xs text-stone-400">{formatDate(review.createdAt)}</time>
        </div>
        {latest && (
          <span className="rounded-full bg-[#C42B37] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            Latest
          </span>
        )}
      </div>
      <p
        className={`mt-3 leading-relaxed text-stone-800 ${
          latest ? "text-base sm:text-lg" : "text-[15px]"
        }`}
      >
        {review.comment}
      </p>
      <div className="mt-3 flex items-center gap-2.5">
        <Stars value={review.rating} />
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{review.rating}/5</span>
      </div>
    </article>
  );
}

export default function RestaurantView({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const [data, setData] = useState<RestaurantPayload | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload: RestaurantPayload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [restaurantId]);

  const container = "mx-auto w-full max-w-[600px] px-4 pb-24 pt-8 sm:px-6 sm:pt-10";

  if (notFound) {
    return (
      <main className={container}>
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center">
          <p className="font-semibold text-stone-900">Nothing at this address.</p>
          <p className="mt-1 text-sm text-stone-500">
            This restaurant does not exist. Check the number in the URL.
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={container}>
        <div className="space-y-4" role="status" aria-label="Loading">
          <div className="h-44 animate-pulse rounded-3xl bg-stone-100" />
          <div className="h-32 animate-pulse rounded-3xl bg-stone-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      </main>
    );
  }

  const avg = data.averageRating;
  const label = avg !== null ? ratingLabel(avg) : null;
  const tone = avg !== null ? ratingTone(avg) : null;

  return (
    <main className={container}>
      {/* Header: image + identity */}
      <section className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white shadow-sm">
        <div className="relative h-40 sm:h-52">
          <img
            src="/food.svg"
            alt="Illustration of a freshly made burrito on a plate"
            className="size-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C42B37] shadow-sm">
            Zomato Lite
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[34px]">
            {data.name}
          </h1>
          <p className="mt-2 text-sm text-stone-500 sm:text-[15px]">
            {data.cuisine} · {data.area}
          </p>
        </div>
      </section>

      {data.totalReviews === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-stone-300 p-10 text-center">
          <Kicker className="text-stone-400">First review pending</Kicker>
          <p className="mt-3 font-medium text-stone-900">
            Nobody has reviewed {data.name} yet.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Your words would set the tone for everyone after you.
          </p>
          <Link
            href={`/review/${restaurantId}`}
            className="mt-6 inline-block rounded-xl bg-[#E23744] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#C42B37]"
          >
            Write the first review
          </Link>
        </div>
      ) : (
        <>
          {/* Rating summary card */}
          <section className="mt-6 rounded-3xl border border-stone-200/70 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
              Overall rating
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Printed exactly as computed by AVG(rating) on the backend. */}
                <span
                  className={`text-[64px] font-bold leading-none tracking-tight sm:text-7xl ${
                    tone ? tone.text : "text-stone-900"
                  }`}
                >
                  {data.averageRating}
                </span>
                <div className="pb-1.5">
                  <Stars value={data.averageRating ?? 0} size="lg" />
                  <p className="mt-1.5 text-sm text-stone-500">
                    based on {data.totalReviews}{" "}
                    {data.totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              {label && tone && (
                <span
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${tone.chip}`}
                >
                  {label}
                </span>
              )}
            </div>
          </section>

          {/* Latest review */}
          {data.latestReview && (
            <section className="mt-8">
              <Kicker>Latest review</Kicker>
              <div className="mt-3">
                <ReviewCard review={data.latestReview} latest />
              </div>
            </section>
          )}

          {/* Earlier reviews */}
          {data.reviews.length > 0 && (
            <section className="mt-8">
              <Kicker className="text-stone-400">Earlier reviews</Kicker>
              <ul className="mt-3 space-y-3">
                {data.reviews.map((review) => (
                  <li key={review.id}>
                    <ReviewCard review={review} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <div className="mt-10 border-t border-stone-100 pt-8">
        <Link
          href={`/review/${restaurantId}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E23744] px-6 py-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#C42B37] active:scale-[0.99]"
        >
          Write a review
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-stone-400">
          Next.js · Neon · Vercel
        </p>
      </div>
    </main>
  );
}
