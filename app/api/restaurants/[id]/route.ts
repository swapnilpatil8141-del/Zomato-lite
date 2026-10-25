// GET /api/restaurants/[id] — everything the restaurant page needs, shaped like the screen.
// The three computed answers are computed FRESH on every call.
// There is no average_rating column and no latest_review column — and there never will be.

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const restaurantId = Number(id);

  const [restaurant] = await sql`
    SELECT name, cuisine, area
    FROM restaurants
    WHERE id = ${restaurantId};
  `;

  if (!restaurant) {
    return Response.json(
      { error: "Restaurant not found." },
      { status: 404 },
    );
  }

  // The answer to "what is our average": computed now, from the facts.
  const [stats] = await sql`
    SELECT AVG(rating) AS average_rating, COUNT(*) AS total
    FROM reviews
    WHERE restaurant_id = ${restaurantId};
  `;

  // The answer to "what is our latest review": sort by time, take one.
  const [latest] = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
    LIMIT 1;
  `;

  // Every other review, newest first. The latest one is already shown
  // by itself above, so it is excluded here to avoid printing it twice.
  const olderReviews = latest
    ? await sql`
        SELECT id, rating, comment, created_at
        FROM reviews
        WHERE restaurant_id = ${restaurantId} AND id <> ${latest.id}
        ORDER BY created_at DESC, id DESC;
      `
    : [];

  const totalReviews = Number(stats.total);
  // Round to one decimal in the BACKEND (the frontend does zero maths).
  const averageRating =
    stats.average_rating === null
      ? null
      : Math.round(Number(stats.average_rating) * 10) / 10;

  const toApiReview = (row: Record<string, unknown>) => ({
    id: Number(row.id),
    rating: Number(row.rating),
    comment: String(row.comment),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
  });

  return Response.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews,
    latestReview: latest ? toApiReview(latest) : null,
    reviews: olderReviews.map((row) => toApiReview(row)),
  });
}
