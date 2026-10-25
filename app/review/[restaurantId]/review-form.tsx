"use client";

// The interactive part of the review screen.
// The frontend collects three values, hands them to POST /api/reviews, and
// steps back. The backend decides whether the review is acceptable; if it
// refuses, we display the backend's own message verbatim.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Kicker, ratingLabel } from "../../components/rating-ui";

export default function ReviewForm({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch identity for the compact header card.
  useEffect(() => {
    let active = true;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload: { name: string; cuisine: string; area: string }) => {
        if (!active) return;
        setName(payload.name);
        setCuisine(payload.cuisine);
        setArea(payload.area);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [restaurantId]);

  const canSubmit = rating !== null && comment.trim().length > 0 && !submitting;
  const shown = hovered ?? rating;
  const commentLength = comment.length; // display-only counter, capped below

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });
      if (res.ok) {
        // Backend accepted the row. Show the fresh state of the restaurant.
        router.push(`/restaurant/${restaurantId}`);
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <main className={container}>
      {/* Compact header card */}
      <section className="flex items-center gap-4 rounded-3xl border border-stone-200/70 bg-white p-4 shadow-sm sm:gap-5 sm:p-5">
        <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-100 sm:h-20 sm:w-20">
          <img
            src="/food.svg"
            alt=""
            className="size-full object-cover"
          />
        </span>
        <div className="min-w-0">
          <Kicker>Write a review</Kicker>
          <h1 className="mt-1.5 truncate text-xl font-bold tracking-tight text-stone-900 sm:text-[26px]">
            {name ?? "…"}
          </h1>
          {cuisine && area && (
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              {cuisine} · {area}
            </p>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mt-8">
        {/* Star picker with hover preview */}
        <div
          className="rounded-3xl border border-stone-200/70 bg-white p-5 shadow-sm sm:p-6"
          onMouseLeave={() => setHovered(null)}
        >
          <p className="text-sm font-semibold text-stone-800">Your rating</p>
          <div
            className="mt-3 flex gap-1.5"
            role="radiogroup"
            aria-label="Rating from 1 to 5 stars"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${ratingLabel(n)} (${n} ${n === 1 ? "star" : "stars"})`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onFocus={() => setHovered(n)}
                onBlur={() => setHovered(null)}
                className={`h-12 w-12 rounded-xl text-[38px] leading-none transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E23744] hover:scale-110 sm:w-14 ${
                  shown !== null && n <= shown
                    ? "text-[#E23744]"
                    : "text-stone-200 hover:text-stone-300 focus-visible:text-stone-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            {shown !== null && (
              <>
                <p className="text-sm font-bold text-[#C42B37]">
                  {[
                    "",
                    "Poor",
                    "Average",
                    "Good",
                    "Very Good",
                    "Excellent",
                  ][shown]}
                </p>
                <p className="text-xs text-stone-400">{shown} out of 5</p>
              </>
            )}
          </div>
        </div>

        {/* Review text */}
        <div className="mt-5 rounded-3xl border border-stone-200/70 bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="comment"
            className="text-sm font-semibold text-stone-800"
          >
            Your review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="How was the food, the service, the vibe? Say it like you'd tell a friend — every word goes into the record."
            className="mt-3 w-full min-h-[140px] resize-y rounded-2xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-[#E23744] focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-stone-400">
              Be specific — future diners read this.
            </span>
            <span
              className={`tabular-nums ${
                commentLength >= 450 ? "text-[#C42B37]" : "text-stone-400"
              }`}
            >
              {commentLength}/500
            </span>
          </div>
        </div>

        {/* Error state — the backend's own words */}
        {error && (
          <p className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#E23744] px-6 py-4 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-[#C42B37] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#E23744] disabled:active:scale-100"
        >
          {submitting && (
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          )}
          {submitting ? "Sending…" : "Submit review"}
        </button>
      </form>

      <p className="mt-12 text-center text-[10px] uppercase tracking-[0.2em] text-stone-400">
        Zomato Lite — a tiny real product
      </p>
    </main>
  );
}
