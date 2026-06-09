import { sanityFetch } from "@/sanity/lib/fetch";
import { rssArticlesQuery } from "@/sanity/lib/queries";
import { absoluteUrl } from "@/lib/paths";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const revalidate = 3600;

interface RssArticle {
  title: string;
  slug: string;
  category: string;
  dek?: string;
  excerpt?: string;
  publishedAt: string;
  authors?: { name: string }[];
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) =>
    c === "<"
      ? "&lt;"
      : c === ">"
        ? "&gt;"
        : c === "&"
          ? "&amp;"
          : c === "'"
            ? "&apos;"
            : "&quot;"
  );
}

export async function GET() {
  const articles =
    (await sanityFetch<RssArticle[]>({
      query: rssArticlesQuery,
      tags: ["article"],
    })) ?? [];

  const items = articles
    .map((a) => {
      const link = absoluteUrl(`/${a.category}/${a.slug}`);
      const description = a.excerpt || a.dek || "";
      const author = a.authors?.map((x) => x.name).join(", ") ?? "";
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      ${author ? `<dc:creator>${escapeXml(author)}</dc:creator>` : ""}
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
