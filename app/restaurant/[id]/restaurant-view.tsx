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

// Pure display helper: turn a given rating into stars. No maths — the rating
// arrived as a number from the API; we only draw it.
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

  const container = "mx-auto w-full max-w-[560px] px-6 py-12";

  if (notFound) {
    return (
      <main className={container}>
        <p className="text-stone-500">
          This restaurant does not exist. Check the address in the URL.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={container}>
        <p className="text-stone-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className={container}>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        {data.name}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {data.cuisine} · {data.area}
      </p>

      {data.totalReviews === 0 ? (
        // Empty state: no facts exist yet, so there is no rating to print.
        // "No rating yet" is not "0 stars" — that distinction is in the API.
        <div className="mt-12 rounded-xl border border-stone-200 p-8 text-center">
          <p className="text-stone-900">No reviews of {data.name} yet.</p>
          <p className="mt-1 text-sm text-stone-500">
            Be the first to say how it was.
          </p>
          <Link
            href={`/review/${restaurantId}`}
            className="mt-6 inline-block rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            Write the first review
          </Link>
        </div>
      ) : (
        <>
          {/* The average, printed exactly as the backend computed it. */}
          <div className="mt-10 flex items-baseline gap-3">
            <span className="text-6xl font-bold tracking-tight text-stone-900">
              {data.averageRating}
            </span>
            <span className="text-sm text-stone-500">
              {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>
          {data.latestReview && (
            <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-amber-700">
                Latest
              </p>
              <p className="mt-3 text-stone-900">{data.latestReview.comment}</p>
              <p className="mt-3 text-sm text-stone-500">
                <Stars value={data.latestReview.rating} className="text-amber-600" />
                <span className="ml-2">{formatDate(data.latestReview.createdAt)}</span>
              </p>
            </div>
          )}

          {data.reviews.length > 0 && (
            <>
              <h2 className="mt-12 text-xs font-medium uppercase tracking-widest text-stone-400">
                Earlier reviews
              </h2>
              <ul className="mt-4 divide-y divide-stone-200">
                {data.reviews.map((review) => (
                  <li key={review.id} className="py-5">
                    <p className="text-stone-900">{review.comment}</p>
                    <p className="mt-2 text-sm text-stone-500">
                      <Stars value={review.rating} className="text-amber-600" />
                      <span className="ml-2">{formatDate(review.createdAt)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <div className="mt-12 border-t border-stone-200 pt-8">
        <Link
          href={`/review/${restaurantId}`}
          className="inline-block rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-900 hover:border-amber-700 hover:text-amber-700"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
