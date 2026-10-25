// /restaurant/[id] — server entry for screen 2.
// The server opens the URL (awaiting params) and hands the id down as a plain
// number to the client component that renders and fetches.
//
// This route is honest about itself: every byte of it comes from the live
// database on each request, so there is no meaningful static shell to
// prerender. We opt out of Instant Navigation for this route.
import RestaurantView from "./restaurant-view";

export const instant = false;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantView restaurantId={Number(id)} />;
}
