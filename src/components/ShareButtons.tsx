"use client";

import { useState } from "react";

import { absoluteUrl } from "@/lib/paths";

export function ShareButtons({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(path);

  const share = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable; no-op */
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="meta">Share</span>
      <button
        type="button"
        className="meta hover:text-pink"
        onClick={() =>
          share(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              url
            )}&text=${encodeURIComponent(title)}`
          )
        }
      >
        X
      </button>
      <button
        type="button"
        className="meta hover:text-pink"
        onClick={() =>
          share(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              url
            )}`
          )
        }
      >
        Facebook
      </button>
      <button type="button" className="meta hover:text-pink" onClick={copy}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
