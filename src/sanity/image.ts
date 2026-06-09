import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

import { dataset, projectId } from "./env";
import type { SanityImage } from "@/lib/types";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Build a Sanity CDN image URL. Always set width/height/format at the call site
 * (or via next/image) for responsive, optimized delivery.
 */
export function urlForImage(source: SanityImage) {
  return builder
    .image(source as unknown as SanityImageSource)
    .auto("format")
    .fit("max");
}

/** Convenience: a plain string URL at a given width (used for OG images, etc.). */
export function urlForImageSrc(source: SanityImage, width = 1200): string {
  return urlForImage(source).width(width).url();
}
