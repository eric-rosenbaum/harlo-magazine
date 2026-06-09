import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Branded fallback favicon (pink "H"). Replace by uploading a favicon derived
// from the peacock badge if a bespoke icon is preferred.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          background: "#fff",
          color: "#FF46A2",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        H
      </div>
    ),
    size
  );
}
