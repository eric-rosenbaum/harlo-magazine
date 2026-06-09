import type { PortableTextBlock } from "@portabletext/react";

export type AccentColor = "pink" | "orange" | "yellow" | "lime" | "blue";

export interface SanityImageAsset {
  _id: string;
  lqip?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
}

export interface SanityImage {
  _type?: "image";
  alt?: string;
  caption?: string;
  credit?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  asset?: SanityImageAsset & { _ref?: string };
}

export interface CategoryRef {
  _id: string;
  title: string;
  slug: string;
  accentColor?: AccentColor;
  description?: string;
}

export interface AuthorRef {
  _id: string;
  name: string;
  slug: string;
  photo?: SanityImage;
}

export interface Author extends AuthorRef {
  bio?: PortableTextBlock[];
  socialLinks?: SocialLink[];
  articles?: ArticleCard[];
}

export interface SocialLink {
  platform: "instagram" | "twitter" | "tiktok" | string;
  url: string;
}

export interface ArticleCard {
  _id: string;
  _type: "article";
  title: string;
  slug: string;
  dek?: string;
  excerpt?: string;
  publishedAt: string;
  featured?: boolean;
  trending?: boolean;
  trendingRank?: number;
  tags?: string[];
  /** Plain-text body used to derive read time on the client/server. */
  readTimeSource?: string;
  heroImage?: SanityImage;
  category?: CategoryRef;
  authors?: AuthorRef[];
}

export interface Article extends ArticleCard {
  /** On the full article, authors carry their bio + social links. */
  authors?: Author[];
  body?: PortableTextBlock[];
  relatedIssue?: IssueRef;
  seo?: Seo;
  moreFromCategory?: ArticleCard[];
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
}

export interface IssueRef {
  _id: string;
  issueNumber: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: SanityImage;
}

export interface Issue extends IssueRef {
  publishedAt: string;
  allowDownload?: boolean;
  pdfUrl?: string;
  pdfSize?: number;
  credits?: PortableTextBlock[];
  seo?: Seo;
  featuredArticles?: ArticleCard[];
  otherIssues?: IssueRef[];
}

export interface SiteSettings {
  logoWide?: SanityImage;
  logoBadge?: SanityImage;
  socials?: SocialLink[];
  subscribeUrl?: string;
  newsletter?: { heading?: string; blurb?: string };
  footer?: PortableTextBlock[];
  homepageHeroOverride?: ArticleCard;
}

export interface Page {
  title: string;
  slug: string;
  body?: PortableTextBlock[];
  seo?: Seo;
}

export interface HomepageData {
  hero: ArticleCard | null;
  secondaryFeatures: ArticleCard[];
  latest: ArticleCard[];
  trending: ArticleCard[];
  categoryStrips: (CategoryRef & { articles: ArticleCard[] })[];
  latestIssue: IssueRef | null;
}
