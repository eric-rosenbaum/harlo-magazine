import { clsx, type ClassValue } from "clsx";

/** Tailwind-friendly className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Estimate read time from plain body text at ~200 wpm. Minimum 1 min. */
export function readingTime(plainText?: string): number {
  if (!plainText) return 1;
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * "x hours ago" for the last 24h, otherwise an absolute date.
 * Stable across server/client by avoiding locale-dependent relative libs.
 */
export function displayDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMs < 0) return absoluteDate(date);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  return absoluteDate(date);
}

export function absoluteDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** ISO date (YYYY-MM-DD) for <time dateTime> and feeds. */
export function isoDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString();
}
