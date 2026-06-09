import { Montserrat, Source_Serif_4 } from "next/font/google";

/**
 * Font strategy (Section 6.2 + Q4):
 *   - Display / headlines / nav: "Lemon Milk" is the brand face but isn't
 *     licensed for web yet. Montserrat (geometric, clean, uppercase-friendly) is
 *     the stand-in. To swap in Lemon Milk, replace this with `next/font/local`
 *     pointing at the licensed woff2 files — nothing else changes.
 *   - Body: Source Serif 4, the documented fallback for Minion Pro. If an Adobe
 *     Fonts kit id is provided, "minion-pro" is preferred ahead of it in the CSS
 *     stack (see layout.tsx + globals.css).
 */
export const displayFont = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const serifFont = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-fallback",
  display: "swap",
});
