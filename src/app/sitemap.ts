import type { MetadataRoute } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { allContentForSitemapQuery } from "@/sanity/lib/queries";
import { absoluteUrl } from "@/lib/paths";

interface SitemapData {
  articles: { slug: string; category: string; _updatedAt: string }[];
  issues: { slug: string; _updatedAt: string }[];
  categories: { slug: string; _updatedAt: string }[];
  authors: { slug: string; _updatedAt: string }[];
  pages: { slug: string; _updatedAt: string }[];
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await sanityFetch<SitemapData>({
    query: allContentForSitemapQuery,
    tags: ["article", "issue", "category", "author", "page"],
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/issues"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.3 },
  ];

  if (!data) return staticRoutes;

  const articles = data.articles.map((a) => ({
    url: absoluteUrl(`/${a.category}/${a.slug}`),
    lastModified: a._updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const issues = data.issues.map((i) => ({
    url: absoluteUrl(`/issues/${i.slug}`),
    lastModified: i._updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const categories = data.categories.map((c) => ({
    url: absoluteUrl(`/${c.slug}`),
    lastModified: c._updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));
  const authors = data.authors.map((a) => ({
    url: absoluteUrl(`/author/${a.slug}`),
    lastModified: a._updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));
  const pages = data.pages
    .filter((p) => !["about", "contact"].includes(p.slug))
    .map((p) => ({
      url: absoluteUrl(`/${p.slug}`),
      lastModified: p._updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    }));

  return [
    ...staticRoutes,
    ...categories,
    ...articles,
    ...issues,
    ...authors,
    ...pages,
  ];
}
