import Link from "next/link";

import { SanityImage } from "./SanityImage";
import { PortableTextRenderer } from "./PortableTextRenderer";
import { SocialIcons } from "./SocialIcons";
import { authorPath } from "@/lib/paths";
import type { Author } from "@/lib/types";

export function AuthorBio({ author }: { author: Author }) {
  return (
    <div className="flex gap-4 items-start">
      {author.photo?.asset ? (
        <Link href={authorPath(author.slug)} className="shrink-0">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#f2f2f2]">
            <SanityImage image={author.photo} fill sizes="56px" />
          </div>
        </Link>
      ) : null}
      <div className="min-w-0">
        <Link href={authorPath(author.slug)}>
          <p className="font-head font-bold uppercase tracking-tight hover:text-pink">
            {author.name}
          </p>
        </Link>
        {author.bio ? (
          <div className="text-sm text-muted mt-1">
            <PortableTextRenderer value={author.bio} />
          </div>
        ) : null}
        {author.socialLinks?.length ? (
          <div className="mt-2">
            <SocialIcons socials={author.socialLinks} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
