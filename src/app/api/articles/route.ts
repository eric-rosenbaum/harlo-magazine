import { NextResponse, type NextRequest } from "next/server";

import { sanityFetch } from "@/sanity/lib/fetch";
import { articlesByCategoryQuery } from "@/sanity/lib/queries";
import type { ArticleCard } from "@/lib/types";

/** Paginated article fetch backing the category "Load more" button. */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const start = Number(searchParams.get("start") ?? "0");
  const end = Number(searchParams.get("end") ?? "12");

  if (!category || Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return NextResponse.json([], { status: 400 });
  }

  const articles = await sanityFetch<ArticleCard[]>({
    query: articlesByCategoryQuery,
    params: { slug: category, start, end },
    tags: ["article"],
  });

  return NextResponse.json(articles ?? []);
}
