import Image from "next/image";

import { urlForImage } from "@/sanity/image";
import { cn } from "@/lib/utils";
import type { SanityImage as SanityImageType } from "@/lib/types";

interface BaseProps {
  image?: SanityImageType;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

type Props =
  | (BaseProps & { fill: true; width?: never; height?: never })
  | (BaseProps & { fill?: false; width: number; height: number });

/**
 * next/image wrapper for Sanity assets: responsive srcset via next/image,
 * LQIP blur placeholder from Sanity metadata, and the asset's `alt`.
 */
export function SanityImage({
  image,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  fill,
  width,
  height,
}: Props) {
  if (!image?.asset) {
    return (
      <div
        className={cn("bg-[#f2f2f2]", className)}
        aria-hidden="true"
        style={fill ? undefined : { width, height }}
      />
    );
  }

  const blurDataURL = image.asset.lqip;
  const altText = alt ?? image.alt ?? "";

  // Request a generous max width; next/image derives the responsive srcset.
  const src = urlForImage(image).width(1600).url();

  const common = {
    alt: altText,
    sizes,
    priority,
    placeholder: blurDataURL ? ("blur" as const) : undefined,
    blurDataURL,
    className: cn("object-cover", className),
  };

  if (fill) {
    return <Image src={src} fill {...common} />;
  }

  return <Image src={src} width={width} height={height} {...common} />;
}
