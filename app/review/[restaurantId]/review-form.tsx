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

  return (
    <main className={container}>
      <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
        Reviewing
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
        {name ?? "…"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-10">
        <label className="block text-sm font-medium text-stone-700">
          Your rating
        </label>
        <div
          className="mt-2 flex"
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
              className={`h-12 w-12 rounded-lg text-3xl transition-colors ${
                rating !== null && n <= rating
                  ? "text-amber-600"
                  : "text-stone-300 hover:text-stone-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <label
          htmlFor="comment"
          className="mt-8 block text-sm font-medium text-stone-700"
        >
          Your review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What stood out? What would you tell a friend?"
          className="mt-2 w-full resize-y rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-amber-700 focus:outline-none"
        />

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-8 w-full rounded-lg bg-amber-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-amber-700"
        >
          {submitting ? "Sending…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
