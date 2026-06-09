import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";

import "./globals.css";
import { displayFont, serifFont } from "./fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { DraftModeBanner } from "@/components/DraftModeBanner";
import { sanityFetch } from "@/sanity/lib/fetch";
import { navCategoriesQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import type { CategoryRef, SiteSettings } from "@/lib/types";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adobeKit = process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT_ID;
  const { isEnabled: isDraft } = await draftMode();

  const [settings, categories] = await Promise.all([
    sanityFetch<SiteSettings>({
      query: siteSettingsQuery,
      tags: ["siteSettings"],
    }),
    sanityFetch<CategoryRef[]>({
      query: navCategoriesQuery,
      tags: ["category"],
    }),
  ]);

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
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-pink focus:text-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {isDraft ? <DraftModeBanner /> : null}
        <Header settings={settings} categories={categories ?? []} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} categories={categories ?? []} />
        <Analytics />
      </body>
    </html>
  );
}
