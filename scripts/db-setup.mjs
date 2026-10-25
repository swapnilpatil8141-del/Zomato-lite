// db-setup.mjs — a one-off housekeeping script:
// 1. connect to Neon, 2. wipe/reset our two tables, 3. apply the schema,
// 4. seed Ludhiana Burrito + three reviews, 5. print the resulting rows.
// Run it with: npm run db:setup

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL);

const schema = readFileSync("db/schema.sql", "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement); // schema statements are trusted, static file content
}

// Reset first so running this script twice always ends in the same state.
await sql.query(`DROP TABLE IF EXISTS reviews;`);
await sql.query(`DROP TABLE IF EXISTS restaurants;`);
for (const statement of statements) {
  await sql.query(statement);
}

const [restaurant] = await sql`
  INSERT INTO restaurants (name, cuisine, area)
  VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32')
  RETURNING id;
`;

const seedReviews = [
  { rating: 5, comment: "Paneer burrito is unreal", daysAgo: 8 },
  { rating: 4, comment: "Good, but slow service", daysAgo: 6 },
  { rating: 4, comment: "Solid. Would repeat.", daysAgo: 2 },
];

for (const { rating, comment, daysAgo } of seedReviews) {
  await sql`
    INSERT INTO reviews (restaurant_id, rating, comment, created_at)
    VALUES (${restaurant.id}, ${rating}, ${comment}, NOW() - (${daysAgo} * INTERVAL '1 day'));
  `;
}

const restaurants = await sql`SELECT * FROM restaurants ORDER BY id;`;
const reviews = await sql`SELECT * FROM reviews ORDER BY id;`;

console.log("restaurants table:");
console.table(
  restaurants.map((r) => ({ id: r.id, name: r.name, cuisine: r.cuisine, area: r.area }))
);

console.log("reviews table:");
console.table(
  reviews.map((r) => ({
    id: r.id,
    restaurant_id: r.restaurant_id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at.toISOString().replace("T", " ").slice(0, 16),
  }))
);
