import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { searchQuery } from "@/sanity/lib/queries";
import { SearchBox } from "@/components/SearchBox";
import { ArticleCard } from "@/components/ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query
    ? await sanityFetch<ArticleCardType[]>({
        query: searchQuery,
        params: { q: `${query}*` },
        tags: ["article"],
      })
    : null;

  return (
    <div className="container-page py-12">
      <h1 className="display-title mb-6">Search</h1>
      <div className="max-w-xl mb-12">
        <SearchBox initialQuery={query} autoFocus={!query} />
      </div>

      {query ? (
        results && results.length > 0 ? (
          <>
            <p className="meta mb-6">
              {results.length} result{results.length === 1 ? "" : "s"} for
              “{query}”
            </p>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a._id} article={a} variant="grid" />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16">
            <h2 className="section-title mb-3">No results for “{query}”</h2>
            <p className="text-muted max-w-md">
              Try a different word, or browse by section in the navigation above.
            </p>
          </div>
        )
      ) : (
        <p className="text-muted">
          Search Harlo&apos;s articles by headline, dek, or text.
        </p>
      )}
    </div>
  );
}
