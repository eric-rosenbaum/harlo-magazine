import { groq } from "next-sanity";

/* ── Reusable GROQ fragments ──────────────────────────────────────────────── */

// Image with the metadata next/image needs for blur placeholders + dimensions.
const imageFragment = groq`
  ...,
  "alt": coalesce(alt, ""),
  asset->{
    _id,
    "lqip": metadata.lqip,
    "dimensions": metadata.dimensions
  }
`;

const authorRefFragment = groq`
  _id,
  name,
  "slug": slug.current,
  photo{ ${imageFragment} }
`;

const categoryRefFragment = groq`
  _id,
  title,
  "slug": slug.current,
  accentColor
`;

// Card-sized article projection (lists, rails, grids).
export const articleCardProjection = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  dek,
  excerpt,
  publishedAt,
  featured,
  trending,
  trendingRank,
  tags,
  "readTimeSource": pt::text(body),
  heroImage{ ${imageFragment} },
  category->{ ${categoryRefFragment} },
  authors[]->{ ${authorRefFragment} }
`;

/* ── Settings ─────────────────────────────────────────────────────────────── */

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    logoWide{ ${imageFragment} },
    logoBadge{ ${imageFragment} },
    socials,
    subscribeUrl,
    newsletter,
    footer,
    homepageHeroOverride->{ ${articleCardProjection} }
  }
`;

export const navCategoriesQuery = groq`
  *[_type == "category"] | order(navOrder asc, title asc){
    ${categoryRefFragment},
    description
  }
`;

/* ── Homepage ─────────────────────────────────────────────────────────────── */

export const homepageQuery = groq`{
  "hero": coalesce(
    *[_type == "siteSettings"][0].homepageHeroOverride->{ ${articleCardProjection} },
    *[_type == "article" && featured == true && defined(publishedAt)]
      | order(publishedAt desc)[0]{ ${articleCardProjection} },
    *[_type == "article" && defined(publishedAt)]
      | order(publishedAt desc)[0]{ ${articleCardProjection} }
  ),
  "secondaryFeatures": *[_type == "article" && featured == true && defined(publishedAt)]
    | order(publishedAt desc)[1...3]{ ${articleCardProjection} },
  "latest": *[_type == "article" && defined(publishedAt)]
    | order(publishedAt desc)[0...6]{ ${articleCardProjection} },
  "trending": *[_type == "article" && trending == true && defined(publishedAt)]
    | order(coalesce(trendingRank, 999) asc, publishedAt desc){ ${articleCardProjection} },
  "categoryStrips": *[_type == "category"] | order(navOrder asc, title asc){
    ${categoryRefFragment},
    "articles": *[_type == "article" && references(^._id) && defined(publishedAt)]
      | order(publishedAt desc)[0...4]{ ${articleCardProjection} }
  },
  "latestIssue": *[_type == "issue" && defined(publishedAt)]
    | order(publishedAt desc)[0]{
      _id, issueNumber, title, "slug": slug.current, description,
      coverImage{ ${imageFragment} }
    }
}`;

/* ── Category ─────────────────────────────────────────────────────────────── */

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0]{
    ${categoryRefFragment},
    description
  }
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && category->slug.current == $slug && defined(publishedAt)]
    | order(publishedAt desc)[$start...$end]{ ${articleCardProjection} }
`;

export const articlesByCategoryCountQuery = groq`
  count(*[_type == "article" && category->slug.current == $slug && defined(publishedAt)])
`;

export const allCategorySlugsQuery = groq`
  *[_type == "category" && defined(slug.current)].slug.current
