import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  allArticlePathsQuery,
  articleBySlugQuery,
} from "@/sanity/lib/queries";
import { urlForImageSrc } from "@/sanity/image";
import { SanityImage } from "@/components/SanityImage";
import { CategoryEyebrow } from "@/components/CategoryEyebrow";
import { Byline } from "@/components/Byline";
import { ShareButtons } from "@/components/ShareButtons";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { IssuePromoCard } from "@/components/IssuePromoCard";
import { AuthorBio } from "@/components/AuthorBio";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionTitle } from "@/components/SectionTitle";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { absoluteUrl, articlePathFromParts } from "@/lib/paths";
import { isoDate } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import type { Article } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const paths = await sanityFetch<{ category: string; slug: string }[]>({
    query: allArticlePathsQuery,
    tags: ["article"],
  });
  return paths ?? [];
}

async function getArticle(category: string, slug: string) {
  return sanityFetch<Article>({
    query: articleBySlugQuery,
    params: { category, slug },
    tags: ["article"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt || article.dek,
    path: articlePathFromParts(category, slug),
    image: article.heroImage,
    seo: article.seo,
    type: "article",
    publishedTime: article.publishedAt,
    authors: article.authors?.map((a) => a.name),
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) notFound();

  const path = articlePathFromParts(category, slug);
  const heroOg = article.heroImage?.asset
    ? urlForImageSrc(article.heroImage, 1200)
    : undefined;

  return (
    <article className="py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.excerpt || article.dek,
          image: heroOg ? [heroOg] : undefined,
          datePublished: article.publishedAt,
          dateModified: article.publishedAt,
          author: article.authors?.map((a) => ({
            "@type": "Person",
            name: a.name,
            url: absoluteUrl(`/author/${a.slug}`),
          })),
          publisher: { "@type": "Organization", name: SITE_NAME },
          mainEntityOfPage: absoluteUrl(path),
        }}
      />

      {/* Masthead */}
      <header className="container-page max-w-[var(--container-max)]">
        <div className="mx-auto max-w-3xl text-center">
          <CategoryEyebrow category={article.category} />
          <h1 className="font-head font-extrabold uppercase tracking-tight text-pink text-4xl md:text-6xl leading-[0.98] mt-3 mb-4">
            {article.title}
          </h1>
          {article.dek ? (
            <p className="font-body italic text-xl md:text-2xl text-ink/90 mb-5">
              {article.dek}
            </p>
          ) : null}
          <div className="flex flex-col items-center gap-3">
            <Byline
              authors={article.authors}
              publishedAt={article.publishedAt}
              readTimeSource={article.readTimeSource}
            />
            <ShareButtons path={path} title={article.title} />
          </div>
        </div>
      </header>

      {/* Hero image */}
      <figure className="container-page my-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2f2f2]">
          <SanityImage
            image={article.heroImage}
            fill
            priority
            sizes="100vw"
          />
        </div>
        {(article.heroImage?.caption || article.heroImage?.credit) && (
          <figcaption className="meta mt-2">
            {article.heroImage?.caption}
            {article.heroImage?.caption && article.heroImage?.credit ? " · " : ""}
            {article.heroImage?.credit}
          </figcaption>
        )}
      </figure>

      {/* Body */}
      <div className="container-page">
        <PortableTextRenderer
          value={article.body}
          className="prose-harlo mx-auto"
        />

        {article.relatedIssue ? (
          <div className="prose-harlo mx-auto mt-10">
            <IssuePromoCard issue={article.relatedIssue} />
          </div>
        ) : null}

        {article.tags?.length ? (
          <div className="prose-harlo mx-auto mt-10 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="kicker border border-rule px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Author bios */}
        {article.authors?.length ? (
          <div className="prose-harlo mx-auto mt-12 flex flex-col gap-6 border-t border-rule pt-8">
            {article.authors.map((author) => (
              <AuthorBio key={author._id} author={author} />
            ))}
          </div>
        ) : null}
      </div>

      {/* More from category */}
      {article.moreFromCategory?.length ? (
        <section className="container-page mt-20">
          <SectionTitle
            href={`/${article.category?.slug}`}
            seeAllHref={`/${article.category?.slug}`}
          >
            More from {article.category?.title}
          </SectionTitle>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {article.moreFromCategory.map((a) => (
              <ArticleCard key={a._id} article={a} variant="grid" />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
