import Link from "next/link";

import { SanityImage } from "./SanityImage";
import { CategoryEyebrow } from "./CategoryEyebrow";
import { Byline } from "./Byline";
import { articlePath } from "@/lib/paths";
import { cn } from "@/lib/utils";
import type { ArticleCard as ArticleCardType } from "@/lib/types";

type Variant = "feature" | "list" | "trending" | "grid";

export function ArticleCard({
  article,
  variant = "grid",
  priority = false,
  className,
}: {
  article: ArticleCardType;
  variant?: Variant;
  priority?: boolean;
  className?: string;
}) {
  const href = articlePath(article);
  const dek = article.dek;

  if (variant === "feature") {
    return (
      <article className={cn("group", className)}>
        <Link href={href} className="block">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f2f2f2] mb-4">
            <SanityImage
              image={article.heroImage}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <CategoryEyebrow category={article.category} asLink={false} />
          <h2 className="font-head font-extrabold uppercase tracking-tight leading-[0.98] text-3xl md:text-5xl mt-2 mb-3 text-pink">
            {article.title}
          </h2>
          {dek ? (
            <p className="font-body text-lg md:text-xl text-ink/90 mb-3 max-w-2xl">
              {dek}
            </p>
          ) : null}
        </Link>
        <Byline
          authors={article.authors}
          publishedAt={article.publishedAt}
          readTimeSource={article.readTimeSource}
        />
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className={cn("group flex gap-3 py-3 border-b border-rule/15", className)}>
        <Link href={href} className="shrink-0">
          <div className="relative w-20 h-20 overflow-hidden bg-[#f2f2f2]">
            <SanityImage
              image={article.heroImage}
              fill
              sizes="80px"
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>
        <div className="min-w-0">
          <CategoryEyebrow category={article.category} />
          <Link href={href}>
            <h3 className="font-body font-medium leading-snug mt-1 group-hover:text-pink transition-colors">
              {article.title}
            </h3>
          </Link>
          <Byline
            authors={article.authors}
            publishedAt={article.publishedAt}
            readTimeSource={article.readTimeSource}
            linkAuthors={false}
            className="mt-1"
          />
        </div>
      </article>
    );
  }

  if (variant === "trending") {
    return (
      <article className={cn("group py-3 border-b border-rule/15", className)}>
        <CategoryEyebrow category={article.category} />
        <Link href={href}>
          <h3 className="font-body font-medium leading-snug mt-1 group-hover:text-pink transition-colors">
            {article.title}
          </h3>
        </Link>
        <Byline
          authors={article.authors}
          publishedAt={article.publishedAt}
          readTimeSource={article.readTimeSource}
          linkAuthors={false}
          className="mt-1"
        />
      </article>
    );
  }

  // grid (default)
  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f2f2f2] mb-3">
          <SanityImage
            image={article.heroImage}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <CategoryEyebrow category={article.category} asLink={false} />
        <h3 className="font-body font-medium text-lg leading-snug mt-1 mb-1 group-hover:text-pink transition-colors">
          {article.title}
        </h3>
        {dek ? <p className="text-muted text-sm mb-2 line-clamp-2">{dek}</p> : null}
      </Link>
      <Byline
        authors={article.authors}
        publishedAt={article.publishedAt}
        readTimeSource={article.readTimeSource}
      />
    </article>
  );
}