`;

/* ── Article ──────────────────────────────────────────────────────────────── */

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug && category->slug.current == $category][0]{
    ${articleCardProjection},
    "authors": authors[]->{
      ${authorRefFragment},
      bio,
      socialLinks
    },
    body[]{
      ...,
      _type == "image" => { ${imageFragment} },
      _type == "issueLink" => {
        issue->{
          _id, issueNumber, title, "slug": slug.current,
          coverImage{ ${imageFragment} }
        }
      },
      markDefs[]{
        ...,
        _type == "link" && defined(reference) => {
          "reference": reference->{ _type, "slug": slug.current, "category": category->slug.current }
        }
      }
    },
    relatedIssue->{
      _id, issueNumber, title, "slug": slug.current,
      coverImage{ ${imageFragment} }
    },
    seo,
    "moreFromCategory": *[
      _type == "article" &&
      category->slug.current == $category &&
      slug.current != $slug &&
      defined(publishedAt)
    ] | order(publishedAt desc)[0...3]{ ${articleCardProjection} }
  }
`;

export const allArticlePathsQuery = groq`
  *[_type == "article" && defined(slug.current) && defined(category->slug.current)]{
    "slug": slug.current,
    "category": category->slug.current
  }
`;

/* ── Issues ───────────────────────────────────────────────────────────────── */

export const issuesIndexQuery = groq`
  *[_type == "issue" && defined(publishedAt)] | order(publishedAt desc){
    _id, issueNumber, title, "slug": slug.current, description, publishedAt,
    coverImage{ ${imageFragment} },
    "accentColor": null
  }
`;

export const issueBySlugQuery = groq`
  *[_type == "issue" && slug.current == $slug][0]{
    _id, issueNumber, title, "slug": slug.current, description, publishedAt,
    allowDownload,
    coverImage{ ${imageFragment} },
    "pdfUrl": pdfFile.asset->url,
    "pdfSize": pdfFile.asset->size,
    credits,
    seo,
    featuredArticles[]->{ ${articleCardProjection} },
    "otherIssues": *[_type == "issue" && defined(publishedAt) && _id != ^._id]
      | order(publishedAt desc){
        _id, issueNumber, title, "slug": slug.current,
        coverImage{ ${imageFragment} }
      }
  }
`;

export const allIssueSlugsQuery = groq`
  *[_type == "issue" && defined(slug.current)].slug.current
`;

/* ── Author ───────────────────────────────────────────────────────────────── */

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0]{
    ${authorRefFragment},
    bio,
    socialLinks,
    "articles": *[_type == "article" && references(^._id) && defined(publishedAt)]
      | order(publishedAt desc){ ${articleCardProjection} }
  }
`;

export const allAuthorSlugsQuery = groq`
  *[_type == "author" && defined(slug.current)].slug.current
`;

/* ── Pages (About / Contact / etc.) ───────────────────────────────────────── */

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    body,
    seo
  }
`;

export const allPageSlugsQuery = groq`
  *[_type == "page" && defined(slug.current)].slug.current
`;

/* ── Search ───────────────────────────────────────────────────────────────── */

export const searchQuery = groq`
  *[_type == "article" && defined(publishedAt) && (
    title match $q ||
    dek match $q ||
    excerpt match $q ||
    pt::text(body) match $q ||
    count(authors[@->name match $q]) > 0
  )] | order(publishedAt desc)[0...30]{ ${articleCardProjection} }
`;

/* ── Feeds / sitemap ──────────────────────────────────────────────────────── */

export const allContentForSitemapQuery = groq`{
  "articles": *[_type == "article" && defined(slug.current) && defined(category->slug.current)]{
    "slug": slug.current, "category": category->slug.current, _updatedAt, publishedAt
  },
  "issues": *[_type == "issue" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "categories": *[_type == "category" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "authors": *[_type == "author" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "pages": *[_type == "page" && defined(slug.current)]{ "slug": slug.current, _updatedAt }
}`;

export const rssArticlesQuery = groq`
  *[_type == "article" && defined(publishedAt)] | order(publishedAt desc)[0...30]{
    title,
    "slug": slug.current,
    "category": category->slug.current,
    dek,
    excerpt,
    publishedAt,
    authors[]->{ name }
  }
`;
