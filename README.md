# Zomato Lite

**A deliberately tiny real product — and a working lesson in how software actually fits together.**

One restaurant. Two things to do: **write a review**, or **read the restaurant page**
with the average rating, the latest review highlighted, and everything before it.

**Live:** https://zomato-lite-eight-phi.vercel.app/restaurant/1

---

## The architecture, in one screen

| Layer | What's here | Files |
|---|---|---|
| Frontend | Two screens that only *render* — zero maths, zero sorting | `app/restaurant/[id]/`, `app/review/[restaurantId]/` |
| Backend | Two endpoints that own all logic and validate everything twice | `app/api/reviews/route.ts`, `app/api/restaurants/[id]/route.ts` |
| Database | Two tables holding **facts only** — no `average_rating` column, no `latest_review` column, ever | `db/schema.sql` |
| Deploy | GitHub → Vercel → live URL | this repo + the Vercel project |

```sql
-- the entire intelligence of the product, recomputed fresh on every page load:
averageRating -> AVG(rating)    WHERE restaurant_id = 1
totalReviews  -> COUNT(*)       WHERE restaurant_id = 1
latestReview  -> ORDER BY created_at DESC LIMIT 1
```

The frontend receives `4.4` and prints `4.4`. The average changed five times this
session, and nobody ever updated an average — because there is no average to update.

## Three defenses at the gate

1. The star picker (kindness for honest users)
2. Backend validation (`400` with a plain-English reason for everyone else)
3. The database itself (`CHECK (rating BETWEEN 1 AND 5)`)

Attacking the production API with `rating: 500` returns
`{ "error": "Rating must be a whole number between 1 and 5." }` — the UI was never
the protection that mattered.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind, raw SQL) · Neon Postgres via `@neondatabase/serverless` · Vercel.

```bash
npm install
npm run db:setup   # applies schema + seed (needs DATABASE_URL in .env.local)
npm run dev
```
