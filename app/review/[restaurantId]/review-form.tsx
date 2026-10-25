"use client";

// The interactive part of the review screen.
// The frontend does ZERO validation logic of its own: it collects three values,
// hands them to POST /api/reviews, and steps back. The backend decides whether
// the review is acceptable. If the backend refuses, we display the backend's
// own message — not one we invented.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewForm({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch the restaurant name so the reviewer knows what they are reviewing.
  useEffect(() => {
    let active = true;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload: { name: string }) => {
        if (active) setName(payload.name);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [restaurantId]);

  const canSubmit = rating !== null && comment.trim().length > 0 && !submitting;

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
      // The backend refused. Display what the backend said, verbatim.
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <main className={container}>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
          Write a review
        </p>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-tight text-stone-900">
          {name ?? "…"}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Stars, a line, done. Around 20 seconds.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-10">
        <label className="block text-sm font-medium text-stone-800">
          Your rating
        </label>
        <div
          className="mt-3 flex gap-1"
          role="radiogroup"
          aria-label="Rating from 1 to 5 stars"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              onClick={() => setRating(n)}
              className={`h-12 w-12 rounded-xl text-4xl transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                rating !== null && n <= rating
                  ? "text-amber-500"
                  : "text-stone-200 hover:text-stone-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating !== null && (
          <p className="mt-2 text-sm font-medium text-amber-700">
            {rating} out of 5
          </p>
        )}

        <label
          htmlFor="comment"
          className="mt-8 block text-sm font-medium text-stone-800"
        >
          Your review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="What stood out? What would you tell a friend?"
          className="mt-3 w-full min-h-[140px] resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100"
        />

        {error && (
          <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-8 w-full rounded-xl bg-amber-700 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-amber-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-amber-700 disabled:active:scale-100"
        >
          {submitting ? "Sending…" : "Submit review"}
        </button>
      </form>

      <p className="mt-12 text-center text-[11px] uppercase tracking-[0.2em] text-stone-400">
        Zomato Lite — a tiny real product
      </p>
    </main>
  );
}
