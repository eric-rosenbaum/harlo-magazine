import Link from "next/link";

import { SanityImage } from "./SanityImage";
import { issuePath } from "@/lib/paths";
import type { IssueRef } from "@/lib/types";

export function IssuePromoCard({ issue }: { issue: IssueRef }) {
  return (
    <Link
      href={issuePath(issue)}
      className="group flex items-center gap-5 border border-rule p-4 transition-colors hover:bg-[#fafafa]"
    >
      <div className="w-20 shrink-0 aspect-[3/4] overflow-hidden bg-[#f2f2f2]">
        <SanityImage
          image={issue.coverImage}
          fill={false}
          width={160}
          height={213}
          sizes="80px"
          className="h-full w-full"
        />
      </div>
      <div>
        <p className="kicker text-pink mb-1">Read this in</p>
        <p className="font-head font-bold uppercase leading-tight">
          Issue {issue.issueNumber} — {issue.title}
        </p>
        <span className="meta mt-2 inline-block group-hover:text-pink">
          Open the flipbook →
        </span>
      </div>
    </Link>
  );
}
