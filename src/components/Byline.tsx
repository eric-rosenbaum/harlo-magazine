import Link from "next/link";
import { Fragment } from "react";

import { authorPath } from "@/lib/paths";
import { displayDate, readingTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AuthorRef } from "@/lib/types";

export function Byline({
  authors,
  publishedAt,
  readTimeSource,
  className,
  linkAuthors = true,
}: {
  authors?: AuthorRef[];
  publishedAt?: string;
  readTimeSource?: string;
  className?: string;
  linkAuthors?: boolean;
}) {
  return (
    <p className={cn("meta flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {authors?.length ? (
        <span>
          By{" "}
          {authors.map((a, i) => (
            <Fragment key={a._id}>
              {i > 0 ? ", " : ""}
              {linkAuthors ? (
                <Link href={authorPath(a.slug)} className="hover:text-pink">
                  {a.name}
                </Link>
              ) : (
                <span>{a.name}</span>
              )}
            </Fragment>
          ))}
        </span>
      ) : null}
      {publishedAt ? (
        <>
          <span aria-hidden>·</span>
          <time dateTime={publishedAt}>{displayDate(publishedAt)}</time>
        </>
      ) : null}
      {readTimeSource ? (
        <>
          <span aria-hidden>·</span>
          <span>{readingTime(readTimeSource)} min read</span>
        </>
      ) : null}
    </p>
  );
}
