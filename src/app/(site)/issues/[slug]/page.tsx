import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { allIssueSlugsQuery, issueBySlugQuery } from "@/sanity/lib/queries";
import { FlipbookLoader } from "@/components/flipbook/FlipbookLoader";
import { SanityImage } from "@/components/SanityImage";
import { ArticleCard } from "@/components/ArticleCard";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { EmptyState } from "@/components/EmptyState";
import { buildMetadata } from "@/lib/metadata";
import { issuePath } from "@/lib/paths";
import type { Issue } from "@/lib/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: allIssueSlugsQuery,
    tags: ["issue"],
  });
  return (slugs ?? []).map((slug) => ({ slug }));
}

async function getIssue(slug: string) {
  return sanityFetch<Issue>({
    query: issueBySlugQuery,
    params: { slug },
    tags: ["issue"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) return {};
  return buildMetadata({
    title: `Issue ${issue.issueNumber} — ${issue.title}`,
    description: issue.description,
    path: `/issues/${slug}`,
    image: issue.coverImage,
    seo: issue.seo,
  });
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) notFound();

  return (
    <div className="container-page py-8">
      {/* Header */}
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3 mb-8">
        <h1 className="font-head font-extrabold uppercase tracking-tight text-pink text-2xl md:text-4xl">
          Issue {issue.issueNumber} — {issue.title}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)_240px]">
        {/* Left rail — other issues */}
        <aside className="order-2 lg:order-1">
          <p className="kicker mb-4">Other Issues</p>
          {issue.otherIssues?.length ? (
            <div className="flex gap-4 overflow-x-auto lg:flex-col lg:overflow-visible no-scrollbar">
              {issue.otherIssues.map((other) => (
                <Link
                  key={other._id}
                  href={issuePath(other)}
                  className="group block w-28 shrink-0 lg:w-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f2f2] mb-2">
                    <SanityImage image={other.coverImage} fill sizes="120px" />
                  </div>
                  <p className="meta group-hover:text-pink">
                    Issue {other.issueNumber}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">This is the first issue.</p>
          )}
        </aside>

        {/* Center — flipbook */}
        <div className="order-1 lg:order-2">
          {issue.pdfUrl ? (
            <FlipbookLoader
              url={issue.pdfUrl}
              title={`Issue ${issue.issueNumber} — ${issue.title}`}
              allowDownload={issue.allowDownload}
            />
          ) : (
            <EmptyState
              title="This issue isn't ready"
              body="The PDF for this issue hasn't been uploaded yet."
              ctaHref="/issues"
              ctaLabel="Back to issues"
            />
          )}

          {issue.description ? (
            <p className="text-lg mt-6 max-w-2xl">{issue.description}</p>
          ) : null}

          {issue.credits ? (
            <div className="mt-8 border-t border-rule pt-6 text-sm text-muted max-w-2xl">
              <p className="kicker mb-2">Credits</p>
              <PortableTextRenderer value={issue.credits} />
            </div>
          ) : null}
        </div>

        {/* Right rail — from the magazine */}
        <aside className="order-3">
          <p className="kicker mb-4">From the Magazine</p>
          {issue.featuredArticles?.length ? (
            <div className="flex flex-col">
              {issue.featuredArticles.map((a) => (
                <ArticleCard key={a._id} article={a} variant="trending" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No related articles yet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
