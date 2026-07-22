import Link from "next/link";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { issuesIndexQuery } from "@/sanity/lib/queries";
import { SanityImage } from "@/components/SanityImage";
import { EmptyState } from "@/components/EmptyState";
import { buildMetadata } from "@/lib/metadata";
import { issuePath } from "@/lib/paths";
import type { IssueRef } from "@/lib/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Issues",
    description: "Browse every print-style issue of Harlo as an on-site flipbook.",
    path: "/issues",
  });
}

export default async function IssuesPage() {
  const issues = await sanityFetch<IssueRef[]>({
    query: issuesIndexQuery,
    tags: ["issue"],
  });

  return (
    <div className="container-page py-12">
      <header className="mb-10 border-b border-rule pb-4">
        <h1 className="display-title">Issues</h1>
        <p className="text-lg text-muted mt-3 max-w-2xl">
          Every issue of Harlo, designed in print and readable here as a
          page-turning flipbook.
        </p>
      </header>

      {issues?.length ? (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Link key={issue._id} href={issuePath(issue)} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f2f2] mb-3">
                <SanityImage
                  image={issue.coverImage}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="font-head font-bold uppercase tracking-tight leading-tight group-hover:text-pink transition-colors">
                Issue {issue.issueNumber} — {issue.title}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No issues published yet"
          body="When the editor uploads an issue PDF, its cover will appear here."
          ctaHref="/"
        />
      )}
    </div>
  );
}
