// The social sharing card: what LinkedIn, X and chat apps show when our URL
// is pasted. Rendered by Next at deploy time into a real 1200x630 PNG.
import { ImageResponse } from "next/og";

export const alt = "Zomato Lite — Ludhiana Burrito, reviewed honestly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#FBFAF8",
          color: "#1C1917",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.28em",
            color: "#B45309",
            fontWeight: 700,
          }}
        >
          ZOMATO LITE
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Ludhiana Burrito
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#78716C" }}>
            Indian · Sector 32 — one restaurant, reviewed honestly.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #E7E5E4",
            paddingTop: 32,
          }}
        >
          <div style={{ display: "flex", fontSize: 34, color: "#D97706" }}>
            ★★★★★
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.18em",
              color: "#A8A29E",
            }}
          >
            NEXT.JS · NEON · VERCEL
          </div>
        </div>
      </div>
    ),
    size,
  );
}
