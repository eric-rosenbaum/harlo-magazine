import "server-only";

import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";

import { client } from "../client";
import { isSanityConfigured, readToken } from "../env";

export type SanityTag =
  | "article"
  | "issue"
  | "category"
  | "author"
  | "page"
  | "siteSettings";

interface FetchOptions {
  query: string;
  params?: QueryParams;
  tags?: SanityTag[];
  /** Seconds for time-based ISR. On-demand revalidation via tags is primary. */
  revalidate?: number;
}

/**
 * Single entry point for all server-side Sanity reads.
 *
 * - In Draft Mode it reads unpublished drafts with stega encoding so the
 *   Presentation tool can overlay edit affordances.
 * - Otherwise it reads the published perspective from the CDN, cached and keyed
 *   by content-type tags so the `/api/revalidate` webhook can bust them.
 * - If no real Sanity project is connected yet, it resolves to `null` instead of
 *   throwing, so the site builds and renders empty states.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 3600,
}: FetchOptions): Promise<T | null> {
  if (!isSanityConfigured) {
    return null;
  }

  // draftMode() is unavailable in non-request contexts like generateStaticParams
  // (and sitemap generation). Outside a request, always read the published set.
  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch {
    isDraft = false;
  }

  try {
    if (isDraft) {
      if (!readToken) {
        throw new Error(
          "Draft Mode is on but SANITY_API_READ_TOKEN is not set."
        );
      }
      return await client.fetch<T>(query, params, {
        token: readToken,
        perspective: "drafts",
        useCdn: false,
        stega: true,
        next: { revalidate: 0, tags },
      });
    }

    return await client.fetch<T>(query, params, {
      perspective: "published",
      useCdn: true,
      next: { revalidate, tags },
    });
  } catch (error) {
    console.error("[sanityFetch] query failed:", error);
    return null;
  }
}
