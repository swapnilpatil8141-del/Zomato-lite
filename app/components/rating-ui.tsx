// Shared presentational kit for both screens: stars, tone labels, tone colors.
//
// ⚠ One doctrine note, so the next engineer doesn't panic:
// The application rule is "the frontend does zero maths" — the AVERAGE NUMBER
// itself is computed by the backend (AVG(rating) / COUNT(*)) and arrives ready.
// What lives here is DISPLAY BANDING ONLY: mapping an already-computed number
// to stars, a word, and a color, exactly the way Zomato renders an average.
// Changing an average still only happens in the database case ("a new review").
export function Stars({
  value,
  size = "sm",
  className = "",
}: {
  value: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const cls = size === "lg" ? "text-base sm:text-lg" : "text-sm";
  return (
    <span className={`${cls} tracking-[0.1em] ${className}`} aria-hidden="true">
      <span className="text-amber-400">
        {"★".repeat(Math.round(value))}
      </span>
      <span className="text-stone-300">{"★".repeat(Math.round(5 - value))}</span>
      <span className="sr-only">{value} out of 5 stars</span>
    </span>
  );
}

// Display banding only (a lookup, not an operation on data).
export function ratingLabel(average: number): string {
  if (average >= 4.5) return "Excellent";
  if (average >= 4) return "Very Good";
  if (average >= 3) return "Good";
  if (average >= 2) return "Average";
  return "Poor";
}

export function ratingTone(average: number): {
  text: string;
  chip: string;
} {
  if (average >= 4)
    return {
      text: "text-green-600",
      chip: "border-green-200 bg-green-50 text-green-700",
    };
  if (average >= 3)
    return {
      text: "text-yellow-600",
      chip: "border-yellow-200 bg-yellow-50 text-yellow-700",
    };
  return {
    text: "text-red-600",
    chip: "border-red-200 bg-red-50 text-red-700",
  };
}

export function ReviewerBadge({ className = "" }: { className?: string }) {
  // The reviews table has no reviewer name column (by design: the session's
  // schema stores only facts). This is the honest "who": no one, yet tasty.
  return (
    <span
      className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-stone-200 bg-stone-50 ${className}`}
      aria-hidden="true"
    >
      <img
        src="/food.svg"
        alt=""
        className="size-full scale-[3] object-cover"
      />
    </span>
  );
}

export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.22em] text-[#C42B37] ${className}`}
    >
      {children}
    </p>
  );
}
