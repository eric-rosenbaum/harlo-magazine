import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { pageBySlugQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { SocialIcons } from "@/components/SocialIcons";
import { buildMetadata } from "@/lib/metadata";
import type { Page, SiteSettings } from "@/lib/types";

export const revalidate = 3600;

async function getData() {
  const [page, settings] = await Promise.all([
    sanityFetch<Page>({
      query: pageBySlugQuery,
      params: { slug: "contact" },
      tags: ["page"],
    }),
    sanityFetch<SiteSettings>({
      query: siteSettingsQuery,
      tags: ["siteSettings"],
    }),
  ]);
  return { page, settings };
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getData();
  return buildMetadata({
    title: page?.title || "Contact",
    description: "Get in touch with Harlo Magazine.",
    path: "/contact",
    seo: page?.seo,
  });
}

export default async function ContactPage() {
  const { page, settings } = await getData();

  return (
    <div className="container-page py-16">
      <h1 className="display-title mb-10">{page?.title || "Contact"}</h1>

      {page?.body ? (
        <PortableTextRenderer value={page.body} className="prose-harlo mb-12" />
      ) : (
        <p className="prose-harlo mb-12 text-muted">
          For press, pitches and partnerships, reach us through the channels
          below.
        </p>
      )}

      {settings?.socials?.length ? (
        <div>
          <p className="kicker mb-3">Find us</p>
          <SocialIcons socials={settings.socials} />
        </div>
      ) : null}
    </div>
  );
}
