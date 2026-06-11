import type { Metadata, Viewport } from "next";

import "./globals.css";
import { displayFont, serifFont } from "./fonts";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Harlo is a culture, fashion and music magazine — stories and print-style issues, online.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/**
 * Root shell only. Global site chrome (Header/Footer) lives in the (site) route
 * group's layout so that /studio renders full-screen — the embedded Sanity
 * Studio needs the full viewport height to pin its Publish bar to the bottom.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adobeKit = process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT_ID;

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${serifFont.variable}`}
    >
      <head>
        {adobeKit ? (
          <link rel="stylesheet" href={`https://use.typekit.net/${adobeKit}.css`} />
        ) : null}
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
