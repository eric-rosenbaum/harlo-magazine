import Link from "next/link";

import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  href,
  seeAllHref,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  seeAllHref?: string;
  className?: string;
}) {
  const title = <span className="section-title">{children}</span>;
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-rule pb-2 mb-5",
        className
      )}
    >
      {href ? <Link href={href}>{title}</Link> : title}
      {seeAllHref ? (
        <Link href={seeAllHref} className="meta hover:text-pink whitespace-nowrap">
          See all →
        </Link>
      ) : null}
    </div>
  );
}
