import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { allAuthorSlugsQuery, authorBySlugQuery } from "@/sanity/lib/queries";
import { SanityImage } from "@/components/SanityImage";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { SocialIcons } from "@/components/SocialIcons";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import { buildMetadata } from "@/lib/metadata";
import type { Author } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: allAuthorSlugsQuery,
    tags: ["author"],
  });
  return (slugs ?? []).map((slug) => ({ slug }));
}

async function getAuthor(slug: string) {
  return sanityFetch<Author>({
    query: authorBySlugQuery,
    params: { slug },
    tags: ["author", "article"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return {};
  return buildMetadata({
    title: author.name,
    description: `Stories by ${author.name} for Harlo.`,
    path: `/author/${slug}`,
    image: author.photo,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) notFound();

  return (
    <div className="container-page py-12">
      <header className="flex flex-col items-center text-center gap-4 mb-12 border-b border-rule pb-10">
        {author.photo?.asset ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#f2f2f2]">
            <SanityImage image={author.photo} fill sizes="96px" />
          </div>
        ) : null}
        <h1 className="display-title !text-pink !text-4xl md:!text-5xl">
          {author.name}
        </h1>
        {author.bio ? (
          <div className="text-muted max-w-xl">
            <PortableTextRenderer value={author.bio} />
          </div>
        ) : null}
        {author.socialLinks?.length ? (
          <SocialIcons socials={author.socialLinks} />
        ) : null}
      </header>

      {author.articles?.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {author.articles.map((a) => (
            <ArticleCard key={a._id} article={a} variant="grid" />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No stories yet"
          body={`${author.name} hasn't published anything yet.`}
          ctaHref="/"
        />
      )}
    </div>
  );
}
