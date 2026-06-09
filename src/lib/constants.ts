import type { AccentColor } from "./types";

/** Route segments that must never be used as a category slug (Section 4). */
export const RESERVED_SLUGS = [
  "issues",
  "about",
  "contact",
  "author",
  "search",
  "studio",
  "api",
  "sitemap.xml",
  "robots.txt",
  "rss.xml",
];

/** Brand accent tokens, mapped to their CSS custom property values. */
export const ACCENT_HEX: Record<AccentColor, string> = {
  pink: "#FF46A2",
  orange: "#FFA500",
  yellow: "#FFEE8C",
  lime: "#93F236",
  blue: "#04D9FF",
};

/** Resolve a category's accent to a hex value, defaulting to the brand pink. */
export function accentHex(accent?: AccentColor): string {
  return accent ? ACCENT_HEX[accent] ?? ACCENT_HEX.pink : ACCENT_HEX.pink;
}

export const CATEGORY_PAGE_SIZE = 12;

export const SITE_NAME = "Harlo Magazine";
export const SITE_TAGLINE = "Culture · Fashion · Music";
