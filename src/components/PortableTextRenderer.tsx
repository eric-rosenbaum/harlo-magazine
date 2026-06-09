import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import Link from "next/link";

import { SanityImage } from "./SanityImage";
import { EmbedRenderer } from "./EmbedRenderer";
import { IssuePromoCard } from "./IssuePromoCard";
import type { SanityImage as SanityImageType, IssueRef } from "@/lib/types";

type ImageValue = SanityImageType & {
  size?: "inline" | "wide" | "full-bleed";
};

type LinkMark = {
  _type: "link";
  linkType?: "internal" | "external";
  href?: string;
  reference?: { _type: string; slug?: string; category?: string };
};

function internalHref(ref?: LinkMark["reference"]): string {
  if (!ref?.slug) return "#";
  if (ref._type === "article" && ref.category) {
    return `/${ref.category}/${ref.slug}`;
  }
  if (ref._type === "issue") return `/issues/${ref.slug}`;
  return `/${ref.slug}`;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const mark = value as LinkMark;
      if (mark.reference) {
        return <Link href={internalHref(mark.reference)}>{children}</Link>;
      }
      const href = mark.href ?? "#";
      const external = /^https?:/.test(href);
      return (
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const img = value as ImageValue;
      const size = img.size ?? "inline";
      const wrapperClass =
        size === "full-bleed"
          ? "my-10 w-screen relative left-1/2 right-1/2 -mx-[50vw]"
          : size === "wide"
            ? "my-8 w-full lg:w-[120%] lg:-ml-[10%]"
            : "my-6";
      return (
        <figure className={wrapperClass}>
          <SanityImage
            image={img}
            fill={false}
            width={img.asset?.dimensions?.width ?? 1600}
            height={img.asset?.dimensions?.height ?? 1067}
            sizes={size === "full-bleed" ? "100vw" : "(max-width: 768px) 100vw, 768px"}
            className="w-full h-auto"
          />
          {(img.caption || img.credit) && (
            <figcaption className="meta mt-2">
              {img.caption}
              {img.caption && img.credit ? " · " : ""}
              {img.credit}
            </figcaption>
          )}
        </figure>
      );
    },
    pullQuote: ({ value }) => {
      const v = value as { quote: string; attribution?: string };
      return (
        <figure className="my-10 border-y border-rule py-6">
          <blockquote className="font-head text-pink text-2xl md:text-3xl leading-tight uppercase tracking-tight !border-0 !pl-0 !not-italic">
            “{v.quote}”
          </blockquote>
          {v.attribution ? (
            <figcaption className="meta mt-3">— {v.attribution}</figcaption>
          ) : null}
        </figure>
      );
    },
    embed: ({ value }) => {
      const v = value as { url: string; caption?: string };
      return <EmbedRenderer url={v.url} caption={v.caption} />;
    },
    issueLink: ({ value }) => {
      const v = value as { issue?: IssueRef };
      if (!v.issue) return null;
      return (
        <div className="my-8">
          <IssuePromoCard issue={v.issue} />
        </div>
      );
    },
  },
};

export function PortableTextRenderer({
  value,
  className,
}: {
  value?: PortableTextBlock[];
  className?: string;
}) {
  if (!value?.length) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
