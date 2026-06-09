import Link from "next/link";

export function EmptyState({
  title,
  body,
  ctaHref = "/",
  ctaLabel = "Back to home",
}: {
  title: string;
  body?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="container-page py-24 text-center">
      <h2 className="section-title mb-3">{title}</h2>
      {body ? <p className="text-muted max-w-md mx-auto mb-6">{body}</p> : null}
      <Link href={ctaHref} className="meta text-pink hover:underline">
        {ctaLabel} →
      </Link>
    </div>
  );
}
