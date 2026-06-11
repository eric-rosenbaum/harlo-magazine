import { draftMode } from "next/headers";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { DraftModeBanner } from "@/components/DraftModeBanner";
import { sanityFetch } from "@/sanity/lib/fetch";
import { navCategoriesQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import type { CategoryRef, SiteSettings } from "@/lib/types";

/**
 * Public site chrome. Everything under (site) gets the Header/Footer; /studio
 * lives outside this group and renders bare (full-screen Studio).
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <>
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
    </>
  );
}
