"use client";

import dynamic from "next/dynamic";

// The viewer pulls in PDF.js + the flip engine, both browser-only and heavy, so
// it's code-split and never server-rendered. This keeps content pages light;
// the bundle only loads on the issue route.
const FlipbookViewer = dynamic(() => import("./FlipbookViewer"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-[#f6f6f6]"
      style={{ minHeight: 420 }}
    >
      <span className="meta">Loading the flipbook…</span>
    </div>
  ),
});

export function FlipbookLoader(props: {
  url: string;
  title: string;
  allowDownload?: boolean;
  sizeBytes?: number;
}) {
  return <FlipbookViewer {...props} />;
}
