import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { pageBySlugQuery } from "@/sanity/lib/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { EmptyState } from "@/components/EmptyState";
import { buildMetadata } from "@/lib/metadata";
import type { Page } from "@/lib/types";

export const revalidate = 3600;

async function getPage() {
  return sanityFetch<Page>({
    query: pageBySlugQuery,
    params: { slug: "about" },
    tags: ["page"],
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage();
  return buildMetadata({
    title: page?.title || "About",
    description: "About Harlo Magazine.",
    path: "/about",
    seo: page?.seo,
  });
}

export default async function AboutPage() {
  const page = await getPage();

  if (!page) {
    return (
      <EmptyState
        title="About Harlo"
        body="This page hasn't been written yet. The editor can add it in the studio."
        ctaHref="/studio"
        ctaLabel="Open the studio"
      />
    );
  }

  return (
    <div className="container-page py-16">
      <h1 className="display-title mb-10">{page.title}</h1>
      <PortableTextRenderer value={page.body} className="prose-harlo" />
    </div>
  );
}
