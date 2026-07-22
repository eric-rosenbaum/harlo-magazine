import Link from "next/link";

import { sanityFetch } from "@/sanity/lib/fetch";
import { homepageQuery } from "@/sanity/lib/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionTitle } from "@/components/SectionTitle";
import { CategoryEyebrow } from "@/components/CategoryEyebrow";
import { SanityImage } from "@/components/SanityImage";
import { EmptyState } from "@/components/EmptyState";
import { JsonLd } from "@/components/JsonLd";
import { issuePath } from "@/lib/paths";
import type { ArticleCard as ArticleCardType, HomepageData } from "@/lib/types";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

function groupTrending(trending: ArticleCardType[]) {
  const groups: { slug: string; title: string; items: ArticleCardType[] }[] = [];
  for (const article of trending) {
    const cat = article.category;
    if (!cat) continue;
    let group = groups.find((g) => g.slug === cat.slug);
    if (!group) {
      group = { slug: cat.slug, title: cat.title, items: [] };
      groups.push(group);
    }
    group.items.push(article);
  }
  return groups;
}

export default async function HomePage() {
  const data = await sanityFetch<HomepageData>({
    query: homepageQuery,
    tags: ["article", "issue", "category", "siteSettings"],
  });

  if (!data?.hero) {
    return (
      <EmptyState
        title="Harlo is warming up"
        body="No stories have been published yet. Once the editor publishes an article it will appear here."
        ctaHref="/studio"
        ctaLabel="Open the studio"
      />
    );
  }

  const trendingGroups = groupTrending(data.trending ?? []);

  return (
    <div className="container-page py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: process.env.NEXT_PUBLIC_SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Above the fold: three columns */}
      <section className="grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        {/* Left — The Latest */}
        <aside className="order-2 lg:order-1">
          <SectionTitle>The Latest</SectionTitle>
          <div>
            {data.latest.map((a) => (
              <ArticleCard key={a._id} article={a} variant="list" />
            ))}
          </div>
        </aside>

        {/* Center — Feature hero */}
        <div className="order-1 lg:order-2">
          <ArticleCard article={data.hero} variant="feature" priority />
          {data.secondaryFeatures?.length ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {data.secondaryFeatures.map((a) => (
                <ArticleCard key={a._id} article={a} variant="grid" />
              ))}
            </div>
          ) : null}
        </div>

        {/* Right — Trending */}
        <aside className="order-3">
          <SectionTitle>Trending</SectionTitle>
          {trendingGroups.length ? (
            <div className="flex flex-col gap-6">
              {trendingGroups.map((group) => (
                <div key={group.slug}>
                  <Link href={`/${group.slug}`}>
                    <p className="kicker mb-1">{group.title}</p>
                  </Link>
                  {group.items.map((a) => (
                    <ArticleCard key={a._id} article={a} variant="trending" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">
              Nothing trending right now — check back soon.
            </p>
          )}
        </aside>
      </section>

      {/* Below the fold — per-category strips */}
      {data.categoryStrips
        ?.filter((c) => c.articles?.length)
        .map((cat) => (
          <section key={cat._id} className="mt-16">
            <SectionTitle href={`/${cat.slug}`} seeAllHref={`/${cat.slug}`}>
              {cat.title}
            </SectionTitle>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {cat.articles.map((a) => (
                <ArticleCard key={a._id} article={a} variant="grid" />
              ))}
            </div>
          </section>
        ))}

      {/* Issues promo */}
      {data.latestIssue ? (
        <section className="mt-20 border-y border-rule py-12 grid gap-8 md:grid-cols-[300px_1fr] items-center">
          <Link href={issuePath(data.latestIssue)} className="block max-w-[300px]">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f2f2]">
              <SanityImage
                image={data.latestIssue.coverImage}
                fill
                sizes="300px"
              />
            </div>
          </Link>
          <div>
            <CategoryEyebrow
              category={{
                _id: "x",
                title: "The Latest Issue",
                slug: "issues",
                accentColor: "blue",
              }}
              asLink={false}
            />
            <h2 className="font-head font-extrabold uppercase text-pink text-3xl md:text-4xl mt-2 mb-3 leading-none">
              Issue {data.latestIssue.issueNumber} — {data.latestIssue.title}
            </h2>
            {data.latestIssue.description ? (
              <p className="text-lg mb-5 max-w-xl">
                {data.latestIssue.description}
              </p>
            ) : null}
            <Link
              href={issuePath(data.latestIssue)}
              className="section-title !text-pink !text-base hover:underline"
            >
              Read the issue →
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
