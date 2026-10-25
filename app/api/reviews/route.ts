// POST /api/reviews — the waiter that takes an order.
// In:  { "restaurantId": 1, "rating": 4, "comment": "Good, but slow service" }
// Out: 201 { "success": true, "reviewId": <new id> }
//      400 { "error": "<plain English reason>" }
// All logic lives HERE, in the backend. The frontend only sends and prints.

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  // Parse the incoming JSON. A body that isn't JSON at all is also a bad request.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1: rating is an integer from 1 to 5.
  // typeof "number" matters: "4" (text) and 4.5 are not ratings.
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 },
    );
  }

  // Check 2: comment is non-empty after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return Response.json(
      { error: "Comment must not be empty." },
      { status: 400 },
    );
  }

  // Check 3: the restaurant must actually exist. This is a database lookup,
  // not a guess — the database is the only place the truth lives.
  if (typeof restaurantId !== "number") {
    return Response.json(
      { error: "This restaurant does not exist." },
      { status: 400 },
    );
  }
  const matching = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (matching.length === 0) {
    return Response.json(
      { error: "This restaurant does not exist." },
      { status: 400 },
    );
  }

  // All checks passed. Write exactly one row — one fact, and nothing else changes.
  const [inserted] = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment, created_at)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()}, NOW())
    RETURNING id;
  `;

  return Response.json(
    { success: true, reviewId: inserted.id },
    { status: 201 },
  );
}
