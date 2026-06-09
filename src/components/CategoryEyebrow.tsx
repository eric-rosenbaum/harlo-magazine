import Link from "next/link";

import { accentHex } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoryRef } from "@/lib/types";

export function CategoryEyebrow({
  category,
  className,
  asLink = true,
}: {
  category?: CategoryRef;
  className?: string;
  asLink?: boolean;
}) {
  if (!category) return null;
  const color = accentHex(category.accentColor);
  const content = (
    <span className={cn("kicker", className)} style={{ color }}>
      {category.title}
    </span>
  );
  if (!asLink) return content;
  return (
    <Link href={`/${category.slug}`} className="inline-block">
      {content}
    </Link>
  );
}
