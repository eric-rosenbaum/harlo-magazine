"use client";

import { useState } from "react";

import { ArticleCard } from "./ArticleCard";
import { CATEGORY_PAGE_SIZE } from "@/lib/constants";
import type { ArticleCard as ArticleCardType } from "@/lib/types";

/**
 * Progressive "Load more" for category pages. Renders the server-provided first
 * page, then fetches subsequent pages from /api/articles on demand.
 */
export function LoadMore({
  categorySlug,
  initial,
  total,
}: {
  categorySlug: string;
  initial: ArticleCardType[];
  total: number;
}) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const hasMore = items.length < total;

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const start = items.length;
      const end = start + CATEGORY_PAGE_SIZE;
      const res = await fetch(
        `/api/articles?category=${encodeURIComponent(
          categorySlug
        )}&start=${start}&end=${end}`
      );
      if (!res.ok) throw new Error("bad response");
      const more = (await res.json()) as ArticleCardType[];
      setItems((prev) => [...prev, ...more]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article, i) => (
          <ArticleCard
            key={article._id}
            article={article}
            variant="grid"
            priority={i < 3}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-12 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="border border-rule px-8 py-3 section-title !text-pink !text-sm hover:bg-pink hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
          {error ? (
            <p className="text-sm text-pink" role="alert">
              Couldn&apos;t load more — tap to try again.
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
