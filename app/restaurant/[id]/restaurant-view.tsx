"use client";

// The interactive part of the restaurant screen.
// It calls GET /api/restaurants/[id] and renders what it receives.
// There is NO adding, NO dividing, NO sorting in this file. It renders.

import Link from "next/link";
import { useEffect, useState } from "react";

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
  averageRating: number | null; // computed by the backend: AVG(rating)
  totalReviews: number; // computed by the backend: COUNT(*)
  latestReview: Review | null; // computed by the backend: newest, take one
  reviews: Review[]; // every other review, newest first
};

// Pure display helper: turn a given rating into stars. The rating arrived as a
// number from the API; we only draw it.
function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={className}>
      <span>{"★".repeat(value)}</span>
      <span className="text-stone-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
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

  const container = "mx-auto w-full max-w-[600px] px-6 pb-16 pt-14";

  if (notFound) {
    return (
      <main className={container}>
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center">
          <p className="font-medium text-stone-900">Nothing at this address.</p>
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
        <p className="animate-pulse text-sm text-stone-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className={container}>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
          Ludhiana Burrito — Zomato Lite
        </p>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-tight text-stone-900">
          {data.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
            {data.cuisine}
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600">
            {data.area}
          </span>
        </div>
      </header>

      {data.totalReviews === 0 ? (
        // Empty state: no facts exist yet, so there is no rating to print.
        // "No rating yet" is not "0 stars" — that distinction is in the API.
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 p-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
            First review pending
          </p>
          <p className="mt-3 text-stone-900">
            Nobody has reviewed {data.name} yet.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Be the first to say how it was.
          </p>
          <Link
            href={`/review/${restaurantId}`}
            className="mt-6 inline-block rounded-xl bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
          >
            Write the first review
          </Link>
        </div>
      ) : (
        <>
          {/* The average, printed exactly as the backend computed it. */}
          <section className="mt-12 border-b border-stone-200 pb-10">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[72px] font-bold leading-none tracking-tight text-stone-900">
                  {data.averageRating}
                </span>
                <p className="mt-3 text-sm text-stone-500">
                  average across {data.totalReviews}{" "}
                  {data.totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
              <span className="text-5xl text-amber-500" aria-hidden="true">
                ★
              </span>
            </div>
          </section>

          {data.latestReview && (
            <section className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                Latest
              </p>
              <figure className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-7">
                <blockquote className="text-lg leading-relaxed text-stone-900">
                  “{data.latestReview.comment}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2.5 text-sm">
                  <Stars value={data.latestReview.rating} className="text-amber-600" />
                  <span className="text-stone-300">·</span>
                  <time className="text-stone-500">
                    {formatDate(data.latestReview.createdAt)}
                  </time>
                </figcaption>
              </figure>
            </section>
          )}

          {data.reviews.length > 0 && (
            <section className="mt-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                Earlier reviews
              </p>
              <ul className="mt-2 divide-y divide-stone-100">
                {data.reviews.map((review) => (
                  <li key={review.id} className="py-5">
                    <p className="text-[15px] leading-relaxed text-stone-800">
                      {review.comment}
                    </p>
                    <p className="mt-2 flex items-center gap-2.5 text-sm">
                      <Stars value={review.rating} className="text-amber-600" />
                      <span className="text-stone-300">·</span>
                      <time className="text-[13px] text-stone-500">
                        {formatDate(review.createdAt)}
                      </time>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <footer className="mt-14 flex items-center justify-between gap-6 border-t border-stone-200 pt-8">
        <Link
          href={`/review/${restaurantId}`}
          className="rounded-xl bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
        >
          Write a review →
        </Link>
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Next.js · Neon · Vercel
        </p>
      </footer>
    </main>
  );
}
