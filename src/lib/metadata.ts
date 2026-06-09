import type { Metadata } from "next";

import { urlForImageSrc } from "@/sanity/image";
import type { SanityImage, Seo } from "./types";

interface BuildMetadataArgs {
  title?: string;
  description?: string;
  path: string;
  /** Preferred OG image (already a SanityImage). */
  image?: SanityImage;
  /** SEO override object from the document. */
  seo?: Seo;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}

/**
 * Central metadata builder: applies SEO overrides, falls back to the hero/cover
 * image, and sets canonical + OG/Twitter consistently for every page.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  seo,
  type = "website",
  publishedTime,
  authors,
}: BuildMetadataArgs): Metadata {
  const finalTitle = seo?.metaTitle || title;
  const finalDescription = seo?.metaDescription || description;
  const ogSource = seo?.ogImage ?? image;
  const ogImage = ogSource?.asset ? urlForImageSrc(ogSource, 1200) : undefined;

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: { canonical: path },
    openGraph: {
      title: finalTitle ?? undefined,
      description: finalDescription ?? undefined,
      url: path,
      type,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(authors?.length ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle ?? undefined,
      description: finalDescription ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
