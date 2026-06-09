/**
 * Centralized slug → URL resolution.
 *
 * Every link in the app routes through these helpers, so switching to flat
 * article URLs (or any future scheme) is a one-file change.
 */
import type { ArticleCard, IssueRef } from "./types";

export function articlePath(
  article: Pick<ArticleCard, "slug" | "category">
): string {
  const category = article.category?.slug ?? "culture";
  return `/${category}/${article.slug}`;
}

export function articlePathFromParts(category: string, slug: string): string {
  return `/${category}/${slug}`;
}

export function categoryPath(slug: string): string {
  return `/${slug}`;
}

export function issuePath(issue: Pick<IssueRef, "slug">): string {
  return `/issues/${issue.slug}`;
}

export function authorPath(slug: string): string {
  return `/author/${slug}`;
}

export const absoluteUrl = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
};
