import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allCategorySlugsQuery,
  articlesByCategoryCountQuery,
  articlesByCategoryQuery,
  categoryBySlugQuery,
} from "@/sanity/lib/queries";
import { LoadMore } from "@/components/LoadMore";
import { EmptyState } from "@/components/EmptyState";
import { buildMetadata } from "@/lib/metadata";
import { accentHex, CATEGORY_PAGE_SIZE } from "@/lib/constants";
import type { ArticleCard, CategoryRef } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: allCategorySlugsQuery,
    tags: ["category"],
  });
  return (slugs ?? []).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await sanityFetch<CategoryRef>({
    query: categoryBySlugQuery,
    params: { slug },
    tags: ["category"],
  });
  if (!category) return {};
  return buildMetadata({
    title: category.title,
    description: category.description || `The latest in ${category.title} from Harlo.`,
    path: `/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;

  const [category, articles, total] = await Promise.all([
    sanityFetch<CategoryRef>({
      query: categoryBySlugQuery,
      params: { slug },
      tags: ["category"],
    }),
    sanityFetch<ArticleCard[]>({
      query: articlesByCategoryQuery,
      params: { slug, start: 0, end: CATEGORY_PAGE_SIZE },
      tags: ["article"],
    }),
    sanityFetch<number>({
      query: articlesByCategoryCountQuery,
      params: { slug },
      tags: ["article"],
    }),
  ]);

  if (!category) notFound();

  const accent = accentHex(category.accentColor);

  return (
    <div className="container-page py-12">
      <header className="mb-10 border-b-2 pb-4" style={{ borderColor: accent }}>
        <h1 className="display-title !text-pink">{category.title}</h1>
        {category.description ? (
          <p className="text-lg text-muted mt-3 max-w-2xl">
            {category.description}
          </p>
        ) : null}
      </header>

      {articles?.length ? (
        <LoadMore
          categorySlug={slug}
          initial={articles}
          total={total ?? articles.length}
        />
      ) : (
        <EmptyState
          title="No stories here yet"
          body={`When the editor publishes in ${category.title}, it will appear here.`}
          ctaHref="/"
        />
      )}
    </div>
  );
}
