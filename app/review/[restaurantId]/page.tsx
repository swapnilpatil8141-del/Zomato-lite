// /review/[restaurantId] — server entry for screen 1.
// The server opens the URL and hands the id down to the client form.
// Live-data route: no static shell to prerender, so we opt out.
import ReviewForm from "./review-form";

export const instant = false;

export default async function Page({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  return <ReviewForm restaurantId={Number(restaurantId)} />;
}
